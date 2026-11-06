import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Check, Clock, MapPin, X } from 'lucide-react';
import { useState } from 'react';

import { money } from '@/lib/format';
import { cn } from '@/lib/utils';

type AppointmentCard = {
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
};

export default function AppointmentsIndex({
    upcoming,
    past,
    reminder,
    offers,
}: {
    upcoming: AppointmentCard[];
    past: AppointmentCard[];
    reminder: {
        code: string;
        business: string;
        time: string;
        minutes: number;
    } | null;
    offers: {
        id: number;
        business: string;
        professional: string;
        service: string;
        time: string;
        price_cents: number;
    }[];
}) {
    return (
        <>
            <Head title="Mis reservas · TurnoYa" />

            <div className="mx-auto w-full max-w-[1040px] px-5 py-10 lg:px-8 lg:py-14">
                {reminder && (
                    <div
                        role="alert"
                        className="mb-6 rounded-[20px] border border-gold/40 bg-gold-soft p-4"
                    >
                        <p className="text-[14px] leading-snug font-semibold text-ink">
                            ⏰ Tu turno en {reminder.business} es en{' '}
                            {reminder.minutes} minutos ({reminder.time}). ¿Sí vas
                            a ir o prefieres cancelar de una vez?
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    router.post(
                                        `/reservas/${reminder.code}/confirmar`,
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-green-deep px-5 text-[13px] font-semibold text-white"
                            >
                                <Check className="size-4" strokeWidth={2.2} />
                                Sí, allá estaré
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    router.post(
                                        `/reservas/${reminder.code}/cancelar`,
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[#B91C1C] px-5 text-[13px] font-semibold text-white"
                            >
                                <X className="size-4" strokeWidth={2.2} />
                                No puedo ir, cancelar de una vez
                            </button>
                        </div>
                    </div>
                )}

                {offers.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {offers.map((offer) => (
                            <div
                                key={offer.id}
                                className="flex flex-wrap items-center gap-3 rounded-[18px] border border-border bg-card p-3.5"
                            >
                                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-ink">
                                    <Clock className="size-4" strokeWidth={2} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-semibold text-ink dark:text-foreground">
                                        ¡Se liberó un turno en {offer.business}!
                                    </p>
                                    <p className="text-[12px] text-ceniza dark:text-muted-foreground">
                                        Hoy {offer.time} con{' '}
                                        {offer.professional} · {offer.service} ·{' '}
                                        {money(offer.price_cents)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            `/cupos/${offer.id}/reclamar`,
                                        )
                                    }
                                    className="h-10 rounded-full bg-ink px-4 text-[12px] font-semibold text-cal"
                                >
                                    ¡Quiero este turno!
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.2em] text-ceniza uppercase dark:text-muted-foreground">
                            Tu cuenta
                        </p>
                        <h1 className="mt-2 font-display text-[34px] leading-none font-extrabold tracking-[-0.05em] text-ink lg:text-[44px] dark:text-foreground">
                            Mis reservas
                        </h1>
                    </div>
                    <Link
                        href="/descubrir"
                        className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[13px] font-medium text-cal dark:bg-foreground dark:text-background"
                    >
                        Reservar otra cita
                    </Link>
                </header>

                <section className="mt-10">
                    <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                        Próximas
                    </h2>

                    {upcoming.length === 0 ? (
                        <div className="mt-3 rounded-[20px] border border-dashed border-border bg-card p-8">
                            <p className="font-display text-[20px] font-bold tracking-[-0.03em] text-ink dark:text-foreground">
                                Todavía no tienes citas
                            </p>
                            <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                Encuentra un profesional cerca y reserva en
                                menos de un minuto.
                            </p>
                            <Link
                                href="/descubrir"
                                className="mt-4 inline-flex h-10 items-center rounded-full bg-gold px-5 text-[13px] font-semibold text-ink hover:bg-gold-deep"
                            >
                                Descubrir negocios
                            </Link>
                        </div>
                    ) : (
                        <ul className="mt-3 grid gap-3">
                            {upcoming.map((appointment) => (
                                <UpcomingCard
                                    key={appointment.code}
                                    appointment={appointment}
                                />
                            ))}
                        </ul>
                    )}
                </section>

                {past.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                            Historial
                        </h2>
                        <ul className="mt-3 divide-y divide-border rounded-[20px] border border-border bg-card">
                            {past.map((appointment) => (
                                <li
                                    key={appointment.code}
                                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-16 shrink-0 text-[12px] text-ceniza tnum dark:text-muted-foreground">
                                            {appointment.date_label}
                                        </span>
                                        <div>
                                            <p className="text-[13px] font-semibold text-ink dark:text-foreground">
                                                {appointment.service_name}
                                            </p>
                                            <p className="text-[11px] text-ceniza dark:text-muted-foreground">
                                                {appointment.business_name} ·{' '}
                                                {
                                                    appointment.professional_name
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[12px] font-medium text-ink tnum dark:text-foreground">
                                            {money(appointment.price_cents)}
                                        </span>
                                        <StatusChip
                                            label={appointment.status_label}
                                            tone={appointment.status_tone}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </>
    );
}

function UpcomingCard({ appointment }: { appointment: AppointmentCard }) {
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

    return (
        <li className="overflow-hidden rounded-[20px] border border-border bg-card">
            <div className="flex flex-wrap items-start gap-4 p-4 sm:flex-nowrap">
                <div className="flex w-[68px] shrink-0 flex-col items-center rounded-[14px] bg-ink py-2.5 text-cal">
                    <span className="text-[10px] font-semibold tracking-[0.08em] uppercase opacity-70">
                        {appointment.date_label.split(',')[0]}
                    </span>
                    <span className="mt-1 font-display text-[20px] leading-none font-bold">
                        {appointment.date_label.match(/\d+/)?.[0] ?? ''}
                    </span>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] font-semibold text-ink dark:text-foreground">
                            {appointment.service_name}
                        </h3>
                        <StatusChip
                            label={appointment.status_label}
                            tone={appointment.status_tone}
                        />
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ceniza dark:text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" strokeWidth={1.8} />
                            {appointment.time_label}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3" strokeWidth={1.8} />
                            {appointment.date_label}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" strokeWidth={1.8} />
                            {appointment.business_name}
                        </span>
                    </p>
                    <p className="mt-1 text-[12px] text-ceniza dark:text-muted-foreground">
                        Con {appointment.professional_name} ·{' '}
                        {money(appointment.price_cents)}
                    </p>
                </div>

                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-col">
                    <Link
                        href={`/reservas/${appointment.code}`}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-border px-4 text-[12px] font-medium text-ink dark:text-foreground"
                    >
                        Ver detalle
                    </Link>

                    {appointment.status === 'confirmed' && (
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={busy}
                            className="inline-flex h-9 items-center justify-center gap-1 rounded-full bg-ink px-4 text-[12px] font-medium text-cal disabled:opacity-50 dark:bg-foreground dark:text-background"
                        >
                            <Check className="size-3.5" strokeWidth={2} />
                            Confirmar
                        </button>
                    )}

                    {appointment.can_cancel && !confirming && (
                        <button
                            type="button"
                            onClick={() => setConfirming(true)}
                            className="inline-flex h-9 items-center justify-center rounded-full px-4 text-[12px] font-medium text-gold-deep hover:bg-gold-soft/40"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>

            {confirming && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-gold-soft/25 px-4 py-3">
                    <p className="text-[12px] text-ink dark:text-foreground">
                        ¿Cancelar esta cita? El horario se libera para otra
                        persona.
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            className="inline-flex h-8 items-center rounded-full border border-border px-3 text-[11px] font-medium"
                        >
                            No, mantener
                        </button>
                        <button
                            type="button"
                            onClick={cancel}
                            disabled={busy}
                            className="inline-flex h-8 items-center gap-1 rounded-full bg-gold px-3 text-[11px] font-semibold text-ink disabled:opacity-50"
                        >
                            <X className="size-3" strokeWidth={2} />
                            Sí, cancelar
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
}

function StatusChip({ label, tone }: { label: string; tone: string }) {
    const styles: Record<string, string> = {
        info: 'bg-ink/5 text-ink dark:bg-foreground/10 dark:text-foreground',
        success: 'bg-emerald-600/10 text-emerald-800 dark:text-emerald-400',
        warning: 'bg-amber-500/15 text-amber-800 dark:text-amber-400',
        muted: 'bg-muted text-ceniza dark:text-muted-foreground',
        danger: 'bg-gold/10 text-gold-deep',
    };

    return (
        <span
            className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] uppercase',
                styles[tone] ?? styles.info,
            )}
        >
            {label}
        </span>
    );
}
