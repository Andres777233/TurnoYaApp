import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Compass,
    Heart,
    Map,
    Scissors,
    Store,
    Users,
    Wallet,
} from 'lucide-react';

import { cn } from '@/lib/utils';

type RoleView = 'cliente' | 'barbero' | 'dueno_barbero' | 'dueno_admin';

type Shared = {
    auth: {
        user: { id: number; name: string } | null;
        role_view: RoleView;
        business_slug: string | null;
    };
};

type Item = {
    label: string;
    href: string;
    icon: typeof Compass;
};

const clientItems: Item[] = [
    { label: 'Explorar', href: '/', icon: Compass },
    { label: 'Mapa', href: '/mapa', icon: Map },
    { label: 'Favoritos', href: '/favoritos', icon: Heart },
    { label: 'Mis turnos', href: '/turnos', icon: CalendarDays },
];

const barberItems: Item[] = [
    { label: 'Agenda hoy', href: '/panel/agenda', icon: CalendarDays },
    { label: 'Mi perfil', href: '/panel/perfil', icon: Scissors },
    { label: 'Mi negocio', href: '/panel/negocio', icon: Store },
    { label: 'Mis propinas', href: '/panel/propinas', icon: Wallet },
];

const ownerAdminItems: Item[] = [
    { label: 'Agenda hoy', href: '/panel/agenda', icon: CalendarDays },
    { label: 'Mi negocio', href: '/panel/negocio', icon: Store },
    { label: 'Equipo', href: '/panel/equipo', icon: Users },
    { label: 'Ingresos', href: '/panel/ingresos', icon: Wallet },
];

function itemsFor(role: RoleView): Item[] {
    if (role === 'cliente') {
        return clientItems;
    }

    if (role === 'dueno_admin') {
        return ownerAdminItems;
    }

    // Rol 2 (empleado) y Rol 3 (dueño-barbero) comparten las cuatro vistas.
    return barberItems;
}

/**
 * Barra inferior del contrato: máximo 4 botones con icono y texto.
 * En escritorio se mantiene como dock inferior centrado.
 */
export function BottomNav() {
    const { auth } = usePage<Shared>().props;
    const items = itemsFor(auth.role_view);
    const current = usePage().url.split('?')[0];

    const isActive = (href: string) => {
        if (href === '/') {
            return current === '/';
        }

        return current === href || current.startsWith(`${href}/`);
    };

    return (
        <nav
            aria-label="Navegación principal"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-cal/95 backdrop-blur-md dark:bg-background/95"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <ul className="mx-auto grid w-full max-w-[640px] grid-cols-4 px-1 py-1.5">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[10.5px] font-medium transition-colors',
                                    active
                                        ? 'text-ink dark:text-foreground'
                                        : 'text-ceniza hover:text-ink dark:text-muted-foreground',
                                )}
                            >
                                <span
                                    className={cn(
                                        'grid size-8 place-items-center rounded-full transition-colors',
                                        active
                                            ? 'bg-gold text-ink'
                                            : 'bg-transparent',
                                    )}
                                >
                                    <Icon
                                        className="size-[18px]"
                                        strokeWidth={active ? 2.1 : 1.7}
                                    />
                                </span>
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
