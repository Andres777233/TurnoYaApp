<?php

namespace App\Http\Controllers;

use App\Domain\Discover\Queries\BusinessSearchQuery;
use App\Http\Controllers\Concerns\PresentsBusinesses;
use App\Models\Business;
use App\Models\BusinessCategory;
use App\Models\City;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiscoverController extends Controller
{
    use PresentsBusinesses;

    public function __invoke(Request $request): Response
    {
        $filters = [
            'q' => (string) $request->string('q'),
            'category' => $request->string('categoria')->toString() ?: null,
            'zone' => $request->string('zona')->toString() ?: null,
            'min' => $request->filled('min') ? $request->integer('min') : null,
            'max' => $request->filled('max') ? $request->integer('max') : null,
            'rating' => $request->filled('rating') ? (float) $request->input('rating') : null,
            'sort' => $request->string('orden', 'relevancia')->toString(),
            'view' => $request->string('vista', 'lista')->toString() === 'mapa' ? 'mapa' : 'lista',
        ];

        $paginator = (new BusinessSearchQuery($filters))->build()->paginate(9)->withQueryString();

        $city = City::active()->orderBy('sort_order')->first();

        $zones = Business::query()
            ->published()
            ->inActiveCity()
            ->whereNotNull('neighborhood')
            ->distinct()
            ->orderBy('neighborhood')
            ->pluck('neighborhood');

        $priceRange = Business::query()
            ->published()
            ->inActiveCity()
            ->whereNotNull('min_price_cents')
            ->selectRaw('min(min_price_cents) as min, max(min_price_cents) as max')
            ->first();

        // Map points ignore pagination but stay bounded.
        $mapPoints = (new BusinessSearchQuery($filters))->build()
            ->select(['id', 'name', 'slug', 'latitude', 'longitude', 'cover_path', 'rating_avg', 'neighborhood', 'min_price_cents', 'is_demo'])
            ->limit(150)
            ->get()
            ->map(fn (Business $business) => $this->presentMapPoint($business));

        return Inertia::render('discover/index', [
            'filters' => $filters,
            'results' => $paginator->through(fn (Business $business) => $this->presentCard($business)),
            'mapPoints' => $mapPoints,
            'city' => $city ? [
                'name' => $city->name,
                'department' => $city->department,
                'lat' => (float) $city->center_latitude,
                'lng' => (float) $city->center_longitude,
            ] : null,
            'options' => [
                'categories' => BusinessCategory::where('is_active', true)
                    ->orderBy('sort_order')
                    ->get(['name', 'slug']),
                'zones' => $zones,
                'priceFloor' => $priceRange?->min ? (int) round($priceRange->min / 100) : 0,
                'priceCeiling' => $priceRange?->max ? (int) round($priceRange->max / 100) : 300000,
            ],
            'mapsConfigured' => filled(config('services.google.maps_browser_key')),
            'mapsKey' => config('services.google.maps_browser_key'),
        ]);
    }
}
