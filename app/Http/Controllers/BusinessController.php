<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PresentsBusinesses;
use App\Models\Business;
use App\Models\ProfessionalProfile;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    use PresentsBusinesses;

    public function show(Request $request, Business $business): Response
    {
        abort_unless($business->is_published && $business->city->is_active, 404);

        $business->load([
            'category',
            'city',
            'media' => fn ($q) => $q->where('status', 'approved')->orderBy('sort_order'),
            'services' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order'),
            'services.category',
            'services.professionals',
        ]);

        $professionals = ProfessionalProfile::query()
            ->where('business_id', $business->id)
            ->public()
            ->with(['specialties', 'media' => fn ($q) => $q->where('collection', 'portfolio')->where('status', 'approved')])
            ->orderByDesc('rating_avg')
            ->get();

        $services = $business->services
            ->groupBy(fn (Service $service) => $service->category?->name ?? 'Servicios')
            ->map(fn ($group, $categoryName) => [
                'category' => $categoryName,
                'items' => $group->map(fn (Service $service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'duration' => $service->duration_minutes,
                    'price_cents' => $service->price_cents,
                    'professionals' => $service->professionals
                        ->where('pivot.is_active', true)
                        ->map(fn (ProfessionalProfile $p) => [
                            'name' => $p->display_name,
                            'slug' => $p->slug,
                        ])->values(),
                ])->values(),
            ])->values();

        $similar = Business::query()
            ->published()
            ->inActiveCity()
            ->where('id', '!=', $business->id)
            ->where('business_category_id', $business->business_category_id)
            ->with(['category', 'city'])
            ->withCount(['professionals' => fn ($q) => $q->where('is_public', true)])
            ->limit(3)
            ->get();

        return Inertia::render('businesses/show', [
            'business' => [
                ...$this->presentCard($business),
                'professionals' => $professionals->count(),
                'description' => $business->description,
                'address' => $business->address_line,
                'lat' => (float) $business->latitude,
                'lng' => (float) $business->longitude,
                'phone' => $business->phone,
                'whatsapp' => $business->whatsapp,
                'instagram' => $business->instagram,
                'website' => $business->website,
                'gallery' => $business->media->map(fn ($media) => [
                    'url' => $media->url(),
                    'alt' => $media->alt_text,
                    'kind' => $media->kind,
                    'is_demo' => $media->is_demo,
                ])->values(),
                'services' => $services,
                'is_favorite' => $request->user()?->isFavorite($business) ?? false,
                'review_list' => \App\Models\Review::approved()
                    ->where('business_id', $business->id)
                    ->with('customer')
                    ->latest()
                    ->limit(6)
                    ->get()
                    ->map(fn (\App\Models\Review $review) => [
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'customer' => $review->customer->name,
                        'date' => $review->created_at->locale('es')->translatedFormat('d M'),
                        'is_demo' => $review->is_demo,
                    ]),
            ],
            'professionals' => $professionals->map(fn (ProfessionalProfile $professional) => [
                'name' => $professional->display_name,
                'slug' => $professional->slug,
                'headline' => $professional->headline,
                'avatar' => $professional->avatar_path ? asset('storage/'.$professional->avatar_path) : null,
                'years' => $professional->years_experience,
                'specialties' => $professional->specialties->pluck('name'),
                'portfolio' => $professional->media->map(fn ($m) => $m->url())->take(3)->values(),
                'is_demo' => $professional->is_demo,
            ])->values(),
            'similar' => $similar->map(fn (Business $b) => $this->presentCard($b)),
            'mapsConfigured' => filled(config('services.google.maps_browser_key')),
        ]);
    }
}
