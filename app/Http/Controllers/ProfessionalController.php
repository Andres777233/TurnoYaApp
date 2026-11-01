<?php

namespace App\Http\Controllers;

use App\Models\ProfessionalProfile;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class ProfessionalController extends Controller
{
    public function show(ProfessionalProfile $professional): Response
    {
        abort_unless($professional->is_public && $professional->business->is_published, 404);

        $professional->load([
            'business.category',
            'business.city',
            'specialties',
            'services' => fn ($q) => $q->where('services.is_active', true),
            'media' => fn ($q) => $q->where('status', 'approved')->orderBy('sort_order'),
        ]);

        $services = $professional->services->map(fn (Service $service) => [
            'id' => $service->id,
            'name' => $service->name,
            'description' => $service->description,
            'duration' => $service->pivot->duration_minutes ?? $service->duration_minutes,
            'price_cents' => $service->pivot->price_cents ?? $service->price_cents,
        ]);

        $portfolio = $professional->media
            ->where('collection', 'portfolio')
            ->map(fn ($m) => [
                'url' => $m->url(),
                'alt' => $m->alt_text,
                'kind' => $m->kind,
                'poster' => $m->poster_path ? asset('storage/'.$m->poster_path) : null,
            ])->values();

        $colleagues = ProfessionalProfile::query()
            ->where('business_id', $professional->business_id)
            ->where('id', '!=', $professional->id)
            ->public()
            ->with('specialties')
            ->limit(3)
            ->get();

        return Inertia::render('professionals/show', [
            'professional' => [
                'id' => $professional->id,
                'name' => $professional->display_name,
                'slug' => $professional->slug,
                'headline' => $professional->headline,
                'bio' => $professional->bio,
                'avatar' => $professional->avatar_path ? asset('storage/'.$professional->avatar_path) : null,
                'cover' => $professional->cover_path ? asset('storage/'.$professional->cover_path) : null,
                'years' => $professional->years_experience,
                'rating' => (float) $professional->rating_avg,
                'reviews' => $professional->reviews_count,
                'specialties' => $professional->specialties->pluck('name'),
                'is_accepting_bookings' => $professional->is_accepting_bookings,
                'is_demo' => $professional->is_demo,
                'services' => $services,
                'portfolio' => $portfolio,
            ],
            'business' => [
                'name' => $professional->business->name,
                'slug' => $professional->business->slug,
                'category' => $professional->business->category->name,
                'neighborhood' => $professional->business->neighborhood,
                'city' => $professional->business->city->name,
                'cover' => $professional->business->cover_path
                    ? asset('storage/'.$professional->business->cover_path)
                    : null,
            ],
            'colleagues' => $colleagues->map(fn (ProfessionalProfile $p) => [
                'name' => $p->display_name,
                'slug' => $p->slug,
                'headline' => $p->headline,
                'avatar' => $p->avatar_path ? asset('storage/'.$p->avatar_path) : null,
                'specialties' => $p->specialties->pluck('name')->take(2),
            ]),
        ]);
    }
}
