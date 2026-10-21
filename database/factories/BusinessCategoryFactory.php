<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BusinessCategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(4)),
            'icon' => 'scissors',
            'sort_order' => 1,
            'is_active' => true,
        ];
    }
}
