<?php

namespace App\Domain\Booking\Enums;

enum AppointmentStatus: string
{
    case PendingPayment = 'pending_payment';
    case Confirmed = 'confirmed';
    case AttendanceConfirmed = 'attendance_confirmed';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
    case NoShow = 'no_show';

    public function label(): string
    {
        return match ($this) {
            self::PendingPayment => 'Pago pendiente',
            self::Confirmed => 'Confirmada',
            self::AttendanceConfirmed => 'Asistencia confirmada',
            self::Cancelled => 'Cancelada',
            self::Completed => 'Completada',
            self::NoShow => 'No asistió',
        };
    }

    /** Statuses that occupy the professional's calendar. */
    public function blocksCalendar(): bool
    {
        return in_array($this, [
            self::PendingPayment,
            self::Confirmed,
            self::AttendanceConfirmed,
            self::Completed,
        ], true);
    }

    public function isTerminal(): bool
    {
        return in_array($this, [
            self::Cancelled,
            self::Completed,
            self::NoShow,
        ], true);
    }

    public function tone(): string
    {
        return match ($this) {
            self::PendingPayment => 'warning',
            self::Confirmed, self::AttendanceConfirmed => 'info',
            self::Completed => 'success',
            self::Cancelled => 'muted',
            self::NoShow => 'danger',
        };
    }
}
