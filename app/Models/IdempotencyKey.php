<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdempotencyKey extends Model
{
    protected $fillable = [
        'user_id', 'key', 'route', 'request_hash', 'response_status', 'response_body', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'response_body' => 'array',
            'expires_at' => 'datetime',
        ];
    }
}
