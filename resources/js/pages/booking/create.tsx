import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Check, Clock, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { DemoBadge } from '@/components/site/demo-badge';
import { money, duration as formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';

type ServiceOption = {
    id: number;
    name: string;
    description: string | null;
    duration: number;
    price_cents: number;
    professionals: { id: number; name: string; avatar: string | null }[];
};

type ProfessionalOption = {
    id: number;
    name: string;
    headline: string | null;
    avatar: string | null;
};

type Slot = { starts_at: string; local: string };

type Props = {
    business: {
        name: string;
        slug: string;
        neighborhood: string | null;
        address: string;
        timezone: string;
        cover: string | null;
        cancellation_window_hours: number;
        payment_policy: string;
        is_demo: boolean;
    };
    services: ServiceOption[];
    professionals: ProfessionalOption[];
    selection: {
        service: number | null;
        professional: number | null;
        date: string | null;
    };
    maxHorizonDays: number;
};

export default function BookingCreate({
    business,
    services,
    professionals,
    selection,
    maxHorizonDays,
}: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } | null } }>()
        .props;
    const form = useForm({
        service_id: selection.service ?? (null as number | null),
        professional_id: selection.professional ?? (null as number | null),
        starts_at: '',
        notes: '',
    });

    const [date, setDate] = useState<string>(selection.date ?? '');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(false);
    const [slot, setSlot] = useState<Slot | null>(null);
    const [availabilityError, setAvailabilityError] = useState<string | null>(
        null,
    );

    // Stable per booking intent: a network retry of the same submit cannot
    // create a second appointment.
    const idempotencyKey = useMemo(
        () =>
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        [
            form.data.service_id,
            form.data.professional_id,
            slot?.starts_at,
        ],
    );

    const days = useMemo(
        () => buildDays(business.timezone, Math.min(maxHorizonDays, 21)),
        [business.timezone, maxHorizonDays],
    );

    useEffect(() => {
        if (!date) {
            setDate(days[0]?.value ?? '');
        }
    }, [date, days]);

    const service = services.find((item) => item.id === form.data.service_id);

    const eligibleProfessionals = useMemo(() => {
        if (!service) {
            return professionals;
        }

        const allowed = new Set(service.professionals.map((p) => p.id));

        return professionals.filter((p) => allowed.has(p.id));
    }, [professionals, service]);

    useEffect(() => {
        if (!form.data.service_id || !date) {
            setSlots([]);

            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setAvailabilityError(null);
        setSlot(null);

        const params = new URLSearchParams({
            service_id: String(form.data.service_id),
            date,
        });

        if (form.data.professional_id) {
            params.set('professional_id', String(form.data.professional_id));
        }

        fetch(`/negocios/${business.slug}/disponibilidad?${params}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('availability');
                }

                return response.json();
            })
            .then((payload) => setSlots(payload.slots ?? []))
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    setAvailabilityError(
                        'No pudimos cargar la disponibilidad. Intenta de nuevo.',
                    );
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [business.slug, date, form.data.service_id, form.data.professional_id]);

    const submit = () => {
        if (!slot) {
            return;
        }

        form.transform((data) => ({
            ...data,
            starts_at: slot.starts_at,
        }));

        form.post(`/negocios/${business.slug}/reservar`, {
            headers: { 'Idempotency-Key': idempotencyKey },
        });
    };

    return (
        <>
            <Head title={`Reservar en ${business.name} · TurnoYa`} />

            <div className="mx-auto w-full max-w-[1120px] px-5 py-8 lg:px-8 lg:py-12">
                <Link
                    href={`/negocios/${business.slug}`}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ceniza hover:text-ink dark:text-muted-foreground dark:hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" strokeWidth={1.8} />
                    Volver al negocio
                </Link>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-display text-[30px] leading-none font-extrabold tracking-[-0.045em] text-ink lg:text-[38px] dark:text-foreground">
                                Reservar
                            </h1>
                            {business.is_demo && <DemoBadge />}
                        </div>
                        <p className="mt-2 text-[14px] text-ceniza dark:text-muted-foreground">
                            {business.name}
                            {business.neighborhood
                                ? ` · ${business.neighborhood}`
                                : ''}
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div className="min-w-0 space-y-8">
                        {/* 1. SERVICE */}
                        <section aria-labelledby="step-service">
                            <StepTitle id="step-service" number="01">
                                Elige el servicio
                            </StepTitle>

                            <div className="mt-3 grid gap-2">
                                {services.map((item) => (
                                    <label
                                        key={item.id}
                                        className={cn(
                                            'flex cursor-pointer items-start gap-3 rounded-[16px] border p-4 transition-colors',
                                            form.data.service_id === item.id
                                                ? 'border-gold bg-gold-soft/25'
                                                : 'border-border bg-card hover:border-ink/20',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="service"
                                            value={item.id}
                                            checked={
                                                form.data.service_id === item.id
                                            }
                                            onChange={() => {
                                                form.setData(
                                                    'service_id',
                                                    item.id,
                                                );
                                                form.setData(
                                                    'professional_id',
                                                    null,
                                                );
                                            }}
                                            className="mt-1 size-4 accent-[var(--color-gold)]"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-baseline justify-between gap-3">
                                                <span className="text-[15px] font-semibold text-ink dark:text-foreground">
                                                    {item.name}
                                                </span>
                                                <span className="shrink-0 text-[14px] font-semibold text-ink tnum dark:text-foreground">
                                                    {money(item.price_cents)}
                                                </span>
                                            </span>
                                            <span className="mt-0.5 flex items-center gap-1 text-[12px] text-ceniza dark:text-muted-foreground">
                                                <Clock
                                                    className="size-3"
                                                    strokeWidth={1.8}
                                                />
                                                {formatDuration(item.duration)}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* 2. PROFESSIONAL */}
                        <section aria-labelledby="step-pro">
                            <StepTitle id="step-pro" number="02">
                                ¿Con quién?
                            </StepTitle>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <ProfessionalChoice
                                    active={
                                        form.data.professional_id === null
                                    }
                                    onClick={() =>
                                        form.setData('professional_id', null)
                                    }
                                    name="Cualquier profesional"
                                    detail="El primero disponible"
                                />
                                {eligibleProfessionals.map((person) => (
                                    <ProfessionalChoice
                                        key={person.id}
                                        active={
                                            form.data.professional_id ===
                                            person.id
                                        }
                                        onClick={() =>
                                            form.setData(
                                                'professional_id',
                                                person.id,
                                            )
                                        }
                                        name={person.name}
                                        detail={person.headline ?? ''}
                                        avatar={person.avatar}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* 3. DATE + TIME */}
                        <section aria-labelledby="step-time">
                            <StepTitle id="step-time" number="03">
                                Fecha y hora
                            </StepTitle>

                            <div className="mt-3 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
                                {days.map((day) => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => setDate(day.value)}
                                        aria-pressed={date === day.value}
                                        className={cn(
                                            'flex w-[68px] shrink-0 flex-col items-center rounded-[14px] border py-2.5 transition-colors',
                                            date === day.value
                                                ? 'border-ink bg-ink text-cal dark:border-foreground dark:bg-foreground dark:text-background'
                                                : 'border-border bg-card text-ink hover:border-ink/30 dark:text-foreground',
                                        )}
                                    >
                                        <span className="text-[10px] font-semibold tracking-[0.08em] uppercase opacity-70">
                                            {day.weekday}
                                        </span>
                                        <span className="mt-1 font-display text-[18px] leading-none font-bold tnum">
                                            {day.day}
                                        </span>
                                        <span className="mt-0.5 text-[10px] opacity-70">
                                            {day.month}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4">
                                {!form.data.service_id ? (
                                    <Hint>
                                        Elige un servicio para ver los horarios.
                                    </Hint>
                                ) : loading ? (
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                        {Array.from({ length: 10 }).map(
                                            (_, index) => (
                                                <div
                                                    key={index}
                                                    className="h-10 animate-pulse rounded-full bg-muted"
                                                />
                                            ),
                                        )}
                                    </div>
                                ) : availabilityError ? (
                                    <p className="text-[13px] text-gold-deep">
                                        {availabilityError}
                                    </p>
                                ) : slots.length === 0 ? (
                                    <Hint>
                                        No hay horarios disponibles ese día.
                                        Prueba otra fecha.
                                    </Hint>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                        {slots.map((item) => (
                                            <button
                                                key={item.starts_at}
                                                type="button"
                                                onClick={() => setSlot(item)}
                                                aria-pressed={
                                                    slot?.starts_at ===
                                                    item.starts_at
                                                }
                                                className={cn(
                                                    'h-10 rounded-full border text-[13px] font-medium tnum transition-colors',
                                                    slot?.starts_at ===
                                                        item.starts_at
                                                        ? 'border-gold bg-gold text-ink'
                                                        : 'border-border bg-card text-ink hover:border-gold/50 dark:text-foreground',
                                                )}
                                            >
                                                {item.local}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 4. NOTES */}
                        <section aria-labelledby="step-notes">
                            <StepTitle id="step-notes" number="04">
                                Algo que debamos saber
                            </StepTitle>
                            <label
                                htmlFor="notes"
                                className="mt-3 block text-[12px] text-ceniza dark:text-muted-foreground"
                            >
                                Nota para el profesional (opcional)
                            </label>
                            <textarea
                                id="notes"
                                value={form.data.notes}
                                onChange={(event) =>
                                    form.setData('notes', event.target.value)
                                }
                                rows={3}
                                maxLength={500}
                                className="mt-1.5 w-full rounded-[14px] border border-border bg-card px-3.5 py-3 text-[14px] text-ink placeholder:text-ceniza/70 dark:text-foreground"
                                placeholder="Por ejemplo: referencia de corte, alergias, si vienes con niños…"
                            />
                            {form.errors.notes && (
                                <p className="mt-1 text-[12px] text-gold-deep">
                                    {form.errors.notes}
                                </p>
                            )}
                        </section>
                    </div>

                    {/* SUMMARY */}
                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-[20px] border border-border bg-card p-5">
                            <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                                Tu reserva
                            </h2>

                            <dl className="mt-4 space-y-3 text-[13px]">
                                <Row label="Negocio" value={business.name} />
                                <Row
                                    label="Servicio"
                                    value={service?.name ?? 'Sin elegir'}
                                />
                                <Row
                                    label="Profesional"
                                    value={
                                        form.data.professional_id
                                            ? (eligibleProfessionals.find(
                                                  (p) =>
                                                      p.id ===
                                                      form.data.professional_id,
                                              )?.name ?? '—')
                                            : 'Cualquiera disponible'
                                    }
                                />
                                <Row
                                    label="Fecha"
                                    value={
                                        date
                                            ? formatDate(date, business.timezone)
                                            : 'Sin elegir'
                                    }
                                />
                                <Row
                                    label="Hora"
                                    value={slot?.local ?? 'Sin elegir'}
                                />
                            </dl>

                            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                                <span className="text-[12px] text-ceniza dark:text-muted-foreground">
                                    Total
                                </span>
                                <span className="font-display text-[22px] font-bold tracking-[-0.03em] text-ink tnum dark:text-foreground">
                                    {money(service?.price_cents ?? null)}
                                </span>
                            </div>

                            <p className="mt-3 text-[11px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                {business.payment_policy === 'none'
                                    ? 'Pagas directamente en el establecimiento.'
                                    : 'El pago se procesará en el siguiente paso.'}{' '}
                                Puedes cancelar sin costo hasta{' '}
                                {business.cancellation_window_hours} horas antes.
                            </p>

                            {(form.errors as Record<string, string>).booking && (
                                <p className="mt-3 flex items-start gap-1.5 rounded-[12px] bg-gold-soft/50 p-2.5 text-[12px] text-gold-deep">
                                    <AlertCircle
                                        className="mt-0.5 size-3.5 shrink-0"
                                        strokeWidth={1.8}
                                    />
                                    {(form.errors as Record<string, string>).booking}
                                </p>
                            )}

                            {auth.user ? (
                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={
                                        !slot ||
                                        !form.data.service_id ||
                                        form.processing
                                    }
                                    className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold text-[14px] font-semibold text-ink transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {form.processing ? (
                                        <Loader2
                                            className="size-4 animate-spin"
                                            strokeWidth={2}
                                        />
                                    ) : (
                                        <Check
                                            className="size-4"
                                            strokeWidth={2}
                                        />
                                    )}
                                    Confirmar reserva
                                </button>
                            ) : (
                                <div className="mt-4 space-y-2">
                                    <Link
                                        href="/login"
                                        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gold text-[14px] font-semibold text-ink hover:bg-gold-deep"
                                    >
                                        Ingresa para confirmar
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border text-[13px] font-medium text-ink dark:text-foreground"
                                    >
                                        Crear cuenta
                                    </Link>
                                    <p className="text-center text-[11px] text-ceniza dark:text-muted-foreground">
                                        Necesitamos una cuenta para guardar tu
                                        cita y avisarte antes.
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}

function StepTitle({
    id,
    number,
    children,
}: {
    id: string;
    number: string;
    children: React.ReactNode;
}) {
    return (
        <h2
            id={id}
            className="flex items-baseline gap-2.5 text-[15px] font-semibold text-ink dark:text-foreground"
        >
            <span className="text-[10px] font-bold tracking-[0.1em] text-gold-deep tnum">
                {number}
            </span>
            {children}
        </h2>
    );
}

function ProfessionalChoice({
    active,
    onClick,
    name,
    detail,
    avatar,
}: {
    active: boolean;
    onClick: () => void;
    name: string;
    detail: string;
    avatar?: string | null;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                'flex items-center gap-3 rounded-[16px] border p-3 text-left transition-colors',
                active
                    ? 'border-gold bg-gold-soft/25'
                    : 'border-border bg-card hover:border-ink/20',
            )}
        >
            {avatar ? (
                <img
                    src={avatar}
                    alt=""
                    className="size-9 rounded-full object-cover"
                />
            ) : (
                <span className="grid size-9 place-items-center rounded-full bg-ink text-[12px] font-bold text-cal">
                    {initials(name)}
                </span>
            )}
            <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-ink dark:text-foreground">
                    {name}
                </span>
                {detail && (
                    <span className="block truncate text-[11px] text-ceniza dark:text-muted-foreground">
                        {detail}
                    </span>
                )}
            </span>
        </button>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ceniza dark:text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium text-ink dark:text-foreground">
                {value}
            </dd>
        </div>
    );
}

function Hint({ children }: { children: React.ReactNode }) {
    return (
        <p className="rounded-[14px] border border-dashed border-border px-4 py-6 text-center text-[13px] text-ceniza dark:text-muted-foreground">
            {children}
        </p>
    );
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

function buildDays(timezone: string, count: number) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const labelParts = new Intl.DateTimeFormat('es-CO', {
        timeZone: timezone,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    const days = [];
    const now = new Date();

    for (let index = 0; index < count; index += 1) {
        const date = new Date(now.getTime() + index * 86_400_000);
        const value = formatter.format(date);
        const parts = labelParts.formatToParts(date);
        const pick = (type: string) =>
            parts.find((part) => part.type === type)?.value ?? '';

        days.push({
            value,
            weekday: pick('weekday').replace('.', ''),
            day: pick('day'),
            month: pick('month').replace('.', ''),
        });
    }

    return days;
}

function formatDate(value: string, timezone: string): string {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12));

    return new Intl.DateTimeFormat('es-CO', {
        timeZone: timezone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(date);
}
