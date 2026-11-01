<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PresentsBusinesses;
use App\Models\Business;
use App\Models\BusinessCategory;
use App\Models\ProfessionalProfile;
use App\Models\VacancyOffer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExploreController extends Controller
{
    use PresentsBusinesses;

    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $favorites = $user
            ? $user->favorites()->pluck('business_id')->all()
            : [];

        $businesses = Business::query()
            ->published()
            ->inActiveCity()
            ->with(['category', 'city'])
            ->withCount(['professionals' => fn ($q) => $q->where('is_public', true)])
            ->orderByDesc('rating_avg')
            ->orderByDesc('reviews_count')
            ->orderBy('id')
            ->limit(8)
            ->get()
            ->map(fn (Business $business) => [
                ...$this->presentCard($business),
                'is_favorite' => in_array($business->id, $favorites, true),
                'open_offers' => 0,
            ]);

        $professionals = ProfessionalProfile::query()
            ->public()
            ->where('is_accepting_bookings', true)
            ->whereHas('business', fn ($q) => $q->published()->inActiveCity())
            ->with(['business', 'specialties', 'media' => fn ($q) => $q
                ->where('collection', 'portfolio')->where('status', 'approved')->orderBy('sort_order')])
            ->orderByDesc('rating_avg')
            ->orderByDesc('years_experience')
            ->limit(6)
            ->get()
            ->map(fn (ProfessionalProfile $profile) => [
                'name' => $profile->display_name,
                'slug' => $profile->slug,
                'headline' => $profile->headline,
                'avatar' => $profile->avatar_path ? asset('storage/'.$profile->avatar_path) : null,
                'cover' => $profile->media->first()?->url(),
                'specialties' => $profile->specialties->pluck('name')->take(2),
                'business' => $profile->business->name,
                'rating' => (float) $profile->rating_avg,
                'reviews' => $profile->reviews_count,
                'is_demo' => $profile->is_demo,
            ]);

        $categories = BusinessCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (BusinessCategory $category) => [
                'name' => $category->name,
                'slug' => $category->slug,
                'icon' => $category->icon,
                'count' => Business::published()->inActiveCity()
                    ->where('business_category_id', $category->id)->count(),
            ]);

        $offers = $user
            ? VacancyOffer::query()
                ->open()
                ->whereIn('business_id', $favorites)
                ->with(['business', 'professional', 'service'])
                ->orderBy('starts_at')
                ->limit(3)
                ->get()
                ->map(fn (VacancyOffer $offer) => [
                    'id' => $offer->id,
                    'business' => $offer->business->name,
                    'professional' => $offer->professional->display_name,
                    'service' => $offer->service->name,
                    'time' => $offer->starts_at->copy()
                        ->setTimezone($offer->business->timezone)->format('H:i'),
                    'price_cents' => $offer->service->price_cents,
                ])
            : collect();

        return Inertia::render('explore/index', [
            'businesses' => $businesses,
            'professionals' => $professionals,
            'categories' => $categories,
            'offers' => $offers,
            'city' => 'Popayán',
        ]);
    }
}
