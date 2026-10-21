<?php

namespace Database\Seeders;

use App\Models\BusinessCategory;
use Illuminate\Database\Seeder;

class BusinessCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Barberías', 'slug' => 'barberias', 'icon' => 'scissors', 'description' => 'Cortes clásicos, fades y arreglo de barba.'],
            ['name' => 'Peluquerías', 'slug' => 'peluquerias', 'icon' => 'comb', 'description' => 'Corte, color y tratamientos capilares.'],
            ['name' => 'Salones de belleza', 'slug' => 'salones-de-belleza', 'icon' => 'sparkle', 'description' => 'Servicios integrales de imagen.'],
            ['name' => 'Uñas', 'slug' => 'unas', 'icon' => 'hand', 'description' => 'Manicure, pedicure y diseño de uñas.'],
            ['name' => 'Maquillaje', 'slug' => 'maquillaje', 'icon' => 'brush', 'description' => 'Maquillaje social, novias y editorial.'],
            ['name' => 'Cejas y pestañas', 'slug' => 'cejas-y-pestanas', 'icon' => 'eye', 'description' => 'Diseño, laminado y extensiones.'],
            ['name' => 'Depilación', 'slug' => 'depilacion', 'icon' => 'leaf', 'description' => 'Cera, hilo y depilación láser.'],
            ['name' => 'Spa y bienestar', 'slug' => 'spa-y-bienestar', 'icon' => 'droplet', 'description' => 'Masajes, faciales y cuidado de la piel.'],
        ];

        foreach ($categories as $index => $category) {
            BusinessCategory::updateOrCreate(
                ['slug' => $category['slug']],
                [...$category, 'sort_order' => $index + 1, 'is_active' => true],
            );
        }
    }
}
