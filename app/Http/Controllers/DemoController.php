<?php

namespace App\Http\Controllers;

use App\Domain\Booking\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\User;
use App\Models\VacancyOffer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Local-only tools for reviewing the product. Every route is disabled unless
 * `app.demo_mode` is true (APP_ENV=local by default).
 */
class DemoController extends Controller
{
    private const ROLE_EMAILS = [
        'cliente' => 'cliente@turnoya.demo',
        'barbero' => 'barbero@turnoya.demo',
        'dueno_barbero' => 'dueno.barbero@turnoya.demo',
        'dueno_admin' => 'dueno.admin@turnoya.demo',
    ];

    public function switchRole(Request $request): RedirectResponse
    {
        $this->guard();

        $email = self::ROLE_EMAILS[$request->string('role')->toString()] ?? null;
        abort_unless($email, 404);

        $user = User::where('email', $email)->firstOrFail();
        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/');
    }

    public function reminder(Request $request): RedirectResponse
    {
        $this->guard();

        $user = $request->user() ?? User::where('email', self::ROLE_EMAILS['cliente'])->firstOrFail();
        $business = Business::where('slug', 'barberia-el-faro')->firstOrFail();
        $professional = $business->professionals()->firstOrFail();
        $service = $business->services()->firstOrFail();

        // One dedicated demo appointment, always 30 minutes from now.
        Appointment::where('customer_id', $user->id)
            ->where('customer_notes', 'demo-reminder')
            ->delete();

        $start = now()->addMinutes(30);

        Appointment::create([
            'code' => Appointment::generateCode(),
            'business_id' => $business->id,
            'professional_profile_id' => $professional->id,
            'service_id' => $service->id,
            'customer_id' => $user->id,
            'starts_at' => $start,
            'ends_at' => $start->copy()->addMinutes(45),
            'blocked_until' => $start->copy()->addMinutes(55),
            'status' => AppointmentStatus::Confirmed,
            'price_cents' => $service->price_cents,
            'currency' => 'COP',
            'payment_policy' => 'none',
            'payment_due_cents' => 0,
            'customer_notes' => 'demo-reminder',
            'created_by' => $user->id,
        ]);

        return redirect('/turnos')->with('success', 'Recordatorio de prueba creado para dentro de 30 minutos.');
    }

    public function vacancy(Request $request): RedirectResponse
    {
        $this->guard();

        $user = $request->user() ?? User::where('email', self::ROLE_EMAILS['cliente'])->firstOrFail();
        $business = Business::where('slug', 'barberia-el-faro')->firstOrFail();
        $professional = $business->professionals()->firstOrFail();
        $service = $business->services()->firstOrFail();

        VacancyOffer::where('status', 'open')
            ->where('business_id', $business->id)
            ->update(['status' => 'expired']);

        VacancyOffer::create([
            'business_id' => $business->id,
            'professional_profile_id' => $professional->id,
            'service_id' => $service->id,
            'starts_at' => now()->addHours(3),
            'ends_at' => now()->addHours(3)->addMinutes(45),
            'blocked_until' => now()->addHours(3)->addMinutes(55),
            'status' => 'open',
            'expires_at' => now()->addHours(2),
        ]);

        if (! $user->favorites()->where('business_id', $business->id)->exists()) {
            $user->favorites()->create([
                'business_id' => $business->id,
                'notify_on_vacancy' => true,
                'created_at' => now(),
            ]);
        }

        return redirect('/')->with('success', 'Cupo liberado en tu barbería favorita.');
    }

    private function guard(): void
    {
        abort_unless((bool) config('app.demo_mode'), 404);
    }
}
