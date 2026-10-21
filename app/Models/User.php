<?php

namespace App\Models;

use App\Domain\Identity\Enums\Capability;
use App\Domain\Identity\Enums\MembershipStatus;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name', 'email', 'password', 'phone', 'document_type', 'document_number',
    'birth_date', 'avatar_path', 'is_active',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'document_number'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, SoftDeletes, TwoFactorAuthenticatable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'birth_date' => 'date',
            'document_number' => 'encrypted',
            'is_platform_admin' => 'boolean',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    // ---------------------------------------------------------------- relations

    public function memberships(): HasMany
    {
        return $this->hasMany(BusinessMembership::class);
    }

    public function businesses(): BelongsToMany
    {
        return $this->belongsToMany(Business::class, 'business_memberships')
            ->withPivot(['role', 'status', 'performs_services'])
            ->withTimestamps();
    }

    public function professionalProfiles(): HasMany
    {
        return $this->hasMany(ProfessionalProfile::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function notificationPreference(): HasOne
    {
        return $this->hasOne(NotificationPreference::class);
    }

    // --------------------------------------------------------------- behaviour

    public function activeMembershipFor(Business $business): ?BusinessMembership
    {
        return $this->memberships()
            ->where('business_id', $business->id)
            ->where('status', MembershipStatus::Active->value)
            ->first();
    }

    public function canFor(Business $business, Capability $capability): bool
    {
        if ($this->is_platform_admin) {
            return true;
        }

        return $this->activeMembershipFor($business)?->can($capability) ?? false;
    }

    public function belongsToBusiness(Business $business): bool
    {
        return $this->activeMembershipFor($business) !== null;
    }

    /** Capabilities for the currently selected business, used by the panel shell. */
    public function capabilitiesFor(Business $business): array
    {
        $membership = $this->activeMembershipFor($business);

        if (! $membership) {
            return [];
        }

        return collect(Capability::cases())
            ->filter(fn (Capability $c) => $membership->can($c))
            ->map(fn (Capability $c) => $c->value)
            ->values()
            ->all();
    }

    public function preferenceRecord(): NotificationPreference
    {
        return $this->notificationPreference
            ?? NotificationPreference::create([
                'user_id' => $this->id,
                ...NotificationPreference::defaults(),
            ]);
    }

    public function isFavorite(Business $business): bool
    {
        return $this->favorites()->where('business_id', $business->id)->exists();
    }

    public function initials(): string
    {
        $parts = preg_split('/\s+/', trim($this->name)) ?: [];
        $initials = collect($parts)->take(2)->map(fn ($p) => mb_strtoupper(mb_substr($p, 0, 1)))->implode('');

        return $initials ?: '?';
    }
}
