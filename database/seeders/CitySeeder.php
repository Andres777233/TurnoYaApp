<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            [
                'name' => 'Popayán',
                'department' => 'Cauca',
                'slug' => 'popayan',
                'center_latitude' => 2.4448,
                'center_longitude' => -76.6147,
                'radius_km' => 12,
                'timezone' => 'America/Bogota',
                'is_active' => true,
                'sort_order' => 1,
            ],
            // Prepared for expansion. Inactive cities cannot publish businesses.
            ['name' => 'Cali', 'department' => 'Valle del Cauca', 'slug' => 'cali', 'center_latitude' => 3.4516, 'center_longitude' => -76.5320, 'radius_km' => 25, 'timezone' => 'America/Bogota', 'is_active' => false, 'sort_order' => 2],
            ['name' => 'Pasto', 'department' => 'Nariño', 'slug' => 'pasto', 'center_latitude' => 1.2136, 'center_longitude' => -77.2811, 'radius_km' => 15, 'timezone' => 'America/Bogota', 'is_active' => false, 'sort_order' => 3],
        ];

        foreach ($cities as $city) {
            City::updateOrCreate(['slug' => $city['slug']], $city);
        }
    }
}
