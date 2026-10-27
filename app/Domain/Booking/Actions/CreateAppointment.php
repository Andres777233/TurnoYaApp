<?php

namespace App\Domain\Booking\Actions;

use App\Domain\Booking\Enums\AppointmentStatus;
use App\Domain\Booking\Exceptions\BookingException;
use App\Domain\Scheduling\AvailabilityService;
use App\Models\Appointment;
use App\Models\AppointmentStatusHistory;
use App\Models\Business;
use App\Models\ProfessionalProfile;
use App\Models\Service;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * Creates an appointment with three layers of protection against double
 * booking: an advisory lock, a server-side revalidation and a PostgreSQL
 * exclusion constraint.
 */
class CreateAppointment
{
    public function __construct(private readonly AvailabilityService $availability) {}

    public function handle(
        User $customer,
        Business $business,
        Service $service,
        ?ProfessionalProfile $professional,
        CarbonInterface $startsAt,
        ?string $notes = null,
    ): Appointment {
        abort_unless($service->business_id === $business->id && $service->is_active, 404);

        $timezone = $business->timezone ?: 'America/Bogota';
        $localDate = CarbonImmutable::instance($startsAt)->setTimezone($timezone);

        return DB::transaction(function () use ($customer, $business, $service, $professional, $startsAt, $notes, $localDate) {
            // One lock per business and local day: coarse enough to be safe,
            // fine enough that a salon never blocks other days.
            DB::select('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [
                'booking:'.$business->id.':'.$localDate->toDateString(),
            ]);

            $resolved = $professional ?? $this->pickProfessional($business, $service, $localDate, $startsAt);

            if (! $resolved) {
                throw BookingException::outsideSchedule();
            }

            if (! $this->availability->isBookable($business, $service, $resolved, $startsAt)) {
                throw BookingException::slotTaken();
            }

            $duration = $this->durationFor($service, $resolved);
            $price = $this->priceFor($service, $resolved);

            $start = CarbonImmutable::instance($startsAt)->setTimezone('UTC');
            $end = $start->addMinutes($duration);
            $blockedUntil = $end->addMinutes((int) $service->buffer_minutes);

            try {
                $appointment = Appointment::create([
                    'code' => Appointment::generateCode(),
                    'business_id' => $business->id,
                    'professional_profile_id' => $resolved->id,
                    'service_id' => $service->id,
                    'customer_id' => $customer->id,
                    'starts_at' => $start,
                    'ends_at' => $end,
                    'blocked_until' => $blockedUntil,
                    'status' => AppointmentStatus::Confirmed,
                    'price_cents' => $price,
                    'currency' => 'COP',
                    'payment_policy' => $business->setting('payment_policy', 'none'),
                    'payment_due_cents' => 0,
                    'customer_notes' => $notes,
                    'created_by' => $customer->id,
                ]);
            } catch (QueryException $exception) {
                // 23P01 = exclusion_violation
                if (($exception->errorInfo[0] ?? null) === '23P01') {
                    throw BookingException::slotTaken();
                }

                throw $exception;
            }

            AppointmentStatusHistory::create([
                'appointment_id' => $appointment->id,
                'from_status' => null,
                'to_status' => AppointmentStatus::Confirmed->value,
                'actor_user_id' => $customer->id,
                'reason' => 'Reserva creada por el cliente',
            ]);

            return $appointment->load(['business', 'service', 'professional']);
        });
    }

    private function pickProfessional(
        Business $business,
        Service $service,
        CarbonImmutable $localDate,
        CarbonInterface $startsAt,
    ): ?ProfessionalProfile {
        $slots = $this->availability->slots($business, $service, null, $localDate);
        $target = $startsAt->getTimestamp();

        foreach ($slots as $slot) {
            if (CarbonImmutable::parse($slot['starts_at'])->getTimestamp() !== $target) {
                continue;
            }

            $ids = $slot['professional_ids'];

            return ProfessionalProfile::query()
                ->whereIn('id', $ids)
                ->orderBy('id')
                ->first();
        }

        return null;
    }

    private function durationFor(Service $service, ProfessionalProfile $professional): int
    {
        $pivot = $professional->services()->where('services.id', $service->id)->first()?->pivot;

        return (int) ($pivot?->duration_minutes ?: $service->duration_minutes);
    }

    private function priceFor(Service $service, ProfessionalProfile $professional): int
    {
        $pivot = $professional->services()->where('services.id', $service->id)->first()?->pivot;

        return (int) ($pivot?->price_cents ?? $service->price_cents);
    }
}
