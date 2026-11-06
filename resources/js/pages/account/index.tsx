import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Heart, History, Store } from 'lucide-react';

import { DemoBadge } from '@/components/site/demo-badge';

type Props = {
    next: {
        code: string;
        service: string;
        business: string;
        professional: string;
        date: string;
        time: string;
    } | null;
    stats: { upcoming: number; history: number; favorites: number };
    businesses: { name: string; slug: string; role: string; is_demo: boolean }[];
};

export default function Account({
    next,
    stats,
    businesses,
}: Props) {
    return (
        <>
            <Head title="Mi cuenta · TurnoYa" />

            <div className="mx-auto w-full max-w-[1040px] px-5 py-10 lg:px-8 lg:py-14">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-ceniza uppercase dark:text-muted-foreground">
                    Tu cuenta
                </p>
                <h1 className="mt-2 font-display text-[34px] leading-none font-extrabold tracking-[-0.05em] text-ink lg:text-[44px] dark:text-foreground">
                    Hola de nuevo
                </h1>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                    <section className="rounded-[20px] border border-border bg-card p-5">
                        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                            Tu próxima cita
                        </h2>

                        {next ? (
                            <Link
                                href={`/reservas/${next.code}`}
                                className="group mt-4 flex items-start justify-between gap-4"
                            >
                                <div>
                                    <p className="font-display text-[22px] font-bold tracking-[-0.03em] text-ink dark:text-foreground">
                                        {next.service}
                                    </p>
                                    <p className="mt-1 text-[13px] text-ceniza dark:text-muted-foreground">
                                        {next.business} · {next.professional}
                                    </p>
                                    <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink dark:text-foreground">
                                        <CalendarDays
                                            className="size-4 text-gold-deep"
                                            strokeWidth={1.8}
                                        />
                                        {next.date}, {next.time}
                                    </p>
                                </div>
                                <ArrowRight
                                    className="mt-1 size-4 shrink-0 text-ceniza transition-transform group-hover:translate-x-0.5"
                                    strokeWidth={1.8}
                                />
                            </Link>
                        ) : (
                            <div className="mt-4">
                                <p className="text-[14px] text-ceniza dark:text-muted-foreground">
                                    No tienes citas próximas.
                                </p>
                                <Link
                                    href="/descubrir"
                                    className="mt-3 inline-flex h-10 items-center rounded-full bg-gold px-5 text-[13px] font-semibold text-ink hover:bg-gold-deep"
                                >
                                    Buscar un turno
                                </Link>
                            </div>
                        )}
                    </section>

                    <section className="grid grid-cols-3 divide-x divide-border rounded-[20px] border border-border bg-card">
                        <Stat
                            icon={CalendarDays}
                            value={stats.upcoming}
                            label="Próximas"
                            href="/mis-reservas"
                        />
                        <Stat
                            icon={History}
                            value={stats.history}
                            label="Historial"
                            href="/mis-reservas"
                        />
                        <Stat
                            icon={Heart}
                            value={stats.favorites}
                            label="Favoritos"
                        />
                    </section>
                </div>

                {businesses.length > 0 && (
                    <section className="mt-8">
                        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                            Negocios que administras
                        </h2>
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                            {businesses.map((business) => (
                                <li key={business.slug}>
                                    <Link
                                        href={`/negocios/${business.slug}`}
                                        className="flex items-center gap-3 rounded-[16px] border border-border bg-card px-4 py-3 transition-colors hover:border-gold/40"
                                    >
                                        <span className="grid size-9 place-items-center rounded-full bg-ink text-cal">
                                            <Store
                                                className="size-4"
                                                strokeWidth={1.7}
                                            />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2">
                                                <span className="truncate text-[13px] font-semibold text-ink dark:text-foreground">
                                                    {business.name}
                                                </span>
                                                {business.is_demo && (
                                                    <DemoBadge />
                                                )}
                                            </span>
                                            <span className="block text-[11px] text-ceniza dark:text-muted-foreground">
                                                {business.role}
                                            </span>
                                        </span>
                                        <ArrowRight
                                            className="size-3.5 text-ceniza"
                                            strokeWidth={1.8}
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </>
    );
}

function Stat({
    icon: Icon,
    value,
    label,
    href,
}: {
    icon: typeof CalendarDays;
    value: number;
    label: string;
    href?: string;
}) {
    const content = (
        <>
            <Icon className="size-4 text-gold-deep" strokeWidth={1.7} />
            <span className="font-display text-[22px] leading-none font-bold text-ink tnum dark:text-foreground">
                {value}
            </span>
            <span className="text-[10px] tracking-[0.08em] text-ceniza uppercase dark:text-muted-foreground">
                {label}
            </span>
        </>
    );

    const className =
        'flex flex-col items-center gap-1 px-2 py-5 transition-colors';

    return href ? (
        <Link href={href} className={`${className} hover:bg-foreground/5`}>
            {content}
        </Link>
    ) : (
        <div className={className}>{content}</div>
    );
}
