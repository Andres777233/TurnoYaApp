<?php

namespace App\Http\Controllers;

use App\Domain\Booking\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Business;
use App\Models\BusinessMembership;
use App\Models\ProfessionalProfile;
use App\Models\Review;
use App\Models\TipPaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PanelController extends Controller
{
    public function agenda(Request $request): Response
    {
        [$business, $membership] = $this->context($request);
        $professional = $this->professionalFor($request, $business);

        $query = Appointment::query()
            ->with(['customer', 'service', 'professional'])
            ->where('business_id', $business->id)
            ->whereDate('starts_at', now($business->timezone)->toDateString())
            ->orderBy('starts_at');

        if ($membership->role->value === 'professional') {
            $query->where('professional_profile_id', $professional?->id);
        }

        return Inertia::render('panel/agenda', [
            'business' => ['name' => $business->name, 'slug' => $business->slug],
            'role' => $membership->role->value,
            'appointments' => $query->get()->map(fn (Appointment $a) => [
                'code' => $a->code,
                'time' => $a->starts_at->copy()->setTimezone($business->timezone)->format('H:i'),
                'customer' => $a->customer->name,
                'phone' => $a->customer->phone,
                'service' => $a->service->name,
                'professional' => $a->professional->display_name,
                'status' => $a->status->value,
                'status_label' => $a->status->label(),
                'price_cents' => $a->price_cents,
                'confirmed' => $a->attendance_confirmed_at !== null,
                'can_complete' => in_array($a->status, [
                    AppointmentStatus::Confirmed,
                    AppointmentStatus::AttendanceConfirmed,
                ], true),
            ]),
        ]);
    }

    public function perfil(Request $request): Response
    {
        [$business] = $this->context($request);
        $profile = $this->professionalFor($request, $business);

        abort_unless($profile, 403, 'Esta cuenta no atiende servicios.');

        $profile->load(['specialties', 'media', 'services']);

        return Inertia::render('panel/perfil', [
            'business' => ['name' => $business->name, 'slug' => $business->slug],
            'profile' => [
                'name' => $profile->display_name,
                'slug' => $profile->slug,
                'headline' => $profile->headline,
                'bio' => $profile->bio,
                'avatar' => $profile->avatar_path ? asset('storage/'.$profile->avatar_path) : null,
                'rating' => (float) $profile->rating_avg,
                'reviews' => $profile->reviews_count,
                'specialties' => $profile->specialties->pluck('name'),
                'portfolio' => $profile->media->where('collection', 'portfolio')
                    ->map(fn ($m) => $m->url())->values(),
                'services' => $profile->services->map(fn ($s) => [
                    'name' => $s->name,
                    'price_cents' => $s->pivot->price_cents ?? $s->price_cents,
                ]),
            ],
        ]);
    }

    public function propinas(Request $request): Response
    {
        [$business] = $this->context($request);
        $profile = $this->professionalFor($request, $business);

        abort_unless($profile, 403);

        return Inertia::render('panel/propinas', [
            'business' => ['name' => $business->name, 'slug' => $business->slug],
            'profile' => ['name' => $profile->display_name, 'slug' => $profile->slug],
            'methods' => TipPaymentMethod::where('professional_profile_id', $profile->id)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (TipPaymentMethod $m) => [
                    'id' => $m->id,
                    'type' => $m->type,
                    'type_label' => $m->typeLabel(),
                    'account_value' => $m->account_value,
                    'is_visible' => $m->is_visible,
                ]),
        ]);
    }

    public function negocio(Request $request): Response
    {
        [$business, $membership] = $this->context($request);

        abort_unless(in_array($membership->role->value, ['owner', 'admin'], true), 403);

        $today = now($business->timezone)->toDateString();

        return Inertia::render('panel/negocio', [
            'view' => $request->routeIs('panel.equipo')
                ? 'equipo'
                : ($request->routeIs('panel.ingresos') ? 'ingresos' : 'negocio'),
            'business' => [
                'name' => $business->name,
                'slug' => $business->slug,
                'neighborhood' => $business->neighborhood,
                'address' => $business->address_line,
                'rating' => (float) $business->rating_avg,
                'reviews' => $business->reviews_count,
                'is_demo' => $business->is_demo,
            ],
            'stats' => [
                'today_count' => Appointment::where('business_id', $business->id)
                    ->whereDate('starts_at', $today)->count(),
                'month_revenue_cents' => (int) Appointment::where('business_id', $business->id)
                    ->where('status', AppointmentStatus::Completed->value)
                    ->whereBetween('starts_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->sum('price_cents'),
                'team' => $business->professionals()->where('is_public', true)->count(),
                'favorites' => $business->favorites()->count(),
            ],
            'team' => $business->professionals()
                ->where('is_public', true)
                ->withCount(['reviews' => fn ($q) => $q->where('status', 'approved')])
                ->orderBy('display_name')
                ->get()
                ->map(fn (ProfessionalProfile $p) => [
                    'name' => $p->display_name,
                    'slug' => $p->slug,
                    'headline' => $p->headline,
                    'avatar' => $p->avatar_path ? asset('storage/'.$p->avatar_path) : null,
                    'rating' => (float) $p->rating_avg,
                    'reviews' => $p->reviews_count,
                    'today' => Appointment::where('professional_profile_id', $p->id)
                        ->whereDate('starts_at', $today)->count(),
                ]),
            'reviews' => Review::approved()
                ->where('business_id', $business->id)
                ->with('customer')
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn (Review $r) => [
                    'rating' => $r->rating,
                    'comment' => $r->comment,
                    'customer' => $r->customer->name,
                    'date' => $r->created_at->locale('es')->translatedFormat('d M'),
                    'is_demo' => $r->is_demo,
                ]),
            'days' => collect(range(6, 0))->map(function (int $offset) use ($business) {
                $date = now($business->timezone)->subDays($offset);

                return [
                    'label' => $date->locale('es')->translatedFormat('D d'),
                    'total_cents' => (int) Appointment::where('business_id', $business->id)
                        ->where('status', AppointmentStatus::Completed->value)
                        ->whereDate('starts_at', $date->toDateString())
                        ->sum('price_cents'),
                ];
            })->values(),
        ]);
    }

    public function equipo(Request $request): Response
    {
        return $this->negocio($request);
    }

    public function ingresos(Request $request): Response
    {
        return $this->negocio($request);
    }

    public function complete(Request $request, Appointment $appointment): \Illuminate\Http\RedirectResponse
    {
        [$business] = $this->context($request);

        abort_unless($appointment->business_id === $business->id, 403);

        $appointment->update([
            'status' => AppointmentStatus::Completed,
            'completed_at' => now(),
        ]);

        return back()->with('success', 'Cita marcada como atendida.');
    }

    public function toggleTip(Request $request, \App\Models\TipPaymentMethod $method): \Illuminate\Http\RedirectResponse
    {
        [$business] = $this->context($request);

        $owns = \App\Models\ProfessionalProfile::where('business_id', $business->id)
            ->where('user_id', $request->user()->id)
            ->where('id', $method->professional_profile_id)
            ->exists();

        abort_unless($owns, 403);

        $method->update(['is_visible' => ! $method->is_visible]);

        return back();
    }

    /**
     * @return array{0: Business, 1: BusinessMembership}
     */
    private function context(Request $request): array
    {
        $membership = $request->user()
            ->memberships()
            ->where('status', 'active')
            ->with('business')
            ->orderByRaw("CASE role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END")
            ->first();

        abort_unless($membership && $membership->business, 403, 'No tienes un negocio activo.');

        return [$membership->business, $membership];
    }

    private function professionalFor(Request $request, Business $business): ?ProfessionalProfile
    {
        return ProfessionalProfile::query()
            ->where('business_id', $business->id)
            ->where('user_id', $request->user()->id)
            ->first();
    }
}
