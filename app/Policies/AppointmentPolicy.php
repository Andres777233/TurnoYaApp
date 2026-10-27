<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function view(User $user, Appointment $appointment): bool
    {
        if ($appointment->customer_id === $user->id) {
            return true;
        }

        return $appointment->business->membershipFor($user) !== null;
    }

    public function cancel(User $user, Appointment $appointment): bool
    {
        return $appointment->canBeCancelledBy($user);
    }

    public function confirm(User $user, Appointment $appointment): bool
    {
        if ($appointment->customer_id === $user->id) {
            return true;
        }

        return $appointment->business->membershipFor($user) !== null;
    }
}
