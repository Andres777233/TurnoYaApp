<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One-off unavailability: holiday, personal time, temporary block. */
class AvailabilityBlock extends Model
{
    protected $fillable = ['professional_profile_id', 'starts_at', 'ends_at', 'reason', 'created_by'];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function professional()
    {
        return $this->belongsTo(ProfessionalProfile::class, 'professional_profile_id');
    }

    public function scopeOverlapping($query, \DateTimeInterface $start, \DateTimeInterface $end)
    {
        return $query->where('starts_at', '<', $end)->where('ends_at', '>', $start);
    }
}
