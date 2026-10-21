<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VacancyOffer extends Model
{
    protected $fillable = [
        'business_id', 'professional_profile_id', 'service_id',
        'released_from_appointment_id', 'starts_at', 'ends_at', 'blocked_until',
        'status', 'claimed_by', 'claimed_at', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'blocked_until' => 'datetime',
            'claimed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function professional()
    {
        return $this->belongsTo(ProfessionalProfile::class, 'professional_profile_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function claimedBy()
    {
        return $this->belongsTo(User::class, 'claimed_by');
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open')->where('expires_at', '>', now());
    }
}
