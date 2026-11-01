<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\BusinessCategory;
use App\Models\City;
use App\Models\ProfessionalProfile;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $city = City::active()->orderBy('sort_order')->first();

        $featured = Business::query()
            ->published()
            ->inActiveCity()
            ->with(['category', 'city'])
            ->withCount(['professionals' => fn ($q) => $q->where('is_public', true)])
            ->orderByDesc('rating_avg')
            ->orderByDesc('favorites_count')
            ->orderByDesc('published_at')
            ->orderBy('id')
            ->limit(3)
            ->get();

        $professionals = ProfessionalProfile::query()
            ->public()
            ->where('is_accepting_bookings', true)
            ->whereHas('business', fn ($q) => $q->published()->inActiveCity())
            ->with([
                'business.category',
                'specialties',
                'media' => fn ($q) => $q->where('collection', 'portfolio')
                    ->where('status', 'approved')
                    ->orderBy('sort_order'),
            ])
            ->orderByDesc('years_experience')
            ->limit(3)
            ->get();

        $categories = BusinessCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (BusinessCategory $category) => [
                'name' => $category->name,
                'slug' => $category->slug,
                'icon' => $category->icon,
                'count' => Business::published()
                    ->inActiveCity()
                    ->where('business_category_id', $category->id)
                    ->count(),
            ]);

        return Inertia::render('welcome', [
            'city' => $city ? [
                'name' => $city->name,
                'department' => $city->department,
            ] : null,
            'categories' => $categories,
            'featured' => $featured->map(fn (Business $business) => $this->businessCard($business)),
            'professionals' => $professionals->map(fn (ProfessionalProfile $professional) => [
                'name' => $professional->display_name,
                'slug' => $professional->slug,
                'headline' => $professional->headline,
                'avatar' => $professional->avatar_path ? asset('storage/'.$professional->avatar_path) : null,
                'cover' => $professional->media->first()?->url(),
                'specialties' => $professional->specialties->pluck('name')->take(2),
                'business' => $professional->business->name,
                'business_slug' => $professional->business->slug,
                'years' => $professional->years_experience,
            ]),
            'facts' => [
                'businesses' => Business::published()->inActiveCity()->count(),
                'professionals' => ProfessionalProfile::public()
                    ->whereHas('business', fn ($q) => $q->published()->inActiveCity())
                    ->count(),
                'services' => Service::active()
                    ->whereHas('business', fn ($q) => $q->published()->inActiveCity())
                    ->count(),
                'zones' => Business::published()->inActiveCity()
                    ->whereNotNull('neighborhood')
                    ->distinct()
                    ->count('neighborhood'),
            ],
            'zones' => Business::query()
                ->published()
                ->inActiveCity()
                ->whereNotNull('neighborhood')
                ->distinct()
                ->orderBy('neighborhood')
                ->pluck('neighborhood')
                ->take(8)
                ->values(),
        ]);
    }

    public function businessCard(Business $business): array
    {
        return [
            'name' => $business->name,
            'slug' => $business->slug,
            'tagline' => $business->tagline,
            'category' => $business->category->name,
            'neighborhood' => $business->neighborhood,
            'city' => $business->city->name,
            'cover' => $business->cover_path ? asset('storage/'.$business->cover_path) : null,
            'logo' => $business->logo_path ? asset('storage/'.$business->logo_path) : null,
            'rating' => (float) $business->rating_avg,
            'reviews' => $business->reviews_count,
            'favorites' => $business->favorites_count,
            'min_price_cents' => $business->min_price_cents,
            'professionals' => $business->professionals_count ?? null,
            'is_demo' => $business->is_demo,
            'price_level' => $business->price_level,
        ];
    }
}
