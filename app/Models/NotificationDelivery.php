<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationDelivery extends Model
{
    protected $fillable = [
        'user_id', 'business_id', 'appointment_id', 'channel', 'type',
        'dedupe_key', 'sent_at', 'failed_at', 'error',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
