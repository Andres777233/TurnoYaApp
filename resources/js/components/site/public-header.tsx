import { Link, usePage } from '@inertiajs/react';
import { MapPin } from 'lucide-react';

import { Logo } from '@/components/site/logo';

type Shared = {
    auth: {
        user: { id: number; name: string } | null;
        role_view: string;
    };
};

const roleLabel: Record<string, string> = {
    cliente: 'Cliente',
    barbero: 'Barbero',
    dueno_barbero: 'Dueño-barbero',
    dueno_admin: 'Administrador',
};

export function PublicHeader() {
    const { auth } = usePage<Shared>().props;

    return (
        <header className="sticky top-0 z-30 border-b border-border/70 bg-cal/90 backdrop-blur-md dark:bg-background/90">
            <div className="mx-auto flex h-[60px] w-full max-w-[1240px] items-center justify-between gap-4 px-4 lg:px-8">
                <div className="flex items-center gap-4">
                    <Logo />
                    <span className="hidden items-center gap-1 text-[11px] font-medium text-ceniza sm:inline-flex dark:text-muted-foreground">
                        <MapPin className="size-3" strokeWidth={1.8} />
                        Popayán, Cauca
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {auth.user ? (
                        <>
                            <span className="hidden rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] text-ceniza uppercase sm:inline dark:text-muted-foreground">
                                {roleLabel[auth.role_view] ?? 'Cliente'}
                            </span>
                            <Link
                                href="/dashboard"
                                className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[12.5px] font-medium text-cal dark:bg-foreground dark:text-background"
                            >
                                {auth.user.name.split(' ')[0]}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-flex h-9 items-center rounded-full px-3 text-[12.5px] font-medium text-ink/80 hover:bg-foreground/5 dark:text-foreground/80"
                            >
                                Ingresar
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex h-9 items-center rounded-full bg-gold px-4 text-[12.5px] font-semibold text-ink"
                            >
                                Crear cuenta
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
