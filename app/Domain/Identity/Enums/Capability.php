<?php

namespace App\Domain\Identity\Enums;

/**
 * Capabilities are granted per business membership. They are never global
 * and never inferred from a single `role` column.
 */
enum Capability: string
{
    case ManageBusiness = 'manage_business';
    case ManageTeam = 'manage_team';
    case ViewFinances = 'view_finances';
    case PerformServices = 'perform_services';

    public function label(): string
    {
        return match ($this) {
            self::ManageBusiness => 'Administrar el negocio',
            self::ManageTeam => 'Administrar el equipo',
            self::ViewFinances => 'Ver finanzas',
            self::PerformServices => 'Atender servicios',
        };
    }
}
