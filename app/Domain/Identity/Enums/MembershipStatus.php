<?php

namespace App\Domain\Identity\Enums;

enum MembershipStatus: string
{
    case Invited = 'invited';
    case Active = 'active';
    case Suspended = 'suspended';
    case Revoked = 'revoked';

    public function allowsAccess(): bool
    {
        return $this === self::Active;
    }
}
