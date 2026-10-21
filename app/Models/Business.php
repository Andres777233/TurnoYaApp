<?php

namespace App\Models;

use App\Domain\Identity\Enums\Capability;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Business extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'city_id', 'business_category_id', 'name', 'slug', 'tagline', 'description',
        'logo_path', 'cover_path', 'address_line', 'neighborhood', 'latitude', 'longitude',
        'phone', 'whatsapp', 'email', 'instagram', 'website', 'timezone', 'price_level',
        'is_published', 'is_demo', 'published_at', 'settings',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'price_level' => 'integer',
            'is_published' => 'boolean',
            'is_demo' => 'boolean',
            'published_at' => 'datetime',
            'rating_avg' => 'decimal:2',
            'reviews_count' => 'integer',
            'favorites_count' => 'integer',
            'min_price_cents' => 'integer',
            'settings' => 'array',
        ];
    }

    // ---------------------------------------------------------------- relations

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BusinessCategory::class, 'business_category_id');
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(BusinessMembership::class);
    }

    public function members(): HasMany
    {
        return $this->memberships()->where('status', 'active');
    }

    public function professionals(): HasMany
    {
        return $this->hasMany(ProfessionalProfile::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function serviceCategories(): HasMany
    {
        return $this->hasMany(ServiceCategory::class);
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    // ------------------------------------------------------------------ scopes

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)->whereNull('deleted_at');
    }

    public function scopeInActiveCity(Builder $query): Builder
    {
        return $query->whereHas('city', fn (Builder $q) => $q->where('is_active', true));
    }

    // --------------------------------------------------------------- behaviour

    /** Resolved settings with safe defaults; never null. */
    public function setting(string $key, mixed $default = null): mixed
    {
        return data_get($this->settings ?? [], $key, $default);
    }

    public function membershipFor(User $user): ?BusinessMembership
    {
        return $this->memberships
            ->first(fn (BusinessMembership $m) => $m->user_id === $user->id
                && $m->status->allowsAccess());
    }

    public function userCan(User $user, Capability $capability): bool
    {
        if ($user->is_platform_admin) {
            return true;
        }

        return $this->membershipFor($user)?->can($capability) ?? false;
    }

    public function coverUrl(): ?string
    {
        return $this->cover_path ? asset('storage/'.$this->cover_path) : null;
    }

    public function logoUrl(): ?string
    {
        return $this->logo_path ? asset('storage/'.$this->logo_path) : null;
    }
}
