import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Clock,
    Instagram,
    MapPin,
    Phone,
    Scissors,
    Star,
} from 'lucide-react';

import { BusinessCard, type BusinessCardData } from '@/components/site/business-card';
import { DemoBadge } from '@/components/site/demo-badge';
import { Rating } from '@/components/site/rating';
import { Reveal } from '@/components/site/reveal';
import { duration as formatDuration, money } from '@/lib/format';

type Service = {
    id: number;
    name: string;
    description: string | null;
    duration: number;
    price_cents: number;
    professionals: { name: string; slug: string }[];
};

type Props = {
    business: BusinessCardData & {
        description: string | null;
        address: string;
        lat: number;
        lng: number;
        phone: string | null;
        whatsapp: string | null;
        instagram: string | null;
        website: string | null;
        gallery: { url: string; alt: string | null; kind: string }[];
        services: { category: string; items: Service[] }[];
        review_list: {
            rating: number;
            comment: string | null;
            customer: string;
            date: string;
            is_demo: boolean;
        }[];
    };
    professionals: {
        name: string;
        slug: string;
        headline: string | null;
        avatar: string | null;
        years: number | null;
        specialties: string[];
        portfolio: string[];
        is_demo: boolean;
    }[];
    similar: BusinessCardData[];
    mapsConfigured: boolean;
};

export default function BusinessShow({
    business,
    professionals,
    similar,
}: Props) {
    return (
        <>
            <Head title={`${business.name} · TurnoYa`}>
                <meta
                    name="description"
                    content={business.tagline ?? business.description ?? ''}
                />
            </Head>

            {/* COVER */}
            <section className="relative">
                <div className="relative h-[320px] w-full overflow-hidden bg-ink lg:h-[440px]">
                    {business.cover ? (
                        <img
                            src={business.cover}
                            alt={`Interior de ${business.name}`}
                            className="h-full w-full object-cover"
                            fetchPriority="high"
                        />
                    ) : (
                        <div className="grid h-full place-items-center">
                            <span className="font-display text-[80px] font-extrabold text-cal/20">
                                {business.name.slice(0, 2)}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0">
                        <div className="mx-auto w-full max-w-[1240px] px-5 pb-6 lg:px-8 lg:pb-8">
                            <div className="flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-cal uppercase backdrop-blur">
                                            {business.category}
                                        </span>
                                        {business.is_demo && <DemoBadge />}
                                    </div>
                                    <h1 className="mt-3 font-display text-[34px] leading-none font-extrabold tracking-[-0.05em] text-white lg:text-[54px]">
                                        {business.name}
                                    </h1>
                                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/80">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin
                                                className="size-3.5"
                                                strokeWidth={1.7}
                                            />
                                            {business.neighborhood},{' '}
                                            {business.city}
                                        </span>
                                        <Rating
                                            value={business.rating}
                                            count={business.reviews}
                                            className="text-white/90 [&_span]:text-white/90"
                                        />
                                    </p>
                                </div>

                                <Link
                                    href={`/negocios/${business.slug}/reservar`}
                                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-[14px] font-semibold text-ink transition-colors hover:bg-gold-deep"
                                >
                                    Reservar turno
                                    <ArrowRight
                                        className="size-4 transition-transform group-hover:translate-x-0.5"
                                        strokeWidth={1.8}
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-5 py-10 lg:grid-cols-12 lg:px-8 lg:py-14">
                {/* MAIN */}
                <div className="space-y-12 lg:col-span-8">
                    <section>
                        <h2 className="font-display text-[22px] font-bold tracking-[-0.04em] text-ink dark:text-foreground">
                            Sobre el negocio
                        </h2>
                        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ceniza dark:text-muted-foreground">
                            {business.description ??
                                'Este negocio todavía no ha escrito su descripción.'}
                        </p>
                    </section>

                    <section>
                        <div className="flex items-end justify-between gap-4">
                            <h2 className="font-display text-[22px] font-bold tracking-[-0.04em] text-ink dark:text-foreground">
                                Servicios y precios
                            </h2>
                            <span className="text-[12px] text-ceniza dark:text-muted-foreground">
                                {business.services.reduce(
                                    (total, group) =>
                                        total + group.items.length,
                                    0,
                                )}{' '}
                                servicios
                            </span>
                        </div>

                        <div className="mt-4 space-y-6">
                            {business.services.map((group) => (
                                <div key={group.category}>
                                    <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                                        {group.category}
                                    </h3>
                                    <ul className="mt-2 divide-y divide-border rounded-[20px] border border-border bg-card">
                                        {group.items.map((service) => (
                                            <li key={service.id}>
                                                <Link
                                                    href={`/negocios/${business.slug}/reservar?servicio=${service.id}`}
                                                    className="group flex items-start justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-gold-soft/20"
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block text-[14px] font-semibold text-ink dark:text-foreground">
                                                            {service.name}
                                                        </span>
                                                        {service.description && (
                                                            <span className="mt-0.5 block text-[12px] text-ceniza dark:text-muted-foreground">
                                                                {
                                                                    service.description
                                                                }
                                                            </span>
                                                        )}
                                                        <span className="mt-1 flex items-center gap-1 text-[11px] text-ceniza dark:text-muted-foreground">
                                                            <Clock
                                                                className="size-3"
                                                                strokeWidth={1.8}
                                                            />
                                                            {formatDuration(
                                                                service.duration,
                                                            )}
                                                        </span>
                                                    </span>
                                                    <span className="flex shrink-0 items-center gap-3">
                                                        <span className="text-[14px] font-semibold text-ink tnum dark:text-foreground">
                                                            {money(
                                                                service.price_cents,
                                                            )}
                                                        </span>
                                                        <ArrowUpRight
                                                            className="size-3.5 text-ceniza opacity-0 transition-opacity group-hover:opacity-100"
                                                            strokeWidth={1.8}
                                                        />
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="font-display text-[22px] font-bold tracking-[-0.04em] text-ink dark:text-foreground">
                            Lo que dicen los clientes
                        </h2>

                        {business.review_list.length === 0 ? (
                            <p className="mt-2 text-[13px] text-ceniza dark:text-muted-foreground">
                                Todavía no hay reseñas. Solo pueden calificar
                                quienes ya se atendieron aquí.
                            </p>
                        ) : (
                            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                                {business.review_list.map((review, index) => (
                                    <li
                                        key={index}
                                        className="rounded-[16px] border border-border bg-card p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-[12.5px] font-semibold text-ink dark:text-foreground">
                                                {review.customer}
                                            </p>
                                            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-ink dark:text-foreground">
                                                <Star className="size-3 fill-gold text-gold" />
                                                {review.rating}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-[12.5px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                            {review.comment}
                                        </p>
                                        <p className="mt-1.5 text-[10.5px] text-ceniza/70">
                                            {review.date}
                                            {review.is_demo
                                                ? ' · Demostración'
                                                : ''}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {professionals.length > 0 && (
                        <section>
                            <h2 className="font-display text-[22px] font-bold tracking-[-0.04em] text-ink dark:text-foreground">
                                Quién te atiende
                            </h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {professionals.map((person) => (
                                    <Link
                                        key={person.slug}
                                        href={`/profesionales/${person.slug}`}
                                        className="group flex items-start gap-3 rounded-[18px] border border-border bg-card p-4 transition-colors hover:border-gold/40"
                                    >
                                        {person.avatar ? (
                                            <img
                                                src={person.avatar}
                                                alt={`Retrato de ${person.name}`}
                                                loading="lazy"
                                                className="size-14 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-ink font-display text-[15px] font-bold text-cal">
                                                {initials(person.name)}
                                            </span>
                                        )}
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-1.5">
                                                <span className="truncate text-[14px] font-semibold text-ink dark:text-foreground">
                                                    {person.name}
                                                </span>
                                                {person.is_demo && (
                                                    <DemoBadge />
                                                )}
                                            </span>
                                            <span className="mt-0.5 block text-[12px] text-ceniza dark:text-muted-foreground">
                                                {person.headline}
                                            </span>
                                            <span className="mt-1.5 flex flex-wrap gap-1">
                                                {person.specialties
                                                    .slice(0, 3)
                                                    .map((specialty) => (
                                                        <span
                                                            key={specialty}
                                                            className="rounded-full border border-border px-2 py-0.5 text-[10px] text-ceniza dark:text-muted-foreground"
                                                        >
                                                            {specialty}
                                                        </span>
                                                    ))}
                                            </span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {business.gallery.length > 0 && (
                        <section>
                            <h2 className="font-display text-[22px] font-bold tracking-[-0.04em] text-ink dark:text-foreground">
                                El lugar
                            </h2>
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {business.gallery.map((media, index) => (
                                    <figure
                                        key={media.url + index}
                                        className="relative aspect-square overflow-hidden rounded-[16px] bg-arena dark:bg-ink-soft"
                                    >
                                        <img
                                            src={media.url}
                                            alt={
                                                media.alt ??
                                                `Foto de ${business.name}`
                                            }
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    </figure>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* SIDEBAR */}
                <aside className="space-y-4 lg:col-span-4">
                    <div className="lg:sticky lg:top-24 lg:space-y-4">
                        <div className="rounded-[20px] border border-border bg-card p-5">
                            <p className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                                Reserva en línea
                            </p>
                            <p className="mt-2 text-[13px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                Elige servicio, profesional y hora. La
                                disponibilidad se calcula con la agenda real.
                            </p>

                            <Link
                                href={`/negocios/${business.slug}/reservar`}
                                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[13px] font-semibold text-cal dark:bg-foreground dark:text-background"
                            >
                                Ver horarios
                                <ArrowRight
                                    className="size-3.5"
                                    strokeWidth={1.8}
                                />
                            </Link>

                            <dl className="mt-5 space-y-3 border-t border-border pt-4 text-[12px]">
                                <div className="flex gap-2">
                                    <MapPin
                                        className="mt-0.5 size-3.5 shrink-0 text-ceniza"
                                        strokeWidth={1.8}
                                    />
                                    <div>
                                        <dt className="sr-only">Dirección</dt>
                                        <dd className="text-ink dark:text-foreground">
                                            {business.address}
                                        </dd>
                                        <dd className="text-ceniza dark:text-muted-foreground">
                                            {business.neighborhood},{' '}
                                            {business.city}
                                        </dd>
                                    </div>
                                </div>

                                {business.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone
                                            className="size-3.5 shrink-0 text-ceniza"
                                            strokeWidth={1.8}
                                        />
                                        <dt className="sr-only">Teléfono</dt>
                                        <dd>
                                            <a
                                                href={`tel:${business.phone}`}
                                                className="text-ink hover:text-gold-deep dark:text-foreground"
                                            >
                                                {business.phone}
                                            </a>
                                        </dd>
                                    </div>
                                )}

                                {business.instagram && (
                                    <div className="flex items-center gap-2">
                                        <Instagram
                                            className="size-3.5 shrink-0 text-ceniza"
                                            strokeWidth={1.8}
                                        />
                                        <dt className="sr-only">Instagram</dt>
                                        <dd>
                                            <a
                                                href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="text-ink hover:text-gold-deep dark:text-foreground"
                                            >
                                                @
                                                {business.instagram.replace(
                                                    '@',
                                                    '',
                                                )}
                                            </a>
                                        </dd>
                                    </div>
                                )}
                            </dl>

                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-gold-deep hover:text-gold-deep"
                            >
                                Ver ubicación en Google Maps
                                <ArrowUpRight
                                    className="size-3"
                                    strokeWidth={2}
                                />
                            </a>
                        </div>

                        <div className="rounded-[20px] border border-border bg-card p-5">
                            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink dark:text-foreground">
                                <Scissors
                                    className="size-4 text-gold-deep"
                                    strokeWidth={1.8}
                                />
                                {business.professionals ?? 0} profesionales
                            </div>
                            <p className="mt-1 text-[12px] text-ceniza dark:text-muted-foreground">
                                Cada uno con su agenda y su portafolio.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {similar.length > 0 && (
                <section className="border-t border-border bg-cal-deep/40 py-12 dark:bg-card">
                    <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
                        <h2 className="font-display text-[24px] font-bold tracking-[-0.04em] text-ink dark:text-foreground">
                            También en {business.category}
                        </h2>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {similar.map((item, index) => (
                                <Reveal key={item.slug} delay={index * 0.05}>
                                    <BusinessCard
                                        business={item}
                                        className="h-full"
                                    />
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}
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
