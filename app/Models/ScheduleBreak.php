<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A named pause inside a working hour (lunch, class, errand). */
class ScheduleBreak extends Model
{
    protected $table = 'breaks';

    protected $fillable = ['working_hour_id', 'start_time', 'end_time', 'label'];

    public function workingHour()
    {
        return $this->belongsTo(WorkingHour::class);
    }
}
