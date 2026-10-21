<?php

namespace Database\Factories;

use App\Models\BusinessCategory;
use App\Models\City;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BusinessFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'city_id' => City::factory(),
            'business_category_id' => BusinessCategory::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(5)),
            'tagline' => fake()->sentence(6),
            'description' => fake()->paragraph(),
            'address_line' => fake()->streetAddress(),
            'neighborhood' => fake()->randomElement(['Centro Histórico', 'El Empedrado', 'La Esmeralda']),
            'latitude' => 2.4448,
            'longitude' => -76.6147,
            'timezone' => 'America/Bogota',
            'price_level' => 2,
            'is_published' => true,
            'is_demo' => false,
            'published_at' => now(),
            'settings' => [
                'slot_interval_minutes' => 15,
                'min_lead_minutes' => 0,
                'max_horizon_days' => 60,
                'payment_policy' => 'none',
                'deposit_percent' => 30,
                'hold_minutes' => 15,
                'cancellation_window_hours' => 24,
                'late_cancellation_fee_percent' => 0,
            ],
        ];
    }

    public function unpublished(): static
    {
        return $this->state(fn () => ['is_published' => false, 'published_at' => null]);
    }
}
