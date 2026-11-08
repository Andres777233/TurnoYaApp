<?php

namespace Tests\Concerns;

use App\Models\Business;
use App\Models\ProfessionalProfile;
use App\Models\Service;
use App\Models\WorkingHour;

trait CreatesBookableBusiness
{
    /**
     * Builds a business that is open Monday–Saturday 09:00–19:00 with a
     * 13:00–14:00 break, one professional and one 45-minute service.
     *
     * @return array{0: Business, 1: ProfessionalProfile, 2: Service}
     */
    protected function bookableBusiness(array $attributes = []): array
    {
        $business = Business::factory()->create($attributes);
        $professional = ProfessionalProfile::factory()->for($business)->create();
        $service = Service::factory()->for($business)->create();

        $professional->services()->attach($service->id, ['is_active' => true]);

        foreach (range(1, 6) as $weekday) {
            WorkingHour::create([
                'owner_type' => Business::class,
                'owner_id' => $business->id,
                'weekday' => $weekday,
                'start_time' => '09:00:00',
                'end_time' => '19:00:00',
                'is_active' => true,
            ]);

            $professionalHour = WorkingHour::create([
                'owner_type' => ProfessionalProfile::class,
                'owner_id' => $professional->id,
                'weekday' => $weekday,
                'start_time' => '09:00:00',
                'end_time' => '19:00:00',
                'is_active' => true,
            ]);

            $professionalHour->breaks()->create([
                'start_time' => '13:00:00',
                'end_time' => '14:00:00',
                'label' => 'Almuerzo',
            ]);
        }

        return [$business, $professional, $service];
    }
}
