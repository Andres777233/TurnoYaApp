<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CityFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->city();

        return [
            'name' => $name,
            'department' => 'Cauca',
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(4)),
            'center_latitude' => 2.4448,
            'center_longitude' => -76.6147,
            'radius_km' => 12,
            'timezone' => 'America/Bogota',
            'is_active' => true,
            'sort_order' => 1,
        ];
    }
}
