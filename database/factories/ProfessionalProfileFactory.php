<?php

namespace Database\Factories;

use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProfessionalProfileFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->name();

        return [
            'business_id' => Business::factory(),
            'user_id' => null,
            'display_name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(5)),
            'headline' => 'Barbero',
            'is_public' => true,
            'is_accepting_bookings' => true,
            'is_demo' => false,
        ];
    }
}
