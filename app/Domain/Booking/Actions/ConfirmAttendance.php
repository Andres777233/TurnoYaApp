<?php

namespace App\Domain\Booking\Actions;

use App\Domain\Booking\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\AppointmentStatusHistory;
use App\Models\User;

class ConfirmAttendance
{
    public function handle(Appointment $appointment, User $actor): Appointment
    {
        // Idempotent: confirming twice is a no-op, not an error.
        if ($appointment->status === AppointmentStatus::AttendanceConfirmed) {
            return $appointment;
        }

        if ($appointment->status !== AppointmentStatus::Confirmed) {
            return $appointment;
        }

        $appointment->update([
            'status' => AppointmentStatus::AttendanceConfirmed,
            'attendance_confirmed_at' => now(),
        ]);

        AppointmentStatusHistory::create([
            'appointment_id' => $appointment->id,
            'from_status' => AppointmentStatus::Confirmed->value,
            'to_status' => AppointmentStatus::AttendanceConfirmed->value,
            'actor_user_id' => $actor->id,
            'reason' => 'Asistencia confirmada',
        ]);

        return $appointment->refresh();
    }
}
