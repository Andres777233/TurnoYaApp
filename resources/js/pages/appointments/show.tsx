import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Check, Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';

import { DemoBadge } from '@/components/site/demo-badge';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';

type Props = {
    appointment: {
        code: string;
        status: string;
        status_label: string;
        status_tone: string;
        starts_at: string;
        ends_at: string;
        date_label: string;
        time_label: string;
        price_cents: number;
        business_name: string;
        business_slug: string;
        service_name: string;
        professional_name: string;
        professional_avatar: string | null;
        can_cancel: boolean;
        notes: string | null;
        address: string;
        neighborhood: string | null;
        is_demo: boolean;
        cancellation_window_hours: number;
    };
};

export default function AppointmentShow({ appointment }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);

    const cancel = () => {
        setBusy(true);
        router.post(
            `/reservas/${appointment.code}/cancelar`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusy(false),
            },
        );
    };

    const confirm = () => {
        setBusy(true);
        router.post(
            `/reservas/${appointment.code}/confirmar`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusy(false),
            },
        );
    };

    const isConfirmed = ['confirmed', 'attendance_confirmed'].includes(
        appointment.status,
    );

    return (
        <>
            <Head title={`Reserva ${appointment.code} · TurnoYa`} />

            <div className="mx-auto w-full max-w-[880px] px-5 py-10 lg:px-8 lg:py-14">
                <Link
                    href="/mis-reservas"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ceniza hover:text-ink dark:text-muted-foreground dark:hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" strokeWidth={1.8} />
                    Mis reservas
                </Link>

                {props.flash?.success && (
                    <p className="mt-4 rounded-[14px] border border-emerald-600/20 bg-emerald-600/10 px-4 py-3 text-[13px] text-emerald-900 dark:text-emerald-300">
                        {props.flash.success}
                    </p>
                )}

                <div className="mt-6 overflow-hidden rounded-[24px] border border-border bg-card">
                    <div className="border-b border-border p-6 lg:p-8">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-ceniza uppercase dark:text-muted-foreground">
                                    {isConfirmed
                                        ? 'Reserva confirmada'
                                        : 'Reserva'}
                                </p>
                                <h1 className="mt-2 font-display text-[30px] leading-none font-extrabold tracking-[-0.045em] text-ink lg:text-[40px] dark:text-foreground">
                                    {appointment.service_name}
                                </h1>
                                <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-ceniza dark:text-muted-foreground">
                                    <span>{appointment.business_name}</span>
                                    {appointment.is_demo && <DemoBadge />}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-[10px] font-semibold tracking-[0.12em] text-ceniza uppercase dark:text-muted-foreground">
                                    Código
                                </p>
                                <p className="mt-1 font-display text-[18px] font-bold tracking-[-0.02em] text-ink tnum dark:text-foreground">
                                    {appointment.code}
                                </p>
                            </div>
                        </div>
                    </div>

                    <dl className="grid gap-px bg-border sm:grid-cols-2">
                        <Detail
                            icon={CalendarDays}
                            label="Fecha"
                            value={appointment.date_label}
                        />
                        <Detail
                            icon={Clock}
                            label="Hora"
                            value={appointment.time_label}
                        />
                        <Detail
                            icon={User}
                            label="Profesional"
                            value={appointment.professional_name}
                        />
                        <Detail
                            icon={MapPin}
                            label="Dirección"
                            value={`${appointment.address}${appointment.neighborhood ? `, ${appointment.neighborhood}` : ''}`}
                        />
                    </dl>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-6 lg:p-8">
                        <div>
                            <p className="text-[11px] tracking-[0.12em] text-ceniza uppercase dark:text-muted-foreground">
                                Total a pagar en el local
                            </p>
                            <p className="mt-1 font-display text-[26px] font-bold tracking-[-0.03em] text-ink tnum dark:text-foreground">
                                {money(appointment.price_cents)}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {appointment.status === 'confirmed' && (
                                <button
                                    type="button"
                                    onClick={confirm}
                                    disabled={busy}
                                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-[13px] font-medium text-cal disabled:opacity-50 dark:bg-foreground dark:text-background"
                                >
                                    <Check
                                        className="size-3.5"
                                        strokeWidth={2}
                                    />
                                    Confirmar asistencia
                                </button>
                            )}

                            {appointment.can_cancel && (
                                <button
                                    type="button"
                                    onClick={() => setConfirming(true)}
                                    className="inline-flex h-10 items-center rounded-full border border-border px-5 text-[13px] font-medium text-gold-deep"
                                >
                                    Cancelar cita
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {confirming && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-gold/30 bg-gold-soft/30 p-4">
                        <p className="max-w-md text-[13px] text-ink dark:text-foreground">
                            ¿Seguro que quieres cancelar? Podrás reservar de
                            nuevo si quedan horarios.
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirming(false)}
                                className="h-9 rounded-full border border-border px-4 text-[12px] font-medium"
                            >
                                Mantener cita
                            </button>
                            <button
                                type="button"
                                onClick={cancel}
                                disabled={busy}
                                className="h-9 rounded-full bg-gold px-4 text-[12px] font-semibold text-ink disabled:opacity-50"
                            >
                                Sí, cancelar
                            </button>
                        </div>
                    </div>
                )}

                <p className="mt-5 text-[12px] leading-relaxed text-ceniza dark:text-muted-foreground">
                    Recibirás un recordatorio 30 minutos antes. Puedes cancelar
                    sin costo hasta {appointment.cancellation_window_hours}{' '}
                    horas antes de la cita.
                    {appointment.notes
                        ? ` Nota enviada: “${appointment.notes}”.`
                        : ''}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                        href={`/negocios/${appointment.business_slug}`}
                        className="inline-flex h-10 items-center rounded-full border border-border px-5 text-[13px] font-medium text-ink dark:text-foreground"
                    >
                        Ver el negocio
                    </Link>
                    <Link
                        href="/mis-reservas"
                        className={cn(
                            'inline-flex h-10 items-center rounded-full px-5 text-[13px] font-medium',
                            'text-ceniza hover:text-ink dark:text-muted-foreground dark:hover:text-foreground',
                        )}
                    >
                        Volver a mis reservas
                    </Link>
                </div>
            </div>
        </>
    );
}

function Detail({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof CalendarDays;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 bg-card p-5">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-muted text-ink dark:text-foreground">
                <Icon className="size-3.5" strokeWidth={1.8} />
            </span>
            <span>
                <span className="block text-[10px] font-semibold tracking-[0.12em] text-ceniza uppercase dark:text-muted-foreground">
                    {label}
                </span>
                <span className="mt-0.5 block text-[14px] font-medium text-ink dark:text-foreground">
                    {value}
                </span>
            </span>
        </div>
    );
}
