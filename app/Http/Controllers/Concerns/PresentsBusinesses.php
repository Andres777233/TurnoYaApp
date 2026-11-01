<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Business;

/**
 * Serialises a business into the shape the React cards expect.
 * Keeping it in one place avoids drifting presentation between pages.
 */
trait PresentsBusinesses
{
    protected function presentCard(Business $business): array
    {
        return [
            'name' => $business->name,
            'slug' => $business->slug,
            'tagline' => $business->tagline,
            'category' => $business->category?->name,
            'category_slug' => $business->category?->slug,
            'neighborhood' => $business->neighborhood,
            'city' => $business->city?->name,
            'cover' => $business->cover_path ? asset('storage/'.$business->cover_path) : null,
            'logo' => $business->logo_path ? asset('storage/'.$business->logo_path) : null,
            'rating' => (float) $business->rating_avg,
            'reviews' => $business->reviews_count,
            'favorites' => $business->favorites_count,
            'min_price_cents' => $business->min_price_cents,
            'professionals' => $business->professionals_count ?? null,
            'price_level' => $business->price_level,
            'is_demo' => $business->is_demo,
        ];
    }

    protected function presentMapPoint(Business $business): array
    {
        return [
            'name' => $business->name,
            'slug' => $business->slug,
            'lat' => (float) $business->latitude,
            'lng' => (float) $business->longitude,
            'neighborhood' => $business->neighborhood,
            'rating' => (float) $business->rating_avg,
            'min_price_cents' => $business->min_price_cents,
            'cover' => $business->cover_path ? asset('storage/'.$business->cover_path) : null,
            'is_demo' => $business->is_demo,
        ];
    }
}
