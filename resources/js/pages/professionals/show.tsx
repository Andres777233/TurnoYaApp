import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Clock, MapPin, Star } from 'lucide-react';

import { DemoBadge } from '@/components/site/demo-badge';
import { duration as formatDuration, money } from '@/lib/format';

type Props = {
    professional: {
        id: number;
        name: string;
        slug: string;
        headline: string | null;
        bio: string | null;
        avatar: string | null;
        cover: string | null;
        years: number | null;
        rating: number;
        reviews: number;
        specialties: string[];
        is_accepting_bookings: boolean;
        is_demo: boolean;
        services: {
            id: number;
            name: string;
            description: string | null;
            duration: number;
            price_cents: number;
        }[];
        portfolio: { url: string; alt: string | null; kind: string }[];
    };
    business: {
        name: string;
        slug: string;
        category: string;
        neighborhood: string | null;
        city: string;
        cover: string | null;
    };
    colleagues: {
        name: string;
        slug: string;
        headline: string | null;
        avatar: string | null;
        specialties: string[];
    }[];
};

export default function ProfessionalShow({
    professional,
    business,
    colleagues,
}: Props) {
    const bookingUrl = `/negocios/${business.slug}/reservar?profesional=${professional.id}`;

    return (
        <>
            <Head title={`${professional.name} · TurnoYa`}>
                <meta
                    name="description"
                    content={professional.headline ?? professional.bio ?? ''}
                />
            </Head>

            <div className="mx-auto w-full max-w-[1240px] px-5 py-10 lg:px-8 lg:py-14">
                <div className="grid gap-10 lg:grid-cols-12">
                    {/* PORTRAIT */}
                    <div className="lg:col-span-5">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-ink">
                            {professional.avatar ? (
                                <img
                                    src={professional.avatar}
                                    alt={`Retrato de ${professional.name}`}
                                    className="h-full w-full object-cover"
                                    fetchPriority="high"
                                />
                            ) : (
                                <div className="grid h-full w-full place-items-center bg-ink-soft">
                                    <span className="font-display text-[96px] leading-none font-extrabold tracking-[-0.06em] text-cal/85">
                                        {initials(professional.name)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {professional.years && (
                            <p className="mt-3 text-[12px] text-ceniza dark:text-muted-foreground">
                                {professional.years} años de experiencia
                            </p>
                        )}
                    </div>

                    {/* CONTENT */}
                    <div className="lg:col-span-7">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold tracking-[0.16em] text-ceniza uppercase dark:text-muted-foreground">
                                Profesional
                            </span>
                            {professional.is_demo && <DemoBadge />}
                        </div>

                        <h1 className="mt-3 font-display text-[38px] leading-[0.98] font-extrabold tracking-[-0.055em] text-ink lg:text-[56px] dark:text-foreground">
                            {professional.name}
                        </h1>
                        <p className="mt-2 text-[15px] text-ceniza dark:text-muted-foreground">
                            {professional.headline}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]">
                            <span className="inline-flex items-center gap-1.5 text-ink dark:text-foreground">
                                <Star
                                    className="size-3.5 fill-gold text-gold-deep"
                                    strokeWidth={1.5}
                                />
                                {professional.reviews === 0
                                    ? 'Sin reseñas todavía'
                                    : `${professional.rating.toFixed(1).replace('.', ',')} · ${professional.reviews} reseñas`}
                            </span>
                            <Link
                                href={`/negocios/${business.slug}`}
                                className="inline-flex items-center gap-1.5 text-ink hover:text-gold-deep dark:text-foreground"
                            >
                                <MapPin
                                    className="size-3.5 text-ceniza"
                                    strokeWidth={1.8}
                                />
                                {business.name} · {business.neighborhood}
                            </Link>
                        </div>

                        {professional.bio && (
                            <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                {professional.bio}
                            </p>
                        )}

                        {professional.specialties.length > 0 && (
                            <ul className="mt-5 flex flex-wrap gap-1.5">
                                {professional.specialties.map(
                                    (specialty) => (
                                        <li
                                            key={specialty}
                                            className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-ink dark:text-foreground"
                                        >
                                            {specialty}
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}

                        <div className="mt-6">
                            {professional.is_accepting_bookings ? (
                                <Link
                                    href={bookingUrl}
                                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-[14px] font-semibold text-ink transition-colors hover:bg-gold-deep"
                                >
                                    Reservar con{' '}
                                    {professional.name.split(' ')[0]}
                                    <ArrowRight
                                        className="size-4 transition-transform group-hover:translate-x-0.5"
                                        strokeWidth={1.8}
                                    />
                                </Link>
                            ) : (
                                <p className="rounded-full border border-border px-4 py-2 text-[12px] text-ceniza dark:text-muted-foreground">
                                    Por ahora no recibe reservas en línea.
                                </p>
                            )}
                        </div>

                        {/* SERVICES */}
                        <section className="mt-10">
                            <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                                Servicios
                            </h2>
                            <ul className="mt-2 divide-y divide-border rounded-[18px] border border-border bg-card">
                                {professional.services.map((service) => (
                                    <li
                                        key={service.id}
                                        className="flex items-center justify-between gap-4 px-4 py-3"
                                    >
                                        <span>
                                            <span className="block text-[14px] font-medium text-ink dark:text-foreground">
                                                {service.name}
                                            </span>
                                            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-ceniza dark:text-muted-foreground">
                                                <Clock
                                                    className="size-3"
                                                    strokeWidth={1.8}
                                                />
                                                {formatDuration(
                                                    service.duration,
                                                )}
                                            </span>
                                        </span>
                                        <span className="text-[14px] font-semibold text-ink tnum dark:text-foreground">
                                            {money(service.price_cents)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>

                {/* PORTFOLIO */}
                {professional.portfolio.length > 0 && (
                    <section className="mt-14">
                        <h2 className="font-display text-[24px] font-bold tracking-[-0.04em] text-ink dark:text-foreground">
                            Su trabajo
                        </h2>
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {professional.portfolio.map((media, index) => (
                                <figure
                                    key={media.url + index}
                                    className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-arena dark:bg-ink-soft"
                                >
                                    {media.kind === 'video' ? (
                                        <video
                                            src={media.url}
                                            controls
                                            playsInline
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={media.url}
                                            alt={
                                                media.alt ??
                                                `Trabajo de ${professional.name}`
                                            }
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </figure>
                            ))}
                        </div>
                    </section>
                )}

                {/* COLLEAGUES */}
                {colleagues.length > 0 && (
                    <section className="mt-14 border-t border-border pt-8">
                        <h2 className="font-display text-[20px] font-bold tracking-[-0.03em] text-ink dark:text-foreground">
                            También en {business.name}
                        </h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            {colleagues.map((person) => (
                                <Link
                                    key={person.slug}
                                    href={`/profesionales/${person.slug}`}
                                    className="flex items-center gap-3 rounded-[16px] border border-border bg-card p-3 transition-colors hover:border-gold/40"
                                >
                                    {person.avatar ? (
                                        <img
                                            src={person.avatar}
                                            alt=""
                                            className="size-11 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="grid size-11 place-items-center rounded-full bg-ink text-[12px] font-bold text-cal">
                                            {initials(person.name)}
                                        </span>
                                    )}
                                    <span className="min-w-0">
                                        <span className="block truncate text-[13px] font-semibold text-ink dark:text-foreground">
                                            {person.name}
                                        </span>
                                        <span className="block truncate text-[11px] text-ceniza dark:text-muted-foreground">
                                            {person.headline}
                                        </span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}
