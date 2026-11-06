import { router, usePage } from '@inertiajs/react';
import { ChevronDown, Wrench, X } from 'lucide-react';
import { useState } from 'react';

const roles = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'barbero', label: 'Barbero empleado' },
    { key: 'dueno_barbero', label: 'Dueño-barbero' },
    { key: 'dueno_admin', label: 'Dueño con 5 barberos' },
];

/**
 * Panel de prueba. Solo se renderiza cuando APP_ENV=local (config app.demo_mode).
 */
export function DemoPanel() {
    const { demoMode, auth } = usePage<{
        demoMode: boolean;
        auth: { role_view: string; user: { name: string } | null };
    }>().props;

    const [open, setOpen] = useState(false);

    if (!demoMode) {
        return null;
    }

    return (
        <div className="fixed right-3 bottom-[76px] z-50 print:hidden">
            {open && (
                <div className="mb-2 w-[270px] rounded-[18px] border border-border bg-card p-3 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.1em] text-ceniza uppercase">
                            Modo de prueba
                        </p>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar panel"
                            className="text-ceniza"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    <p className="mt-2 text-[11px] text-ceniza">
                        Ver como{' '}
                        <span className="font-semibold text-ink dark:text-foreground">
                            {auth.user?.name ?? 'invitado'}
                        </span>
                    </p>

                    <div className="mt-2 grid gap-1.5">
                        {roles.map((role) => (
                            <button
                                key={role.key}
                                type="button"
                                onClick={() =>
                                    router.post('/_demo/rol', { role: role.key })
                                }
                                className={
                                    auth.role_view === role.key
                                        ? 'rounded-[10px] bg-gold px-3 py-2 text-left text-[12px] font-semibold text-ink'
                                        : 'rounded-[10px] border border-border px-3 py-2 text-left text-[12px] font-medium text-ink dark:text-foreground'
                                }
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-3 border-t border-border pt-2">
                        <button
                            type="button"
                            onClick={() => router.post('/_demo/recordatorio')}
                            className="w-full rounded-[10px] border border-border px-3 py-2 text-left text-[11.5px] font-medium text-ink dark:text-foreground"
                        >
                            Disparar recordatorio 30 min
                        </button>
                        <button
                            type="button"
                            onClick={() => router.post('/_demo/cupo')}
                            className="mt-1.5 w-full rounded-[10px] border border-border px-3 py-2 text-left text-[11.5px] font-medium text-ink dark:text-foreground"
                        >
                            Simular cupo libre en favorito
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/mapa')}
                            className="mt-1.5 w-full rounded-[10px] border border-border px-3 py-2 text-left text-[11.5px] font-medium text-ink dark:text-foreground"
                        >
                            Abrir mapa y simulador GPS
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="ml-auto flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-[11.5px] font-semibold text-cal shadow-xl"
            >
                <Wrench className="size-3.5 text-gold" />
                Modo de prueba
                <ChevronDown
                    className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>
        </div>
    );
}
