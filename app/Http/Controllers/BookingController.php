<?php

namespace App\Http\Controllers;

use App\Domain\Booking\Actions\CreateAppointment;
use App\Domain\Booking\Exceptions\BookingException;
use App\Domain\Scheduling\AvailabilityService;
use App\Http\Requests\StoreAppointmentRequest;
use App\Models\Business;
use App\Models\IdempotencyKey;
use App\Models\ProfessionalProfile;
use App\Models\Service;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function show(Request $request, Business $business): Response
    {
        abort_unless($business->is_published && $business->city->is_active, 404);

        $services = Service::query()
            ->where('business_id', $business->id)
            ->where('is_active', true)
            ->with(['professionals' => fn ($q) => $q
                ->where('professional_profiles.is_public', true)
                ->where('professional_profiles.is_accepting_bookings', true)])
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'duration' => $service->duration_minutes,
                'price_cents' => $service->price_cents,
                'professionals' => $service->professionals->map(fn (ProfessionalProfile $p) => [
                    'id' => $p->id,
                    'name' => $p->display_name,
                    'avatar' => $p->avatar_path ? asset('storage/'.$p->avatar_path) : null,
                ])->values(),
            ]);

        $professionals = ProfessionalProfile::query()
            ->where('business_id', $business->id)
            ->public()
            ->where('is_accepting_bookings', true)
            ->orderBy('display_name')
            ->get()
            ->map(fn (ProfessionalProfile $p) => [
                'id' => $p->id,
                'name' => $p->display_name,
                'slug' => $p->slug,
                'headline' => $p->headline,
                'avatar' => $p->avatar_path ? asset('storage/'.$p->avatar_path) : null,
            ]);

        return Inertia::render('booking/create', [
            'business' => [
                'name' => $business->name,
                'slug' => $business->slug,
                'neighborhood' => $business->neighborhood,
                'address' => $business->address_line,
                'timezone' => $business->timezone,
                'cover' => $business->cover_path ? asset('storage/'.$business->cover_path) : null,
                'cancellation_window_hours' => (int) $business->setting('cancellation_window_hours', 24),
                'payment_policy' => $business->setting('payment_policy', 'none'),
                'is_demo' => $business->is_demo,
            ],
            'services' => $services,
            'professionals' => $professionals,
            'selection' => [
                'service' => $request->integer('servicio') ?: null,
                'professional' => $request->integer('profesional') ?: null,
                'date' => $request->string('fecha')->toString() ?: null,
            ],
            'maxHorizonDays' => (int) $business->setting('max_horizon_days', 60),
        ]);
    }

    public function availability(
        Request $request,
        Business $business,
        AvailabilityService $availability,
    ): JsonResponse {
        $data = $request->validate([
            'service_id' => ['required', 'integer'],
            'professional_id' => ['nullable', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $service = Service::query()
            ->where('business_id', $business->id)
            ->where('is_active', true)
            ->findOrFail($data['service_id']);

        $professional = null;

        if (! empty($data['professional_id'])) {
            $professional = ProfessionalProfile::query()
                ->where('business_id', $business->id)
                ->where('is_public', true)
                ->findOrFail($data['professional_id']);
        }

        $date = CarbonImmutable::createFromFormat('Y-m-d', $data['date'], $business->timezone)->startOfDay();

        $slots = $availability->slots($business, $service, $professional, $date);

        return response()->json([
            'date' => $data['date'],
            'slots' => array_map(fn (array $slot) => [
                'starts_at' => $slot['starts_at'],
                'local' => $slot['local'],
            ], $slots),
        ]);
    }

    public function store(
        StoreAppointmentRequest $request,
        Business $business,
        CreateAppointment $createAppointment,
    ): RedirectResponse {
        abort_unless($business->is_published && $business->city->is_active, 404);

        $idempotencyKey = $request->header('Idempotency-Key');
        $payloadHash = hash('sha256', json_encode($request->only([
            'service_id', 'professional_id', 'starts_at', 'notes',
        ])));

        if ($idempotencyKey) {
            $existing = IdempotencyKey::query()
                ->where('user_id', $request->user()->id)
                ->where('key', $idempotencyKey)
                ->where('route', 'booking.store')
                ->first();

            if ($existing) {
                if (! hash_equals($existing->request_hash, $payloadHash)) {
                    abort(409, 'Esta llave de idempotencia ya fue usada con otros datos.');
                }

                $url = $existing->response_body['url'] ?? null;

                return $url
                    ? redirect($url)
                    : back()->withErrors(['booking' => 'Estamos procesando tu reserva.']);
            }
        }

        $service = Service::query()
            ->where('business_id', $business->id)
            ->where('is_active', true)
            ->findOrFail($request->integer('service_id'));

        $professional = null;

        if ($request->filled('professional_id')) {
            $professional = ProfessionalProfile::query()
                ->where('business_id', $business->id)
                ->where('is_public', true)
                ->findOrFail($request->integer('professional_id'));
        }

        try {
            $appointment = $createAppointment->handle(
                $request->user(),
                $business,
                $service,
                $professional,
                CarbonImmutable::parse($request->string('starts_at')->toString()),
                $request->string('notes')->toString() ?: null,
            );
        } catch (BookingException $exception) {
            return back()->withErrors([
                'booking' => $exception->userMessage,
            ]);
        }

        $redirect = route('appointments.show', ['appointment' => $appointment->code]);

        if ($idempotencyKey) {
            IdempotencyKey::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'key' => $idempotencyKey,
                    'route' => 'booking.store',
                ],
                [
                    'request_hash' => $payloadHash,
                    'response_status' => 302,
                    'response_body' => ['url' => $redirect],
                    'expires_at' => now()->addDay(),
                ],
            );
        }

        return redirect($redirect)->with('success', 'Tu reserva quedó confirmada.');
    }
}
