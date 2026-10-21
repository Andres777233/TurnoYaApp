<?php

namespace Database\Seeders;

use App\Models\Specialty;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SpecialtySeeder extends Seeder
{
    public function run(): void
    {
        $specialties = [
            'Cortes modernos', 'Cortes clásicos', 'Técnica de tijera', 'Fades',
            'Coloración', 'Tratamientos capilares', 'Arreglo de barba', 'Maquillaje',
            'Uñas', 'Cejas y pestañas', 'Depilación', 'Peinados para eventos',
        ];

        foreach ($specialties as $index => $name) {
            Specialty::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'sort_order' => $index + 1, 'is_active' => true],
            );
        }
    }
}
