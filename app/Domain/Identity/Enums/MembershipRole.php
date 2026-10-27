<?php

namespace App\Domain\Identity\Enums;

enum MembershipRole: string
{
    case Owner = 'owner';
    case Admin = 'admin';
    case Professional = 'professional';

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'Propietario',
            self::Admin => 'Administrador',
            self::Professional => 'Profesional',
        };
    }

    /** Owners implicitly hold every capability. */
    public function defaultCapabilities(): array
    {
        return match ($this) {
            self::Owner => [
                Capability::ManageBusiness,
                Capability::ManageTeam,
                Capability::ViewFinances,
                Capability::PerformServices,
            ],
            self::Admin => [
                Capability::ManageBusiness,
                Capability::ManageTeam,
            ],
            self::Professional => [
                Capability::PerformServices,
            ],
        };
    }
}
