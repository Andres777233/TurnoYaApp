<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Concerns\CreatesBookableBusiness;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use CreatesBookableBusiness;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Monday 9 Nov 2026, 08:00 in Popayán.
        Carbon::setTestNow(Carbon::parse('2026-11-09 08:00:00', 'America/Bogota'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_availability_returns_slots_and_respects_the_lunch_break(): void
    {
        [$business, $professional, $service] = $this->bookableBusiness();

        $response = $this->getJson(
            "/negocios/{$business->slug}/disponibilidad?service_id={$service->id}&professional_id={$professional->id}&date=2026-11-10"
        )->assertOk();

        $times = collect($response->json('slots'))->pluck('local');

        $this->assertTrue($times->contains('10:00'));
        $this->assertFalse($times->contains('13:00'), 'Lunch break must not be offered.');
        $this->assertTrue($times->contains('14:00'));
    }

    public function test_a_customer_can_book_an_available_slot(): void
    {
        [$business, $professional, $service] = $this->bookableBusiness();
        $customer = User::factory()->create();

        $response = $this->actingAs($customer)->post("/negocios/{$business->slug}/reservar", [
            'service_id' => $service->id,
            'professional_id' => $professional->id,
            'starts_at' => '2026-11-10T10:00:00-05:00',
        ]);

        $appointment = Appointment::sole();

        $response->assertRedirect(route('appointments.show', ['appointment' => $appointment->code]));
        $this->assertSame('confirmed', $appointment->status->value);
        $this->assertSame($customer->id, $appointment->customer_id);
        $this->assertSame(4500000, $appointment->price_cents);
        $this->assertDatabaseHas('appointment_status_history', [
            'appointment_id' => $appointment->id,
            'from_status' => null,
            'to_status' => 'confirmed',
        ]);
    }

    public function test_the_same_slot_cannot_be_booked_twice(): void
    {
        [$business, $professional, $service] = $this->bookableBusiness();
        $first = User::factory()->create();
        $second = User::factory()->create();

        $payload = [
            'service_id' => $service->id,
            'professional_id' => $professional->id,
            'starts_at' => '2026-11-10T10:00:00-05:00',
        ];

        $this->actingAs($first)->post("/negocios/{$business->slug}/reservar", $payload);
        $this->assertSame(1, Appointment::count());

        $this->actingAs($second)
            ->from("/negocios/{$business->slug}/reservar")
            ->post("/negocios/{$business->slug}/reservar", $payload)
            ->assertSessionHasErrors('booking');

        $this->assertSame(1, Appointment::count());
    }

    public function test_the_database_rejects_overlapping_appointments(): void
    {
        [$business, $professional, $service] = $this->bookableBusiness();

        Appointment::factory()->create([
            'business_id' => $business->id,
            'professional_profile_id' => $professional->id,
            'service_id' => $service->id,
            'starts_at' => '2026-11-10 15:00:00+00',
            'ends_at' => '2026-11-10 15:45:00+00',
            'blocked_until' => '2026-11-10 15:55:00+00',
        ]);

        $this->expectException(QueryException::class);

        Appointment::factory()->create([
            'business_id' => $business->id,
            'professional_profile_id' => $professional->id,
            'service_id' => $service->id,
            'starts_at' => '2026-11-10 15:30:00+00',
            'ends_at' => '2026-11-10 16:15:00+00',
            'blocked_until' => '2026-11-10 16:25:00+00',
        ]);
    }

    public function test_cancelling_frees_the_slot_again(): void
    {
        [$business, $professional, $service] = $this->bookableBusiness();
        $customer = User::factory()->create();

        $this->actingAs($customer)->post("/negocios/{$business->slug}/reservar", [
            'service_id' => $service->id,
            'professional_id' => $professional->id,
            'starts_at' => '2026-11-10T11:00:00-05:00',
        ]);

        $appointment = Appointment::sole();

        $this->actingAs($customer)
            ->post("/reservas/{$appointment->code}/cancelar")
            ->assertSessionHasNoErrors();

        $this->assertSame('cancelled', $appointment->fresh()->status->value);

        $times = collect(
            $this->getJson("/negocios/{$business->slug}/disponibilidad?service_id={$service->id}&professional_id={$professional->id}&date=2026-11-10")
                ->json('slots')
        )->pluck('local');

        $this->assertTrue($times->contains('11:00'));
    }

    public function test_guests_cannot_create_appointments(): void
    {
        [$business, $professional, $service] = $this->bookableBusiness();

        $this->post("/negocios/{$business->slug}/reservar", [
            'service_id' => $service->id,
            'professional_id' => $professional->id,
            'starts_at' => '2026-11-10T10:00:00-05:00',
        ])->assertRedirect(route('login'));

        $this->assertSame(0, Appointment::count());
    }

    public function test_a_customer_cannot_cancel_someone_elses_appointment(): void
    {
        [$business, $professional, $service] = $this->bookableBusiness();
        $owner = User::factory()->create();
        $stranger = User::factory()->create();

        $this->actingAs($owner)->post("/negocios/{$business->slug}/reservar", [
            'service_id' => $service->id,
            'professional_id' => $professional->id,
            'starts_at' => '2026-11-10T12:00:00-05:00',
        ]);

        $appointment = Appointment::sole();

        $this->actingAs($stranger)
            ->post("/reservas/{$appointment->code}/cancelar")
            ->assertForbidden();

        $this->assertSame('confirmed', $appointment->fresh()->status->value);
    }

    public function test_the_same_idempotency_key_does_not_create_a_second_appointment(): void
    {
        [$business, $professional, $service] = $this->bookableBusiness();
        $customer = User::factory()->create();

        $payload = [
            'service_id' => $service->id,
            'professional_id' => $professional->id,
            'starts_at' => '2026-11-10T17:00:00-05:00',
        ];

        $this->actingAs($customer)->post(
            "/negocios/{$business->slug}/reservar",
            $payload,
            ['Idempotency-Key' => 'retry-123'],
        );

        $this->actingAs($customer)->post(
            "/negocios/{$business->slug}/reservar",
            $payload,
            ['Idempotency-Key' => 'retry-123'],
        );

        $this->assertSame(1, Appointment::count());
        $this->assertDatabaseCount('idempotency_keys', 1);
    }

    public function test_confirming_attendance_is_idempotent(): void
    {
        [$business, $professional, $service] = $this->bookableBusiness();
        $customer = User::factory()->create();

        $this->actingAs($customer)->post("/negocios/{$business->slug}/reservar", [
            'service_id' => $service->id,
            'professional_id' => $professional->id,
            'starts_at' => '2026-11-10T16:00:00-05:00',
        ]);

        $appointment = Appointment::sole();

        $this->actingAs($customer)->post("/reservas/{$appointment->code}/confirmar");
        $this->actingAs($customer)->post("/reservas/{$appointment->code}/confirmar");

        $this->assertSame('attendance_confirmed', $appointment->fresh()->status->value);
        $this->assertSame(
            1,
            $appointment->history()->where('to_status', 'attendance_confirmed')->count()
        );
    }
}
