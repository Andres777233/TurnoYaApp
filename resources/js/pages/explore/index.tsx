import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Clock,
    Flame,
    Heart,
    MapPin,
    Search,
    Star,
} from 'lucide-react';

import { DemoBadge } from '@/components/site/demo-badge';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';

type BusinessItem = {
    name: string;
    slug: string;
    tagline: string | null;
    category: string | null;
    neighborhood: string | null;
    cover: string | null;
    rating: number;
    reviews: number;
    min_price_cents: number | null;
    is_favorite: boolean;
    is_demo: boolean;
};

type Offer = {
    id: number;
    business: string;
    professional: string;
    service: string;
    time: string;
    price_cents: number;
};

type Props = {
    businesses: BusinessItem[];
    professionals: {
        name: string;
        slug: string;
        headline: string | null;
        cover: string | null;
        specialties: string[];
        business: string;
        rating: number;
        is_demo: boolean;
    }[];
    categories: { name: string; slug: string; count: number }[];
    offers: Offer[];
    city: string;
    auth: { user: { name: string } | null };
};

export default function Explore({
    businesses,
    professionals,
    categories,
    offers,
}: Props) {
    const { auth } = usePage<{ auth: { user: { name: string } | null } }>()
        .props;

    const toggleFavorite = (slug: string) => {
        if (!auth.user) {
            router.visit('/login');

            return;
        }

        router.post(`/favoritos/${slug}/alternar`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="TurnoYa · Reserva en Popayán" />

            <div className="mx-auto w-full max-w-[1240px] px-4 pt-6 lg:px-8 lg:pt-8">
                {offers.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {offers.map((offer) => (
                            <div
                                key={offer.id}
                                className="flex flex-wrap items-center gap-3 rounded-[18px] border border-gold/40 bg-gold-soft p-3.5 text-ink"
                            >
                                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-ink">
                                    <Flame
                                        className="size-4"
                                        strokeWidth={2}
                                    />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-semibold">
                                        ¡Se liberó un turno en {offer.business}!
                                    </p>
                                    <p className="text-[12px] text-ink/70">
                                        Hoy {offer.time} con {offer.professional}{' '}
                                        · {offer.service} ·{' '}
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
                                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[12px] font-semibold text-cal"
                                >
                                    ¡Quiero este turno!
                                    <ArrowRight
                                        className="size-3.5"
                                        strokeWidth={2}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <header>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-ceniza uppercase dark:text-muted-foreground">
                        Popayán, Cauca
                    </p>
                    <h1 className="mt-2 max-w-xl font-display text-[32px] leading-[1.02] font-extrabold tracking-[-0.05em] text-ink lg:text-[44px] dark:text-foreground">
                        ¿Qué te vas a hacer hoy?
                    </h1>
                </header>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        const term = new FormData(event.currentTarget).get('q');
                        router.get('/descubrir', term ? { q: String(term) } : {});
                    }}
                    className="mt-5 flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-4 shadow-[0_10px_30px_-24px_rgba(18,18,20,0.5)]"
                >
                    <Search
                        className="size-4 shrink-0 text-ceniza"
                        strokeWidth={2}
                    />
                    <input
                        name="q"
                        placeholder="Corte, fade, uñas, color…"
                        aria-label="Buscar servicios"
                        className="h-10 w-full border-0 bg-transparent text-[15px] text-ink placeholder:text-ceniza/70 focus:ring-0 focus:outline-none dark:text-foreground"
                    />
                    <button
                        type="submit"
                        className="h-10 shrink-0 rounded-full bg-gold px-5 text-[13px] font-semibold text-ink"
                    >
                        Buscar
                    </button>
                </form>

                <ul className="mt-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
                    {categories.map((category) => (
                        <li key={category.slug} className="shrink-0">
                            <Link
                                href={`/descubrir?categoria=${category.slug}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12.5px] font-medium text-ink transition-colors hover:border-gold dark:text-foreground"
                            >
                                {category.name}
                                <span className="text-[10px] text-ceniza">
                                    {category.count}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 lg:px-8">
                <div className="flex items-end justify-between gap-4">
                    <h2 className="font-display text-[22px] font-bold tracking-[-0.04em] text-ink dark:text-foreground">
                        Cerca de ti
                    </h2>
                    <Link
                        href="/descubrir"
                        className="hidden text-[12px] font-medium text-gold-deep sm:inline"
                    >
                        Ver todos
                    </Link>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {businesses.map((business, index) => (
                        <article
                            key={business.slug}
                            className={cn(
                                'group relative overflow-hidden rounded-[20px] border border-border bg-card',
                                index === 0 && 'sm:col-span-2 lg:col-span-2',
                            )}
                        >
                            <Link
                                href={`/negocios/${business.slug}`}
                                className="block"
                            >
                                <div
                                    className={cn(
                                        'relative w-full overflow-hidden bg-arena',
                                        index === 0
                                            ? 'aspect-[16/10]'
                                            : 'aspect-[4/3]',
                                    )}
                                >
                                    {business.cover ? (
                                        <img
                                            src={business.cover}
                                            alt={`Interior de ${business.name}`}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="grid h-full place-items-center font-display text-3xl font-bold text-ceniza">
                                            {business.name.slice(0, 2)}
                                        </div>
                                    )}

                                    <span className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                                        {business.is_demo && (
                                            <span className="rounded-full bg-ink/85 px-2 py-0.5 text-[9px] font-semibold tracking-[0.08em] text-cal uppercase backdrop-blur">
                                                Demostración
                                            </span>
                                        )}
                                        {business.min_price_cents !== null && (
                                            <span className="rounded-full bg-cal/95 px-2 py-0.5 text-[10px] font-semibold text-ink tnum">
                                                desde{' '}
                                                {money(
                                                    business.min_price_cents,
                                                )}
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <div className="p-3.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-display text-[16px] font-bold tracking-[-0.03em] text-ink dark:text-foreground">
                                            {business.name}
                                        </h3>
                                        {business.rating > 0 && (
                                            <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-ink dark:text-foreground">
                                                <Star
                                                    className="size-3 fill-gold text-gold"
                                                    strokeWidth={1.5}
                                                />
                                                {business.rating
                                                    .toFixed(1)
                                                    .replace('.', ',')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 line-clamp-1 text-[12px] text-ceniza dark:text-muted-foreground">
                                        {business.category} ·{' '}
                                        {business.neighborhood}
                                    </p>
                                </div>
                            </Link>

                            <button
                                type="button"
                                onClick={() => toggleFavorite(business.slug)}
                                aria-label={
                                    business.is_favorite
                                        ? `Quitar ${business.name} de favoritos`
                                        : `Guardar ${business.name} en favoritos`
                                }
                                aria-pressed={business.is_favorite}
                                className="absolute top-2.5 right-2.5 grid size-10 place-items-center rounded-full bg-cal/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-cal"
                            >
                                <Heart
                                    className={cn(
                                        'size-[18px]',
                                        business.is_favorite &&
                                            'fill-gold-deep text-gold-deep',
                                    )}
                                    strokeWidth={1.9}
                                />
                            </button>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto mt-10 w-full max-w-[1240px] px-4 lg:px-8">
                <div className="flex items-end justify-between gap-4">
                    <h2 className="font-display text-[22px] font-bold tracking-[-0.04em] text-ink dark:text-foreground">
                        Barberos y estilistas
                    </h2>
                </div>

                <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
                    {professionals.map((person) => (
                        <Link
                            key={person.slug}
                            href={`/profesionales/${person.slug}`}
                            className="group w-[210px] shrink-0 snap-start overflow-hidden rounded-[18px] border border-border bg-card"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                                {person.cover ? (
                                    <img
                                        src={person.cover}
                                        alt={`Trabajo de ${person.name}`}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                ) : (
                                    <div className="grid h-full place-items-center font-display text-4xl font-extrabold text-cal/80">
                                        {person.name
                                            .split(' ')
                                            .slice(0, 2)
                                            .map((p) => p[0])
                                            .join('')}
                                    </div>
                                )}
                                <span className="absolute inset-x-2 bottom-2 rounded-xl bg-ink/75 px-2 py-1 text-[11px] font-semibold text-cal backdrop-blur">
                                    {person.name}
                                </span>
                            </div>
                            <div className="p-3">
                                <p className="text-[11px] text-ceniza dark:text-muted-foreground">
                                    {person.headline}
                                </p>
                                <p className="mt-1 text-[10px] tracking-[0.04em] text-ceniza uppercase">
                                    {person.business}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 pb-8 lg:px-8">
                <Link
                    href="/mapa"
                    className="group flex items-center gap-4 rounded-[20px] border border-border bg-ink p-5 text-cal"
                >
                    <span className="grid size-11 place-items-center rounded-full bg-gold text-ink">
                        <MapPin className="size-5" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block font-display text-[17px] font-bold tracking-[-0.03em]">
                            Míralos en el mapa de Popayán
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-[12px] text-cal/70">
                            <Clock className="size-3" strokeWidth={1.8} />
                            Ruta, distancia y tiempo dentro de la app
                        </span>
                    </span>
                    <ArrowRight
                        className="size-5 shrink-0 text-gold transition-transform group-hover:translate-x-0.5"
                        strokeWidth={1.8}
                    />
                </Link>
            </section>
        </>
    );
}
