<?php

namespace App\Models;

use App\Domain\Identity\Enums\Capability;
use App\Domain\Identity\Enums\MembershipRole;
use App\Domain\Identity\Enums\MembershipStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessMembership extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id', 'user_id', 'role', 'status',
        'can_manage_business', 'can_manage_team', 'can_view_finances', 'performs_services',
        'invited_by_id', 'invited_email', 'invitation_token', 'invitation_expires_at',
        'accepted_at', 'revoked_at',
    ];

    protected $hidden = ['invitation_token'];

    protected function casts(): array
    {
        return [
            'role' => MembershipRole::class,
            'status' => MembershipStatus::class,
            'can_manage_business' => 'boolean',
            'can_manage_team' => 'boolean',
            'can_view_finances' => 'boolean',
            'performs_services' => 'boolean',
            'invitation_expires_at' => 'datetime',
            'accepted_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by_id');
    }

    /**
     * A capability is granted when the membership is active AND either the role
     * is owner (implicit) or the stored flag is true.
     */
    public function can(Capability $capability): bool
    {
        if (! $this->status->allowsAccess()) {
            return false;
        }

        if ($this->role === MembershipRole::Owner) {
            return true;
        }

        return match ($capability) {
            Capability::ManageBusiness => $this->can_manage_business,
            Capability::ManageTeam => $this->can_manage_team,
            Capability::ViewFinances => $this->can_view_finances,
            Capability::PerformServices => $this->performs_services,
        };
    }

    public function scopeActive($query)
    {
        return $query->where('status', MembershipStatus::Active->value);
    }
}
