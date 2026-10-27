<?php

namespace App\Domain\Booking\Actions;

use App\Domain\Booking\Enums\AppointmentStatus;
use App\Domain\Booking\Exceptions\BookingException;
use App\Models\Appointment;
use App\Models\AppointmentStatusHistory;
use App\Models\User;

class CancelAppointment
{
    public function handle(Appointment $appointment, User $actor, ?string $reason = null): Appointment
    {
        if (! $appointment->canBeCancelledBy($actor)) {
            throw BookingException::cannotCancel();
        }

        $previous = $appointment->status;

        $appointment->update([
            'status' => AppointmentStatus::Cancelled,
            'cancelled_at' => now(),
            'cancelled_by' => $actor->id,
            'cancellation_reason' => $reason,
        ]);

        AppointmentStatusHistory::create([
            'appointment_id' => $appointment->id,
            'from_status' => $previous->value,
            'to_status' => AppointmentStatus::Cancelled->value,
            'actor_user_id' => $actor->id,
            'reason' => $reason,
        ]);

        // Phase 5 will dispatch vacancy alerts to eligible favorites here.
        return $appointment->refresh();
    }
}
