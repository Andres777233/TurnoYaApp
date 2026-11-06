import { Link, router } from '@inertiajs/react';
import { Check, Clock, Phone, Scissors } from 'lucide-react';

import { money } from '@/lib/format';

type Row = {
    code: string;
    time: string;
    customer: string;
    phone: string | null;
    service: string;
    professional: string;
    status: string;
    status_label: string;
    price_cents: number;
    confirmed: boolean;
    can_complete: boolean;
};

export default function PanelAgenda({
    business,
    role,
    appointments,
}: {
    business: { name: string; slug: string };
    role: string;
    appointments: Row[];
}) {
    return (
        <div className="mx-auto w-full max-w-[860px] px-4 py-6 lg:px-8">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-ceniza uppercase dark:text-muted-foreground">
                {business.name}
            </p>
            <h1 className="mt-2 font-display text-[30px] leading-none font-extrabold tracking-[-0.05em] text-ink lg:text-[38px] dark:text-foreground">
                Agenda de hoy
            </h1>
            <p className="mt-2 text-[13px] text-ceniza dark:text-muted-foreground">
                {role === 'professional'
                    ? 'Solo ves tus propios turnos.'
                    : 'Todos los turnos del negocio, ordenados por hora.'}
            </p>

            {appointments.length === 0 ? (
                <div className="mt-6 rounded-[20px] border border-dashed border-border bg-card p-8 text-center">
                    <Scissors className="mx-auto size-6 text-gold" strokeWidth={1.8} />
                    <p className="mt-3 text-[14px] font-semibold text-ink dark:text-foreground">
                        No hay turnos para hoy
                    </p>
                    <p className="mt-1 text-[12px] text-ceniza dark:text-muted-foreground">
                        Las reservas nuevas aparecen aquí automáticamente.
                    </p>
                </div>
            ) : (
                <ul className="mt-5 space-y-2">
                    {appointments.map((row) => (
                        <li
                            key={row.code}
                            className="flex flex-wrap items-center gap-3 rounded-[16px] border border-border bg-card p-3.5"
                        >
                            <span className="w-14 shrink-0 font-display text-[17px] font-bold text-ink tnum dark:text-foreground">
                                {row.time}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="text-[13.5px] font-semibold text-ink dark:text-foreground">
                                    {row.customer}
                                </p>
                                <p className="text-[11.5px] text-ceniza dark:text-muted-foreground">
                                    {row.service} · {row.professional}
                                </p>
                            </div>

                            <span
                                className={
                                    row.confirmed
                                        ? 'inline-flex items-center gap-1 rounded-full bg-green-soft px-2.5 py-1 text-[10px] font-semibold text-green-deep uppercase'
                                        : 'inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-[10px] font-semibold text-gold-deep uppercase'
                                }
                            >
                                {row.confirmed ? (
                                    <Check className="size-3" />
                                ) : (
                                    <Clock className="size-3" />
                                )}
                                {row.status_label}
                            </span>

                            <span className="text-[12.5px] font-semibold text-ink tnum dark:text-foreground">
                                {money(row.price_cents)}
                            </span>

                            {row.phone && (
                                <a
                                    href={`tel:${row.phone}`}
                                    aria-label={`Llamar a ${row.customer}`}
                                    className="grid size-9 place-items-center rounded-full border border-border text-ceniza"
                                >
                                    <Phone className="size-3.5" />
                                </a>
                            )}

                            {row.can_complete && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(`/panel/citas/${row.code}/atender`, {}, {
                                            preserveScroll: true,
                                        })
                                    }
                                    className="h-9 rounded-full bg-ink px-3 text-[11px] font-semibold text-cal"
                                >
                                    Marcar atendido
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <Link
                href={`/negocios/${business.slug}`}
                className="mt-6 inline-flex text-[12px] font-medium text-gold-deep"
            >
                Ver mi perfil público
            </Link>
        </div>
    );
}
