<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id', 'in_app_enabled', 'email_enabled', 'push_enabled',
        'reminders_enabled', 'vacancy_alerts_enabled', 'marketing_enabled',
        'quiet_hours_start', 'quiet_hours_end',
    ];

    protected function casts(): array
    {
        return [
            'in_app_enabled' => 'boolean',
            'email_enabled' => 'boolean',
            'push_enabled' => 'boolean',
            'reminders_enabled' => 'boolean',
            'vacancy_alerts_enabled' => 'boolean',
            'marketing_enabled' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Defaults used when a user has not configured anything yet. */
    public static function defaults(): array
    {
        return [
            'in_app_enabled' => true,
            'email_enabled' => true,
            'push_enabled' => true,
            'reminders_enabled' => true,
            'vacancy_alerts_enabled' => true,
            'marketing_enabled' => false,
        ];
    }
}
