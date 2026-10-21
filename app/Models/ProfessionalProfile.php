<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProfessionalProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'business_id', 'user_id', 'display_name', 'slug', 'headline', 'bio',
        'avatar_path', 'cover_path', 'years_experience', 'is_public',
        'is_accepting_bookings', 'is_demo',
    ];

    protected function casts(): array
    {
        return [
            'years_experience' => 'integer',
            'is_public' => 'boolean',
            'is_accepting_bookings' => 'boolean',
            'is_demo' => 'boolean',
            'rating_avg' => 'decimal:2',
            'reviews_count' => 'integer',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function specialties(): BelongsToMany
    {
        return $this->belongsToMany(Specialty::class, 'professional_specialty');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'professional_service')
            ->withPivot(['price_cents', 'duration_minutes', 'is_active'])
            ->withTimestamps();
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'professional_profile_id');
    }

    public function portfolio()
    {
        return $this->media()->where('collection', 'portfolio')->orderBy('sort_order');
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    public function avatarUrl(): ?string
    {
        return $this->avatar_path ? asset('storage/'.$this->avatar_path) : null;
    }
}
