<?php

namespace Database\Seeders;

use App\Domain\Identity\Enums\MembershipRole;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\BusinessCategory;
use App\Models\BusinessMembership;
use App\Models\City;
use App\Models\Favorite;
use App\Models\Media;
use App\Models\ProfessionalProfile;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Specialty;
use App\Models\TipPaymentMethod;
use App\Models\User;
use App\Models\WorkingHour;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Demo content for local/staging only.
 *
 * Every record is flagged `is_demo` and labelled "Demostración" in the UI.
 * Refuses to run in production.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('DemoSeeder skipped: demo data is not allowed in production.');

            return;
        }

        $popayan = City::where('slug', 'popayan')->firstOrFail();

        $client = $this->makeUser('Cliente Demo', 'cliente@turnoya.demo', '+57 300 111 2233');

        $businesses = [
            [
                'slug' => 'barberia-el-faro',
                'name' => 'Barbería El Faro',
                'category' => 'barberias',
                'tagline' => 'Cinco sillas, cinco estilos, una sola cuadra del Parque Caldas.',
                'description' => 'Barbería de cinco sillas en el Centro de Popayán. Especialistas en fades, trabajo con tijera, barba y color. Agenda por barbero para que elijas con quién te vas a sentar.',
                'neighborhood' => 'Centro',
                'address' => 'Calle 5 # 4-27, segundo piso',
                'lat' => 2.4425, 'lng' => -76.6070,
                'cover' => 'demo/hero2.jpg',
                'price_level' => 3,
                'owner' => ['name' => 'Marcela Salazar', 'email' => 'dueno.admin@turnoya.demo', 'performs' => false],
                'services' => [
                    ['Corte clásico', 25000, 45, 10],
                    ['Fade', 30000, 45, 10],
                    ['Corte + barba', 40000, 60, 10],
                    ['Arreglo de barba', 18000, 30, 10],
                    ['Tijera y textura', 35000, 50, 10],
                    ['Color de cabello', 85000, 90, 15],
                ],
                'pros' => [
                    ['name' => 'Andrés Mosquera', 'headline' => 'Fades y máquina', 'years' => 7, 'specialties' => ['Fades', 'Cortes modernos'], 'portfolio' => ['demo/barber.jpg', 'demo/beard.jpg']],
                    ['name' => 'Julián Castrillón', 'headline' => 'Trabajo con tijera', 'years' => 12, 'specialties' => ['Técnica de tijera', 'Cortes clásicos'], 'portfolio' => ['demo/hero.jpg', 'demo/beard.jpg']],
                    ['name' => 'Diego Palechor', 'headline' => 'Barba y toalla caliente', 'years' => 5, 'specialties' => ['Arreglo de barba', 'Cortes clásicos'], 'portfolio' => ['demo/beard.jpg', 'demo/barber.jpg']],
                    ['name' => 'Felipe Muñoz', 'headline' => 'Cortes modernos', 'years' => 4, 'specialties' => ['Cortes modernos', 'Fades'], 'portfolio' => ['demo/barber.jpg', 'demo/hero.jpg']],
                    ['name' => 'Sebastián Rojas', 'headline' => 'Color y estilo', 'years' => 6, 'specialties' => ['Coloración', 'Peinados para eventos'], 'portfolio' => ['demo/hero2.jpg', 'demo/interior.jpg']],
                ],
                'reviews' => [
                    [0, 5, 'Quedé impecable. Andrés entiende el fade que pedí sin explicarle tanto.'],
                    [1, 5, 'Julián trabaja la tijera como nadie en el centro. Salí sintiéndome otro.'],
                    [3, 4, 'Muy buen corte, el local se llena y toca esperar un poco.'],
                ],
            ],
            [
                'slug' => 'casa-barberia',
                'name' => 'Casa Barbería',
                'category' => 'barberias',
                'tagline' => 'Camilo corta, atiende y responde por su trabajo.',
                'description' => 'Barbería de una sola silla en La Primavera. Camilo atiende de principio a fin: corte, barba y ritual de toalla caliente. Sin afán, con cita.',
                'neighborhood' => 'La Primavera',
                'address' => 'Carrera 9 # 24-18',
                'lat' => 2.4550, 'lng' => -76.5930,
                'cover' => 'demo/hero.jpg',
                'price_level' => 2,
                'owner' => ['name' => 'Camilo Rivas', 'email' => 'dueno.barbero@turnoya.demo', 'performs' => true],
                'services' => [
                    ['Corte clásico', 22000, 45, 10],
                    ['Corte + barba', 32000, 60, 10],
                    ['Arreglo de barba', 15000, 30, 5],
                    ['Ritual de toalla caliente', 28000, 40, 10],
                ],
                'pros' => [
                    ['name' => 'Camilo Rivas', 'headline' => 'Barbero y dueño', 'years' => 9, 'specialties' => ['Cortes clásicos', 'Fades', 'Arreglo de barba'], 'portfolio' => ['demo/barber.jpg', 'demo/hero.jpg']],
                ],
                'reviews' => [
                    [0, 5, 'Camilo es puntual y muy detallista. El ritual de toalla vale cada peso.'],
                ],
            ],
            [
                'slug' => 'salon-malva',
                'name' => 'Salón Malva',
                'category' => 'salones-de-belleza',
                'tagline' => 'Color, brillo y cuidado capilar en el Campanario.',
                'description' => 'Salón de color y tratamientos. Diagnóstico antes de cada servicio, productos de baja toxicidad y un equipo de tres estilistas con agenda independiente.',
                'neighborhood' => 'Campanario',
                'address' => 'Calle 18 # 7-42',
                'lat' => 2.4600, 'lng' => -76.6180,
                'cover' => 'demo/interior.jpg',
                'price_level' => 3,
                'owner' => ['name' => 'Paula Arboleda', 'email' => 'dueno.malva@turnoya.demo', 'performs' => false],
                'services' => [
                    ['Diagnóstico capilar', 0, 20, 0],
                    ['Color raíz', 95000, 90, 15],
                    ['Balayage', 220000, 180, 20],
                    ['Hidratación profunda', 65000, 45, 10],
                    ['Peinado para evento', 70000, 60, 10],
                ],
                'pros' => [
                    ['name' => 'Juliana Ortega', 'headline' => 'Colorista senior', 'years' => 11, 'specialties' => ['Coloración', 'Tratamientos capilares'], 'portfolio' => ['demo/interior.jpg', 'demo/hero2.jpg']],
                    ['name' => 'Laura Cerón', 'headline' => 'Color y peinados', 'years' => 6, 'specialties' => ['Coloración', 'Peinados para eventos'], 'portfolio' => ['demo/hero2.jpg', 'demo/makeup.jpg']],
                    ['name' => 'Sofía Muñoz', 'headline' => 'Tratamientos capilares', 'years' => 4, 'specialties' => ['Tratamientos capilares'], 'portfolio' => ['demo/interior.jpg']],
                ],
                'reviews' => [
                    [0, 5, 'El balayage me quedó exactamente como la referencia. Juliana explica todo.'],
                    [1, 4, 'Buen peinado para la boda, duró toda la noche.'],
                ],
            ],
            [
                'slug' => 'estudio-nube',
                'name' => 'Estudio Nube',
                'category' => 'unas',
                'tagline' => 'Uñas y cejas, una clienta a la vez.',
                'description' => 'Estudio pequeño en Bello Horizonte. Valentina atiende sola, con cita, y trabaja uñas y diseño de cejas con productos de larga duración.',
                'neighborhood' => 'Bello Horizonte',
                'address' => 'Calle 42 # 12-09',
                'lat' => 2.4750, 'lng' => -76.6100,
                'cover' => 'demo/nails.jpg',
                'price_level' => 2,
                'owner' => ['name' => 'Valentina Muñoz', 'email' => 'dueno.nube@turnoya.demo', 'performs' => true],
                'services' => [
                    ['Manicure semipermanente', 45000, 60, 10],
                    ['Pedicure', 40000, 60, 10],
                    ['Diseño de cejas', 20000, 30, 5],
                    ['Laminado de cejas', 60000, 50, 5],
                ],
                'pros' => [
                    ['name' => 'Valentina Muñoz', 'headline' => 'Manicurista y cejas', 'years' => 6, 'specialties' => ['Uñas', 'Cejas y pestañas'], 'portfolio' => ['demo/nails.jpg', 'demo/salon.jpg']],
                ],
                'reviews' => [
                    [0, 5, 'Súper cuidadosa con la esterilización y el diseño quedó fino.'],
                ],
            ],
        ];

        foreach ($businesses as $data) {
            $this->seedBusiness($data, $popayan, $client);
        }

        $this->refreshAggregates();

        $faro = Business::where('slug', 'barberia-el-faro')->first();
        $casa = Business::where('slug', 'casa-barberia')->first();

        if ($faro) {
            Favorite::updateOrCreate(
                ['user_id' => $client->id, 'business_id' => $faro->id],
                ['notify_on_vacancy' => true],
            );
        }

        if ($casa) {
            Favorite::updateOrCreate(
                ['user_id' => $client->id, 'business_id' => $casa->id],
                ['notify_on_vacancy' => true],
            );
        }
    }

    private function seedBusiness(array $data, City $city, User $client): void
    {
        $category = BusinessCategory::where('slug', $data['category'])->firstOrFail();

        $owner = $this->makeUser($data['owner']['name'], $data['owner']['email']);

        $business = Business::updateOrCreate(
            ['slug' => $data['slug']],
            [
                'city_id' => $city->id,
                'business_category_id' => $category->id,
                'name' => $data['name'],
                'tagline' => $data['tagline'],
                'description' => $data['description'],
                'cover_path' => $data['cover'],
                'address_line' => $data['address'],
                'neighborhood' => $data['neighborhood'],
                'latitude' => $data['lat'],
                'longitude' => $data['lng'],
                'phone' => '+57 300 000 0000',
                'whatsapp' => '+57 300 000 0000',
                'instagram' => Str::slug($data['name']),
                'timezone' => 'America/Bogota',
                'price_level' => $data['price_level'],
                'is_published' => true,
                'is_demo' => true,
                'published_at' => now(),
                'settings' => [
                    'slot_interval_minutes' => 15,
                    'min_lead_minutes' => 60,
                    'max_horizon_days' => 60,
                    'payment_policy' => 'none',
                    'deposit_percent' => 30,
                    'hold_minutes' => 15,
                    'cancellation_window_hours' => 24,
                    'late_cancellation_fee_percent' => 0,
                ],
            ],
        );

        BusinessMembership::updateOrCreate(
            ['business_id' => $business->id, 'user_id' => $owner->id],
            [
                'role' => MembershipRole::Owner,
                'status' => 'active',
                'can_manage_business' => true,
                'can_manage_team' => true,
                'can_view_finances' => true,
                'performs_services' => (bool) $data['owner']['performs'],
                'accepted_at' => now(),
            ],
        );

        $serviceCategory = ServiceCategory::firstOrCreate(
            ['business_id' => $business->id, 'name' => 'Servicios'],
            ['sort_order' => 1],
        );

        $services = collect($data['services'])->map(function ($s) use ($business, $serviceCategory) {
            [$name, $price, $duration, $buffer] = $s;

            return Service::updateOrCreate(
                ['business_id' => $business->id, 'slug' => Str::slug($name)],
                [
                    'service_category_id' => $serviceCategory->id,
                    'name' => $name,
                    'duration_minutes' => $duration,
                    'buffer_minutes' => $buffer,
                    'price_cents' => $price * 100,
                    'is_active' => true,
                ],
            );
        });

        $business->update([
            'min_price_cents' => $services->filter(fn ($s) => $s->price_cents > 0)->min('price_cents'),
        ]);

        $profiles = [];

        foreach ($data['pros'] as $index => $pro) {
            $isOwner = $index === 0 && $data['owner']['performs'];
            $email = $isOwner
                ? $data['owner']['email']
                : 'pro.'.Str::slug($pro['name']).'@turnoya.demo';

            $proUser = $isOwner ? $owner : $this->makeUser($pro['name'], $email);

            $profile = ProfessionalProfile::updateOrCreate(
                ['business_id' => $business->id, 'user_id' => $proUser->id],
                [
                    'display_name' => $pro['name'],
                    'slug' => Str::slug($data['slug'].'-'.$pro['name']),
                    'headline' => $pro['headline'],
                    'bio' => 'Perfil de demostración. '.$pro['headline'].' en '.$business->name.'.',
                    'years_experience' => $pro['years'],
                    'is_public' => true,
                    'is_accepting_bookings' => true,
                    'is_demo' => true,
                ],
            );

            $profile->specialties()->sync(
                Specialty::whereIn('name', $pro['specialties'])->pluck('id')
            );

            $profile->services()->sync(
                $services->mapWithKeys(fn (Service $s) => [$s->id => ['is_active' => true]])
            );

            foreach ($pro['portfolio'] as $order => $path) {
                Media::updateOrCreate(
                    ['mediable_type' => ProfessionalProfile::class, 'mediable_id' => $profile->id, 'path' => $path],
                    ['collection' => 'portfolio', 'kind' => 'image', 'disk' => 'public', 'sort_order' => $order, 'status' => 'approved', 'is_demo' => true],
                );
            }

            if (! $isOwner) {
                BusinessMembership::updateOrCreate(
                    ['business_id' => $business->id, 'user_id' => $proUser->id],
                    [
                        'role' => MembershipRole::Professional,
                        'status' => 'active',
                        'performs_services' => true,
                        'accepted_at' => now(),
                    ],
                );
            }

            $this->seedTips($profile);

            $profiles[] = $profile;
        }

        foreach ($data['reviews'] as [$proIndex, $rating, $comment]) {
            $this->seedReview($business, $profiles[$proIndex], $client, $rating, $comment);
        }

        Media::updateOrCreate(
            ['mediable_type' => Business::class, 'mediable_id' => $business->id, 'path' => $data['cover']],
            ['collection' => 'cover', 'kind' => 'image', 'disk' => 'public', 'sort_order' => 0, 'status' => 'approved', 'is_demo' => true],
        );

        $this->seedSchedule($business);
    }

    private function seedTips(ProfessionalProfile $profile): void
    {
        foreach ([
            ['nequi', $profile->display_name, '300 000 0000'],
            ['bancolombia', $profile->display_name, '000-000000-00'],
        ] as $index => [$type, $holder, $value]) {
            TipPaymentMethod::updateOrCreate(
                ['professional_profile_id' => $profile->id, 'type' => $type, 'account_value' => $value],
                [
                    'label' => $holder,
                    'account_holder' => $holder,
                    'is_visible' => true,
                    'sort_order' => $index,
                    'instructions' => 'Datos de demostración. No envíes dinero real.',
                ],
            );
        }
    }

    private function seedReview(Business $business, ProfessionalProfile $profile, User $customer, int $rating, string $comment): void
    {
        $starts = Carbon::now('America/Bogota')->subDays(6)->setTime(15, 0);

        $appointment = Appointment::create([
            'code' => Appointment::generateCode(),
            'business_id' => $business->id,
            'professional_profile_id' => $profile->id,
            'service_id' => $business->services()->first()->id,
            'customer_id' => $customer->id,
            'starts_at' => $starts->copy()->utc(),
            'ends_at' => $starts->copy()->addMinutes(45)->utc(),
            'blocked_until' => $starts->copy()->addMinutes(55)->utc(),
            'status' => 'completed',
            'price_cents' => $business->services()->first()->price_cents,
            'currency' => 'COP',
            'payment_policy' => 'none',
            'payment_due_cents' => 0,
            'completed_at' => $starts->copy()->addMinutes(50)->utc(),
            'created_by' => $customer->id,
        ]);

        Review::updateOrCreate(
            ['appointment_id' => $appointment->id, 'business_id' => $business->id],
            [
                'customer_id' => $customer->id,
                'professional_profile_id' => null,
                'rating' => $rating,
                'comment' => $comment,
                'status' => 'approved',
                'is_demo' => true,
            ],
        );

        Review::updateOrCreate(
            ['appointment_id' => $appointment->id, 'professional_profile_id' => $profile->id],
            [
                'business_id' => $business->id,
                'customer_id' => $customer->id,
                'rating' => $rating,
                'comment' => $comment,
                'status' => 'approved',
                'is_demo' => true,
            ],
        );
    }

    private function refreshAggregates(): void
    {
        foreach (Business::all() as $business) {
            $reviews = Review::approved()->where('business_id', $business->id);
            $business->update([
                'rating_avg' => round((float) ($reviews->avg('rating') ?? 0), 2),
                'reviews_count' => $reviews->count(),
            ]);
        }

        foreach (ProfessionalProfile::all() as $profile) {
            $reviews = Review::approved()->where('professional_profile_id', $profile->id);
            $profile->update([
                'rating_avg' => round((float) ($reviews->avg('rating') ?? 0), 2),
                'reviews_count' => $reviews->count(),
            ]);
        }
    }

    private function makeUser(string $name, string $email, ?string $phone = null): User
    {
        return User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'phone' => $phone ?? '+57 300 000 0000',
            ],
        );
    }

    /** Monday–Saturday 09:00–19:00 with a 13:00–14:00 lunch break. */
    private function seedSchedule(Business $business): void
    {
        $professionalIds = $business->professionals()->pluck('id');

        WorkingHour::query()->where('owner_type', Business::class)->where('owner_id', $business->id)->delete();
        WorkingHour::query()->where('owner_type', ProfessionalProfile::class)->whereIn('owner_id', $professionalIds)->delete();

        foreach (range(1, 6) as $weekday) {
            $businessHour = WorkingHour::create([
                'owner_type' => Business::class,
                'owner_id' => $business->id,
                'weekday' => $weekday,
                'start_time' => '09:00:00',
                'end_time' => '19:00:00',
                'is_active' => true,
            ]);

            $businessHour->breaks()->create([
                'start_time' => '13:00:00',
                'end_time' => '14:00:00',
                'label' => 'Almuerzo',
            ]);

            foreach ($professionalIds as $professionalId) {
                $professionalHour = WorkingHour::create([
                    'owner_type' => ProfessionalProfile::class,
                    'owner_id' => $professionalId,
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
        }
    }
}
