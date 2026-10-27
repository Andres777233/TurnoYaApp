<?php

namespace App\Domain\Discover\Queries;

use App\Models\Business;
use Illuminate\Database\Eloquent\Builder;

/**
 * Single source of truth for public business search.
 * The UI never filters client-side; every filter is applied in SQL.
 */
class BusinessSearchQuery
{
    public function __construct(private readonly array $filters = []) {}

    public function build(): Builder
    {
        $query = Business::query()
            ->published()
            ->inActiveCity()
            ->with(['category', 'city'])
            ->withCount(['professionals' => fn ($q) => $q->where('is_public', true)]);

        $term = trim((string) ($this->filters['q'] ?? ''));

        if ($term !== '') {
            $query->where(function (Builder $q) use ($term) {
                $q->whereRaw(
                    "to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(tagline,'') || ' ' || coalesce(description,'')) @@ plainto_tsquery('spanish', ?)",
                    [$term],
                )->orWhere('name', 'ilike', '%'.$term.'%');
            });
        }

        if ($slug = $this->filters['category'] ?? null) {
            $query->whereHas('category', fn (Builder $q) => $q->where('slug', $slug));
        }

        if ($zone = $this->filters['zone'] ?? null) {
            $query->where('neighborhood', $zone);
        }

        if (($min = $this->filters['min'] ?? null) !== null) {
            $query->where('min_price_cents', '>=', (int) $min * 100);
        }

        if (($max = $this->filters['max'] ?? null) !== null) {
            $query->where('min_price_cents', '<=', (int) $max * 100);
        }

        if (($rating = $this->filters['rating'] ?? null) !== null) {
            $query->where('rating_avg', '>=', (float) $rating);
        }

        $this->applySort($query, $term);

        return $query;
    }

    private function applySort(Builder $query, string $term): void
    {
        match ($this->filters['sort'] ?? 'relevancia') {
            'calificacion' => $query->orderByDesc('rating_avg')->orderByDesc('reviews_count'),
            'precio_asc' => $query->orderBy('min_price_cents'),
            'precio_desc' => $query->orderByDesc('min_price_cents'),
            'recientes' => $query->orderByDesc('published_at'),
            default => $term !== ''
                ? $query->orderByRaw(
                    "ts_rank(to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(tagline,'') || ' ' || coalesce(description,'')), plainto_tsquery('spanish', ?)) DESC",
                    [$term],
                )->orderByDesc('rating_avg')
                : $query->orderByDesc('rating_avg')
                    ->orderByDesc('favorites_count')
                    ->orderByDesc('published_at'),
        };
    }
}
