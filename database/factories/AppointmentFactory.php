<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\ProfessionalProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        $start = now()->addDays(2)->setTime(10, 0);

        return [
            'code' => 'TY-'.strtoupper(fake()->unique()->bothify('??####')),
            'business_id' => Business::factory(),
            'professional_profile_id' => ProfessionalProfile::factory(),
            'service_id' => Service::factory(),
            'customer_id' => User::factory(),
            'starts_at' => $start,
            'ends_at' => $start->copy()->addMinutes(45),
            'blocked_until' => $start->copy()->addMinutes(55),
            'status' => 'confirmed',
            'price_cents' => 4500000,
            'currency' => 'COP',
            'payment_policy' => 'none',
            'payment_due_cents' => 0,
        ];
    }
}
