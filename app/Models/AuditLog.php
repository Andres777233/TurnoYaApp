<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'actor_user_id', 'business_id', 'action', 'subject_type', 'subject_id',
        'metadata', 'ip', 'user_agent', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    public static function record(string $action, ?int $businessId = null, array $metadata = []): self
    {
        return self::create([
            'actor_user_id' => auth()->id(),
            'business_id' => $businessId,
            'action' => $action,
            'metadata' => $metadata ?: null,
            'ip' => request()->ip(),
            'user_agent' => substr((string) request()->userAgent(), 0, 255),
            'created_at' => now(),
        ]);
    }
}
