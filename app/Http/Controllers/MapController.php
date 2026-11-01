<?php

namespace App\Http\Controllers;

use App\Models\Business;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $businesses = Business::query()
            ->published()
            ->inActiveCity()
            ->with('category')
            ->orderByDesc('rating_avg')
            ->limit(120)
            ->get()
            ->map(fn (Business $business) => [
                'name' => $business->name,
                'slug' => $business->slug,
                'category' => $business->category->name,
                'neighborhood' => $business->neighborhood,
                'address' => $business->address_line,
                'lat' => (float) $business->latitude,
                'lng' => (float) $business->longitude,
                'rating' => (float) $business->rating_avg,
                'min_price_cents' => $business->min_price_cents,
                'cover' => $business->cover_path ? asset('storage/'.$business->cover_path) : null,
                'is_demo' => $business->is_demo,
            ]);

        return Inertia::render('map/index', [
            'businesses' => $businesses,
            'center' => ['lat' => 2.4448, 'lng' => -76.6147],
        ]);
    }
}
