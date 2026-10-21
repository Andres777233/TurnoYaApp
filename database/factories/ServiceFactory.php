<?php

namespace Database\Factories;

use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ServiceFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->randomElement(['Corte clásico', 'Fade', 'Color', 'Manicure']);

        return [
            'business_id' => Business::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(4)),
            'description' => fake()->sentence(),
            'duration_minutes' => 45,
            'buffer_minutes' => 10,
            'price_cents' => 4500000,
            'is_active' => true,
            'sort_order' => 1,
        ];
    }
}
