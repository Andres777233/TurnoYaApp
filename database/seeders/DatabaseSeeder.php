<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CitySeeder::class,
            BusinessCategorySeeder::class,
            SpecialtySeeder::class,
        ]);

        if (! app()->environment('production')) {
            $this->call(DemoSeeder::class);
        }
    }
}
