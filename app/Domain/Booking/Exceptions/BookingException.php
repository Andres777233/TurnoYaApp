<?php

namespace App\Domain\Booking\Exceptions;

use RuntimeException;

class BookingException extends RuntimeException
{
    public function __construct(
        public readonly string $userMessage,
        int $status = 422,
    ) {
        parent::__construct($userMessage);
    }

    public static function slotTaken(): self
    {
        return new self('Ese horario acaba de ocuparse. Elige otro.', 409);
    }

    public static function outsideSchedule(): self
    {
        return new self('El profesional no atiende en ese horario.', 422);
    }

    public static function tooSoon(): self
    {
        return new self('Necesitamos más anticipación para reservar ese horario.', 422);
    }

    public static function serviceNotOffered(): self
    {
        return new self('Ese servicio no está disponible con este profesional.', 422);
    }

    public static function cannotCancel(): self
    {
        return new self('Esta cita ya no se puede cancelar.', 422);
    }
}
