<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppointmentStatusHistory extends Model
{
    public $timestamps = false;

    protected $table = 'appointment_status_history';

    protected $fillable = [
        'appointment_id', 'from_status', 'to_status', 'actor_user_id',
        'reason', 'metadata', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
