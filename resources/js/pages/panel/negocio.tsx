import { Link } from '@inertiajs/react';
import { Star, Users } from 'lucide-react';

import { money } from '@/lib/format';

type Props = {
    view?: 'negocio' | 'equipo' | 'ingresos';
    business: {
        name: string;
        slug: string;
        neighborhood: string | null;
        address: string;
        rating: number;
        reviews: number;
        is_demo: boolean;
    };
    stats: {
        today_count: number;
        month_revenue_cents: number;
        team: number;
        favorites: number;
    };
    team: {
        name: string;
        slug: string;
        headline: string | null;
        avatar: string | null;
        rating: number;
        reviews: number;
        today: number;
    }[];
    reviews: {
        rating: number;
        comment: string | null;
        customer: string;
        date: string;
        is_demo: boolean;
    }[];
    days?: { label: string; total_cents: number }[];
};

export default function PanelBusiness({
    view = 'negocio',
    business,
    stats,
    team,
    reviews,
    days = [],
}: Props) {
    return (
        <div className="mx-auto w-full max-w-[960px] px-4 py-6 lg:px-8">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-ceniza uppercase dark:text-muted-foreground">
                {business.neighborhood}
            </p>
            <h1 className="mt-2 font-display text-[30px] leading-none font-extrabold tracking-[-0.05em] text-ink lg:text-[38px] dark:text-foreground">
                {view === 'equipo'
                    ? 'Mi equipo'
                    : view === 'ingresos'
                      ? 'Ingresos'
                      : business.name}
            </h1>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                    ['Turnos hoy', String(stats.today_count)],
                    ['Equipo', String(stats.team)],
                    ['Favoritos', String(stats.favorites)],
                    ['Ingresos del mes', money(stats.month_revenue_cents)],
                ].map(([label, value]) => (
                    <div
                        key={label}
                        className="rounded-[16px] border border-border bg-card p-3.5"
                    >
                        <p className="text-[10px] font-semibold tracking-[0.08em] text-ceniza uppercase dark:text-muted-foreground">
                            {label}
                        </p>
                        <p className="mt-1 font-display text-[18px] font-bold text-ink tnum dark:text-foreground">
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            {(view === 'negocio' || view === 'equipo') && (
                <section className="mt-8">
                    <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                        <Users className="size-3.5" /> Equipo ({stats.team})
                    </h2>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {team.map((person) => (
                            <li
                                key={person.slug}
                                className="flex items-center gap-3 rounded-[16px] border border-border bg-card p-3"
                            >
                                {person.avatar ? (
                                    <img
                                        src={person.avatar}
                                        alt=""
                                        className="size-11 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="grid size-11 place-items-center rounded-full bg-ink text-[12px] font-bold text-cal">
                                        {person.name
                                            .split(' ')
                                            .slice(0, 2)
                                            .map((p) => p[0])
                                            .join('')}
                                    </span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-semibold text-ink dark:text-foreground">
                                        {person.name}
                                    </p>
                                    <p className="truncate text-[11px] text-ceniza dark:text-muted-foreground">
                                        {person.headline} · {person.today} turnos hoy
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold">
                                    <Star className="size-3 fill-gold text-gold" />
                                    {person.rating.toFixed(1)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {view === 'ingresos' && (
                <section className="mt-8">
                    <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                        Últimos 7 días (servicios atendidos)
                    </h2>
                    <ul className="mt-3 divide-y divide-border rounded-[16px] border border-border bg-card">
                        {days.map((day) => (
                            <li
                                key={day.label}
                                className="flex items-center justify-between px-4 py-3"
                            >
                                <span className="text-[12.5px] text-ceniza dark:text-muted-foreground">
                                    {day.label}
                                </span>
                                <span className="text-[13px] font-semibold text-ink tnum dark:text-foreground">
                                    {money(day.total_cents)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2 text-[11px] text-ceniza">
                        Solo se suman citas marcadas como atendidas.
                    </p>
                </section>
            )}

            {view === 'negocio' && (
                <>
                    <section className="mt-8">
                        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                            Reseñas recientes
                        </h2>
                        <ul className="mt-3 space-y-2">
                            {reviews.map((review, index) => (
                                <li
                                    key={index}
                                    className="rounded-[16px] border border-border bg-card p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-[12.5px] font-semibold text-ink dark:text-foreground">
                                            {review.customer}
                                        </p>
                                        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold">
                                            <Star className="size-3 fill-gold text-gold" />
                                            {review.rating}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[12.5px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                        {review.comment}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <Link
                        href={`/negocios/${business.slug}`}
                        className="mt-6 inline-flex text-[12px] font-medium text-gold-deep"
                    >
                        Ver la página pública del negocio
                    </Link>
                </>
            )}
        </div>
    );
}
