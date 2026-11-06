<?php

namespace App\Http\Controllers;

use App\Domain\Booking\Actions\CancelAppointment;
use App\Domain\Booking\Actions\ConfirmAttendance;
use App\Domain\Booking\Enums\AppointmentStatus;
use App\Models\Appointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $upcoming = Appointment::query()
            ->with(['business', 'service', 'professional'])
            ->where('customer_id', $user->id)
            ->whereIn('status', [
                AppointmentStatus::PendingPayment->value,
                AppointmentStatus::Confirmed->value,
                AppointmentStatus::AttendanceConfirmed->value,
            ])
            ->where('starts_at', '>=', now()->subHours(2))
            ->orderBy('starts_at')
            ->limit(20)
            ->get();

        $past = Appointment::query()
            ->with(['business', 'service', 'professional'])
            ->where('customer_id', $user->id)
            ->where(function ($q) {
                $q->where('starts_at', '<', now()->subHours(2))
                    ->orWhereIn('status', [
                        AppointmentStatus::Cancelled->value,
                        AppointmentStatus::Completed->value,
                        AppointmentStatus::NoShow->value,
                    ]);
            })
            ->orderByDesc('starts_at')
            ->limit(20)
            ->get();

        $next = $upcoming->first();
        $reminder = null;

        if ($next) {
            $minutes = (int) now()->diffInMinutes($next->starts_at, false);

            if ($minutes > 0 && $minutes <= 35) {
                $reminder = [
                    'code' => $next->code,
                    'business' => $next->business->name,
                    'time' => $next->starts_at
                        ->copy()
                        ->setTimezone($next->business->timezone)
                        ->format('H:i'),
                    'minutes' => max(1, $minutes),
                ];
            }
        }

        $offerModels = \App\Models\VacancyOffer::query()
            ->open()
            ->whereIn('business_id', $user->favorites()->pluck('business_id'))
            ->with(['business', 'professional', 'service'])
            ->orderBy('starts_at')
            ->limit(3)
            ->get();

        $offers = $offerModels->map(fn (\App\Models\VacancyOffer $offer) => [
            'id' => $offer->id,
            'business' => $offer->business->name,
            'professional' => $offer->professional->display_name,
            'service' => $offer->service->name,
            'time' => $offer->starts_at->copy()
                ->setTimezone($offer->business->timezone)->format('H:i'),
            'price_cents' => $offer->service->price_cents,
        ]);

        return Inertia::render('appointments/index', [
            'upcoming' => $upcoming->map(fn (Appointment $a) => $this->present($a)),
            'past' => $past->map(fn (Appointment $a) => $this->present($a)),
            'reminder' => $reminder,
            'offers' => $offers,
        ]);
    }

    public function show(Appointment $appointment): Response
    {
        $this->authorize('view', $appointment);

        $appointment->load(['business', 'service', 'professional', 'history']);

        return Inertia::render('appointments/show', [
            'appointment' => [
                ...$this->present($appointment),
                'notes' => $appointment->customer_notes,
                'address' => $appointment->business->address_line,
                'neighborhood' => $appointment->business->neighborhood,
                'is_demo' => $appointment->business->is_demo,
                'cancellation_window_hours' => (int) $appointment->business->setting('cancellation_window_hours', 24),
            ],
        ]);
    }

    public function cancel(
        Request $request,
        Appointment $appointment,
        CancelAppointment $cancelAppointment,
    ): RedirectResponse {
        $this->authorize('cancel', $appointment);

        $reason = $request->string('reason')->toString() ?: null;

        $cancelAppointment->handle($appointment, $request->user(), $reason);

        return back()->with('success', 'Tu cita fue cancelada.');
    }

    public function confirm(
        Request $request,
        Appointment $appointment,
        ConfirmAttendance $confirmAttendance,
    ): RedirectResponse {
        $this->authorize('confirm', $appointment);

        $confirmAttendance->handle($appointment, $request->user());

        return back()->with('success', 'Asistencia confirmada.');
    }

    private function present(Appointment $appointment): array
    {
        $local = $appointment->starts_at
            ->copy()
            ->setTimezone($appointment->business->timezone);

        return [
            'code' => $appointment->code,
            'status' => $appointment->status->value,
            'status_label' => $appointment->status->label(),
            'status_tone' => $appointment->status->tone(),
            'starts_at' => $appointment->starts_at->toIso8601String(),
            'ends_at' => $appointment->ends_at->toIso8601String(),
            'date_label' => $local->locale('es')->translatedFormat('D, d M'),
            'time_label' => $local->format('H:i'),
            'price_cents' => $appointment->price_cents,
            'business_name' => $appointment->business->name,
            'business_slug' => $appointment->business->slug,
            'service_name' => $appointment->service->name,
            'professional_name' => $appointment->professional->display_name,
            'professional_avatar' => $appointment->professional->avatar_path
                ? asset('storage/'.$appointment->professional->avatar_path)
                : null,
            'can_cancel' => in_array($appointment->status, [
                AppointmentStatus::PendingPayment,
                AppointmentStatus::Confirmed,
                AppointmentStatus::AttendanceConfirmed,
            ], true) && $appointment->starts_at->isFuture(),
        ];
    }
}
