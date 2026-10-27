<?php

namespace App\Domain\Scheduling;

use App\Domain\Booking\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\AvailabilityBlock;
use App\Models\Business;
use App\Models\ProfessionalProfile;
use App\Models\ScheduleBreak;
use App\Models\Service;
use App\Models\WorkingHour;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * Computes bookable slots. This is the only place allowed to decide whether a
 * time can be reserved — the UI merely renders what this returns.
 */
class AvailabilityService
{
    /**
     * @return array<int, array{starts_at: string, ends_at: string, local: string, professional_ids: array<int, int>}>
     */
    public function slots(
        Business $business,
        Service $service,
        ?ProfessionalProfile $professional,
        CarbonInterface $localDate,
    ): array {
        $timezone = $business->timezone ?: 'America/Bogota';
        $date = CarbonImmutable::instance($localDate)->setTimezone($timezone)->startOfDay();

        $dayStart = $date->setTimezone('UTC');
        $dayEnd = $date->endOfDay()->setTimezone('UTC');

        $professionals = $this->eligibleProfessionals($business, $service, $professional);

        if ($professionals->isEmpty()) {
            return [];
        }

        $businessWindows = $this->windowsFor($business, $date, $timezone);
        $interval = max(5, (int) $business->setting('slot_interval_minutes', 15));
        $minLead = max(0, (int) $business->setting('min_lead_minutes', 60));
        $horizonDays = max(1, (int) $business->setting('max_horizon_days', 60));

        $earliest = now()->addMinutes($minLead);
        $latest = now()->addDays($horizonDays);

        $duration = $this->durationFor($service, $professional);
        $buffer = (int) $service->buffer_minutes;

        $byStart = [];

        foreach ($professionals as $pro) {
            $proWindows = $this->windowsFor($pro, $date, $timezone);

            // A professional without explicit hours inherits the business hours.
            $windows = $proWindows->isEmpty() ? $businessWindows : $proWindows;

            if ($businessWindows->isNotEmpty() && $proWindows->isNotEmpty()) {
                $windows = $this->intersect($businessWindows, $proWindows);
            }

            if ($windows->isEmpty()) {
                continue;
            }

            $breaks = $this->breaksFor($pro, $date, $timezone, $windows)->all();
            $booked = $this->bookedRanges($pro, $dayStart, $dayEnd);
            $blocks = $this->blockedRanges($pro, $dayStart, $dayEnd);

            foreach ($windows as $window) {
                $cursor = $window['start'];

                while ($cursor->addMinutes($duration)->lessThanOrEqualTo($window['end'])) {
                    $slotStart = $cursor;
                    $slotEnd = $cursor->addMinutes($duration);
                    $blockedUntil = $slotEnd->addMinutes($buffer);
                    $cursor = $cursor->addMinutes($interval);

                    if ($slotStart->lessThan($earliest) || $slotStart->greaterThan($latest)) {
                        continue;
                    }

                    if ($this->overlapsAny($slotStart, $blockedUntil, $breaks)
                        || $this->overlapsAny($slotStart, $blockedUntil, $booked)
                        || $this->overlapsAny($slotStart, $blockedUntil, $blocks)) {
                        continue;
                    }

                    $key = $slotStart->getTimestamp();

                    $byStart[$key] ??= [
                        'starts_at' => $slotStart->toIso8601String(),
                        'ends_at' => $slotEnd->toIso8601String(),
                        'local' => $slotStart->setTimezone($timezone)->format('H:i'),
                        'professional_ids' => [],
                    ];

                    $byStart[$key]['professional_ids'][] = $pro->id;
                }
            }
        }

        ksort($byStart);

        return array_values($byStart);
    }

    /** Used inside the booking transaction for the authoritative re-check. */
    public function isBookable(
        Business $business,
        Service $service,
        ProfessionalProfile $professional,
        CarbonInterface $startsAt,
    ): bool {
        $slots = $this->slots(
            $business,
            $service,
            $professional,
            $startsAt->copy()->setTimezone($business->timezone),
        );

        $target = $startsAt->getTimestamp();

        foreach ($slots as $slot) {
            if (CarbonImmutable::parse($slot['starts_at'])->getTimestamp() === $target) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return Collection<int, ProfessionalProfile>
     */
    private function eligibleProfessionals(Business $business, Service $service, ?ProfessionalProfile $professional)
    {
        $query = ProfessionalProfile::query()
            ->where('business_id', $business->id)
            ->where('is_public', true)
            ->where('is_accepting_bookings', true)
            ->whereHas('services', fn ($q) => $q
                ->where('services.id', $service->id)
                ->where('professional_service.is_active', true));

        if ($professional) {
            $query->whereKey($professional->id);
        }

        return $query->orderBy('id')->get();
    }

    private function durationFor(Service $service, ?ProfessionalProfile $professional): int
    {
        if ($professional) {
            $pivot = $professional->services->firstWhere('id', $service->id)?->pivot;

            if ($pivot?->duration_minutes) {
                return (int) $pivot->duration_minutes;
            }
        }

        return (int) $service->duration_minutes;
    }

    /**
     * @return Collection<int, array{start: CarbonImmutable, end: CarbonImmutable}>
     */
    private function windowsFor(object $owner, CarbonImmutable $localDate, string $timezone)
    {
        $hours = WorkingHour::query()
            ->where('owner_type', $owner::class)
            ->where('owner_id', $owner->id)
            ->forWeekday($localDate->dayOfWeek)
            ->orderBy('start_time')
            ->get();

        return $hours->map(fn (WorkingHour $hour) => [
            'start' => $this->at($localDate, $hour->start_time, $timezone),
            'end' => $this->at($localDate, $hour->end_time, $timezone),
        ]);
    }

    /**
     * Breaks are stored against the working hour, so they inherit its owner.
     *
     * @return Collection<int, array{start: CarbonImmutable, end: CarbonImmutable}>
     */
    private function breaksFor(object $owner, CarbonImmutable $localDate, string $timezone, $windows)
    {
        if ($windows->isEmpty()) {
            return collect();
        }

        $hourIds = WorkingHour::query()
            ->where('owner_type', $owner::class)
            ->where('owner_id', $owner->id)
            ->forWeekday($localDate->dayOfWeek)
            ->pluck('id');

        return ScheduleBreak::query()
            ->whereIn('working_hour_id', $hourIds)
            ->get()
            ->map(fn ($break) => [
                'start' => $this->at($localDate, $break->start_time, $timezone),
                'end' => $this->at($localDate, $break->end_time, $timezone),
            ]);
    }

    /**
     * @return array<int, array{start: CarbonImmutable, end: CarbonImmutable}>
     */
    private function bookedRanges(ProfessionalProfile $professional, CarbonImmutable $dayStart, CarbonImmutable $dayEnd): array
    {
        return Appointment::query()
            ->where('professional_profile_id', $professional->id)
            ->whereIn('status', [
                AppointmentStatus::PendingPayment->value,
                AppointmentStatus::Confirmed->value,
                AppointmentStatus::AttendanceConfirmed->value,
                AppointmentStatus::Completed->value,
            ])
            ->where('starts_at', '<', $dayEnd)
            ->where('blocked_until', '>', $dayStart)
            ->get(['starts_at', 'blocked_until'])
            ->map(fn (Appointment $appointment) => [
                'start' => CarbonImmutable::instance($appointment->starts_at),
                'end' => CarbonImmutable::instance($appointment->blocked_until),
            ])
            ->all();
    }

    /**
     * @return array<int, array{start: CarbonImmutable, end: CarbonImmutable}>
     */
    private function blockedRanges(ProfessionalProfile $professional, CarbonImmutable $dayStart, CarbonImmutable $dayEnd): array
    {
        return AvailabilityBlock::query()
            ->where('professional_profile_id', $professional->id)
            ->overlapping($dayStart, $dayEnd)
            ->get(['starts_at', 'ends_at'])
            ->map(fn (AvailabilityBlock $block) => [
                'start' => CarbonImmutable::instance($block->starts_at),
                'end' => CarbonImmutable::instance($block->ends_at),
            ])
            ->all();
    }

    private function at(CarbonImmutable $localDate, string $time, string $timezone): CarbonImmutable
    {
        [$hour, $minute] = array_map('intval', explode(':', substr($time, 0, 5)));

        return $localDate
            ->setTimezone($timezone)
            ->setTime($hour, $minute)
            ->setTimezone('UTC');
    }

    private function overlapsAny(CarbonImmutable $start, CarbonImmutable $end, array $ranges): bool
    {
        foreach ($ranges as $range) {
            if ($start->lessThan($range['end']) && $end->greaterThan($range['start'])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Intersect two lists of windows, returning the overlapping segments.
     */
    private function intersect($first, $second)
    {
        $result = [];

        foreach ($first as $a) {
            foreach ($second as $b) {
                $start = $a['start']->greaterThan($b['start']) ? $a['start'] : $b['start'];
                $end = $a['end']->lessThan($b['end']) ? $a['end'] : $b['end'];

                if ($start->lessThan($end)) {
                    $result[] = ['start' => $start, 'end' => $end];
                }
            }
        }

        return collect($result);
    }
}
