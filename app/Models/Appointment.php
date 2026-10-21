<?php

namespace App\Models;

use App\Domain\Booking\Enums\AppointmentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'business_id', 'professional_profile_id', 'service_id', 'customer_id',
        'starts_at', 'ends_at', 'blocked_until', 'status', 'price_cents', 'currency',
        'payment_policy', 'payment_due_cents', 'held_until', 'customer_notes',
        'cancellation_reason', 'cancelled_by', 'cancelled_at',
        'attendance_confirmed_at', 'completed_at', 'no_show_at', 'reminder_sent_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'blocked_until' => 'datetime',
            'held_until' => 'datetime',
            'status' => AppointmentStatus::class,
            'price_cents' => 'integer',
            'payment_due_cents' => 'integer',
            'cancelled_at' => 'datetime',
            'attendance_confirmed_at' => 'datetime',
            'completed_at' => 'datetime',
            'no_show_at' => 'datetime',
            'reminder_sent_at' => 'datetime',
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

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function history()
    {
        return $this->hasMany(AppointmentStatusHistory::class);
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('starts_at', '>=', now())
            ->whereIn('status', [
                AppointmentStatus::PendingPayment->value,
                AppointmentStatus::Confirmed->value,
                AppointmentStatus::AttendanceConfirmed->value,
            ]);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [
            AppointmentStatus::PendingPayment->value,
            AppointmentStatus::Confirmed->value,
            AppointmentStatus::AttendanceConfirmed->value,
        ]);
    }

    public function startsAtLocal(): Carbon
    {
        return $this->starts_at->copy()->setTimezone($this->business->timezone);
    }

    public function canBeCancelledBy(User $user): bool
    {
        if ($this->status->isTerminal() || $this->starts_at->isPast()) {
            return false;
        }

        if ($this->customer_id === $user->id) {
            return true;
        }

        return $this->business->membershipFor($user) !== null;
    }

    public static function generateCode(): string
    {
        do {
            $code = 'TY-'.Str::upper(Str::random(6));
        } while (self::withTrashed()->where('code', $code)->exists());

        return $code;
    }

    public function isLateCancellation(int $windowHours): bool
    {
        $minutesUntilStart = (int) now()->diffInMinutes($this->starts_at, false);

        return $minutesUntilStart < $windowHours * 60;
    }
}
