<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Recurring weekly availability. `owner` is either a Business (opening hours)
 * or a ProfessionalProfile (personal working hours).
 */
class WorkingHour extends Model
{
    protected $fillable = ['owner_type', 'owner_id', 'weekday', 'start_time', 'end_time', 'is_active'];

    protected function casts(): array
    {
        return [
            'weekday' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function breaks()
    {
        return $this->hasMany(ScheduleBreak::class);
    }

    public function scopeForWeekday($query, int $weekday)
    {
        return $query->where('weekday', $weekday)->where('is_active', true);
    }
}
