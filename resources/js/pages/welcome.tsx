import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Brush,
    Droplet,
    Eye,
    Hand,
    Leaf,
    Scissors,
    Sparkles,
    Waves,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { BusinessCard } from '@/components/site/business-card';
import type { BusinessCardData } from '@/components/site/business-card';
import { Reveal } from '@/components/site/reveal';
import { SearchBar } from '@/components/site/search-bar';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';

type Category = {
    name: string;
    slug: string;
    icon: string | null;
    count: number;
};

type Professional = {
    name: string;
    slug: string;
    headline: string | null;
    avatar: string | null;
    cover: string | null;
    specialties: string[];
    business: string;
    business_slug: string;
    years: number | null;
};

type Props = {
    city: { name: string; department: string } | null;
    categories: Category[];
    featured: BusinessCardData[];
    professionals: Professional[];
    facts: {
        businesses: number;
        professionals: number;
        services: number;
        zones: number;
    };
    zones: string[];
};

const icons = {
    scissors: Scissors,
    comb: Waves,
    sparkle: Sparkles,
    hand: Hand,
    brush: Brush,
    eye: Eye,
    leaf: Leaf,
    droplet: Droplet,
} as const;

export default function Welcome({
    city,
    categories,
    featured,
    professionals,
    facts,
    zones,
}: Props) {
    const reduce = useReducedMotion();
    const hero = featured[0];
    const hasDemo = featured.some((business) => business.is_demo);

    const heroFacts = [
        { value: facts.businesses, label: 'negocios' },
        { value: facts.professionals, label: 'profesionales' },
        { value: facts.services, label: 'servicios' },
    ];

    return (
        <>
            <Head title="TurnoYa · Reserva tu turno en Popayán">
                <meta
                    name="description"
                    content="Barberías, peluquerías y salones de Popayán con disponibilidad real. Reserva en menos de un minuto."
                />
            </Head>

            {/* ---------------------------------------------------------- HERO */}
            <section className="relative">
                <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-end gap-10 px-5 pt-10 pb-14 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pt-14 lg:pb-20">
                    <div className="lg:col-span-6">
                        <motion.p
                            initial={reduce ? false : { opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-[11px] font-semibold tracking-[0.2em] text-ceniza uppercase dark:text-muted-foreground"
                        >
                            {city ? `${city.name} · ${city.department}` : 'Colombia'}
                        </motion.p>

                        <motion.h1
                            initial={reduce ? false : { opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.7,
                                delay: 0.05,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="display-tight mt-5 text-[clamp(2.35rem,4.7vw,3.5rem)] font-extrabold text-ink dark:text-foreground"
                        >
                            Encuentra tu turno.
                            <br />
                            <span className="text-gold-deep">Llega</span> y
                            siéntate.
                        </motion.h1>

                        <motion.p
                            initial={reduce ? false : { opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.7,
                                delay: 0.14,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-ceniza dark:text-muted-foreground"
                        >
                            Barberías, peluquerías y estudios de belleza de
                            Popayán con disponibilidad real. Reserva sin
                            llamadas y sin esperar respuesta.
                        </motion.p>

                        <motion.div
                            initial={reduce ? false : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.22,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="mt-7 flex flex-wrap items-center gap-3"
                        >
                            <a
                                href="#buscar"
                                className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[14px] font-semibold text-cal transition-colors hover:bg-ink-soft dark:bg-foreground dark:text-background"
                            >
                                Buscar mi turno
                                <ArrowRight
                                    className="size-4"
                                    strokeWidth={1.8}
                                    aria-hidden
                                />
                            </a>
                            <Link
                                href="/descubrir?vista=mapa"
                                className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 text-[14px] font-medium text-ink transition-colors hover:bg-foreground/5 dark:text-foreground"
                            >
                                Explorar el mapa
                            </Link>
                        </motion.div>

                        <dl className="mt-9 flex max-w-md divide-x divide-border">
                            {heroFacts.map((fact, index) => (
                                <div
                                    key={fact.label}
                                    className={
                                        index === 0 ? 'pr-5' : 'px-5 last:pr-0'
                                    }
                                >
                                    <dt className="sr-only">{fact.label}</dt>
                                    <dd>
                                        <span className="font-display text-[26px] leading-none font-bold tracking-[-0.04em] text-ink tnum dark:text-foreground">
                                            {fact.value}
                                        </span>
                                        <span className="mt-1 block text-[11px] tracking-[0.08em] text-ceniza uppercase dark:text-muted-foreground">
                                            {fact.label}
                                        </span>
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        {hasDemo && (
                            <p className="mt-4 max-w-sm text-[11px] leading-relaxed text-ceniza/80 dark:text-muted-foreground/70">
                                Los perfiles marcados como demostración son
                                contenido de ejemplo, no negocios reales.
                            </p>
                        )}
                    </div>

                    <motion.div
                        initial={reduce ? false : { opacity: 0, scale: 0.985 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.9,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="relative lg:col-span-6"
                    >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-ink sm:aspect-[5/4] lg:aspect-[4/5]">
                            <img
                                src="/storage/demo/hero.jpg"
                                alt="Barbero terminando un corte con tijera en un local de Popayán"
                                className="h-full w-full object-cover"
                                fetchPriority="high"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0" />

                            {hero && (
                                <Link
                                    href={`/negocios/${hero.slug}`}
                                    className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-[18px] border border-white/10 bg-cal/92 p-3 backdrop-blur-md transition-colors hover:bg-cal"
                                >
                                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-ink">
                                        <Scissors
                                            className="size-4"
                                            strokeWidth={1.8}
                                            aria-hidden
                                        />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-display text-[13px] font-bold text-ink">
                                            {hero.name}
                                        </span>
                                        <span className="block truncate text-[11px] text-ceniza">
                                            {hero.category} ·{' '}
                                            {hero.neighborhood}
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-right">
                                        <span className="block text-[10px] tracking-[0.08em] text-ceniza uppercase">
                                            desde
                                        </span>
                                        <span className="block text-[13px] font-semibold text-ink tnum">
                                            {money(hero.min_price_cents)}
                                        </span>
                                    </span>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>

                <div
                    id="buscar"
                    className="relative z-10 mx-auto -mt-6 w-full max-w-[1100px] scroll-mt-24 px-5 lg:-mt-12 lg:px-8"
                >
                    <SearchBar zones={zones} />
                </div>
            </section>

            {/* ---------------------------------------------------- CATEGORIES */}
            <section className="mt-16 border-t border-border/70 py-14 lg:mt-20">
                <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
                    <div className="flex items-end justify-between gap-6">
                        <h2 className="max-w-md font-display text-[28px] leading-[1.05] font-bold tracking-[-0.045em] text-ink lg:text-[34px] dark:text-foreground">
                            Empieza por lo que necesitas
                        </h2>
                        <Link
                            href="/descubrir"
                            className="group hidden shrink-0 items-center gap-1 text-[13px] font-medium text-ink sm:inline-flex dark:text-foreground"
                        >
                            Ver todo
                            <ArrowUpRight
                                className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                        </Link>
                    </div>

                    <ul className="mt-7 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0 xl:grid-cols-8">
                        {categories.map((category) => {
                            const Icon =
                                icons[
                                    (category.icon ??
                                        'sparkle') as keyof typeof icons
                                ] ?? Sparkles;

                            return (
                                <li
                                    key={category.slug}
                                    className="w-[168px] shrink-0 snap-start lg:w-auto"
                                >
                                    <Link
                                        href={`/descubrir?categoria=${category.slug}`}
                                        className="group flex h-full flex-col justify-between gap-6 rounded-[18px] border border-border bg-card p-4 transition-colors hover:border-gold/40 hover:bg-gold-soft/30"
                                    >
                                        <Icon
                                            className="size-5 text-gold-deep"
                                            strokeWidth={1.6}
                                            aria-hidden
                                        />
                                        <span>
                                            <span className="block text-[13px] leading-tight font-semibold text-ink dark:text-foreground">
                                                {category.name}
                                            </span>
                                            <span className="mt-1 block text-[11px] text-ceniza dark:text-muted-foreground">
                                                {category.count === 0
                                                    ? 'Pronto'
                                                    : `${category.count} ${category.count === 1 ? 'negocio' : 'negocios'}`}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {/* ----------------------------------------------------- FEATURED */}
            {featured.length > 0 && (
                <section className="py-6 lg:py-10">
                    <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
                        <Reveal className="flex items-end justify-between gap-6">
                            <div>
                                <h2 className="font-display text-[28px] leading-[1.05] font-bold tracking-[-0.045em] text-ink lg:text-[34px] dark:text-foreground">
                                    Abiertos en Popayán
                                </h2>
                                <p className="mt-2 max-w-md text-[14px] text-ceniza dark:text-muted-foreground">
                                    Negocios que ya publicaron su agenda,
                                    servicios y precios.
                                </p>
                            </div>
                            <Link
                                href="/descubrir"
                                className="group hidden shrink-0 items-center gap-1 text-[13px] font-medium text-ink sm:inline-flex dark:text-foreground"
                            >
                                Ver todos
                                <ArrowUpRight
                                    className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    strokeWidth={1.8}
                                    aria-hidden
                                />
                            </Link>
                        </Reveal>

                        <div className="mt-7 grid gap-4 lg:auto-rows-[250px] lg:grid-cols-3">
                            {featured.map((business, index) => (
                                <Reveal
                                    key={business.slug}
                                    delay={index * 0.06}
                                    className={cn(
                                        'h-full',
                                        index === 0 &&
                                            'lg:col-span-2 lg:row-span-2',
                                    )}
                                >
                                    <BusinessCard
                                        business={business}
                                        variant={index === 0 ? 'bento' : 'stack'}
                                        className="h-full"
                                    />
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* --------------------------------------------------- HOW IT WORKS */}
            <section
                id="como-funciona"
                className="mt-16 scroll-mt-24 border-y border-border bg-card py-16 lg:mt-20 lg:py-20"
            >
                <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-5 lg:grid-cols-12 lg:gap-16 lg:px-8">
                    <div className="lg:col-span-4">
                        <h2 className="font-display text-[30px] leading-[1.02] font-bold tracking-[-0.05em] text-ink lg:text-[40px] dark:text-foreground">
                            Tres pasos.
                            <br />
                            <span className="text-gold-deep">Cero</span>{' '}
                            llamadas.
                        </h2>
                        <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-ceniza dark:text-muted-foreground">
                            La disponibilidad se calcula con la agenda real del
                            profesional, no con una plantilla.
                        </p>
                    </div>

                    <ol className="lg:col-span-8">
                        {[
                            {
                                title: 'Elige el servicio',
                                body: 'Precio y duración visibles antes de reservar. Sin sorpresas al llegar.',
                            },
                            {
                                title: 'Mira quién está libre',
                                body: 'Horarios reales del profesional que te va a atender, incluidas sus pausas.',
                            },
                            {
                                title: 'Confirma y listo',
                                body: 'Recibes el recordatorio 30 minutos antes para confirmar o cancelar.',
                            },
                        ].map((step, index) => (
                            <li
                                key={step.title}
                                className="grid gap-2 border-t border-border py-6 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[64px_1fr] sm:gap-6"
                            >
                                <span className="font-display text-[13px] font-semibold tracking-[0.08em] text-gold-deep tnum">
                                    0{index + 1}
                                </span>
                                <div>
                                    <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-ink dark:text-foreground">
                                        {step.title}
                                    </h3>
                                    <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                        {step.body}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ------------------------------------------------- PROFESSIONALS */}
            {professionals.length > 0 && (
                <section
                    id="profesionales"
                    className="scroll-mt-24 py-16 lg:py-20"
                >
                    <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
                        <Reveal className="max-w-xl">
                            <h2 className="font-display text-[28px] leading-[1.05] font-bold tracking-[-0.045em] text-ink lg:text-[34px] dark:text-foreground">
                                Personas, no solo locales
                            </h2>
                            <p className="mt-2 text-[14px] text-ceniza dark:text-muted-foreground">
                                Cada profesional tiene su perfil, su portafolio
                                y su propia agenda.
                            </p>
                        </Reveal>

                        <div className="mt-7 grid gap-4 md:grid-cols-3">
                            {professionals.map((professional, index) => (
                                <Reveal
                                    key={professional.slug}
                                    delay={index * 0.06}
                                >
                                    <Link
                                        href={`/profesionales/${professional.slug}`}
                                        className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(23,20,18,0.45)]"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                                            {professional.cover ||
                                            professional.avatar ? (
                                                <img
                                                    src={
                                                        professional.cover ??
                                                        (professional.avatar as string)
                                                    }
                                                    alt={`Trabajo de ${professional.name}`}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                                />
                                            ) : (
                                                <div className="grid h-full w-full place-items-center bg-ink-soft">
                                                    <span className="font-display text-[64px] leading-none font-extrabold tracking-[-0.06em] text-cal/90">
                                                        {initials(
                                                            professional.name,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-semibold text-cal backdrop-blur">
                                                {professional.name}
                                            </span>
                                        </div>
                                        <div className="flex flex-1 flex-col p-4">
                                            <h3 className="font-display text-[17px] font-bold tracking-[-0.03em] text-ink dark:text-foreground">
                                                {professional.name}
                                            </h3>
                                            <p className="mt-0.5 text-[13px] text-ceniza dark:text-muted-foreground">
                                                {professional.headline}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {professional.specialties.map(
                                                    (specialty) => (
                                                        <span
                                                            key={specialty}
                                                            className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium tracking-[0.02em] text-ceniza dark:text-muted-foreground"
                                                        >
                                                            {specialty}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                            <p className="mt-auto pt-3 text-[11px] tracking-[0.02em] text-ceniza uppercase dark:text-muted-foreground">
                                                {professional.business}
                                                {professional.years
                                                    ? ` · ${professional.years} años`
                                                    : ''}
                                            </p>
                                        </div>
                                    </Link>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ---------------------------------------------------------- CITY */}
            <section className="pb-16 lg:pb-20">
                <div className="mx-auto w-full max-w-[1240px] px-5 lg:px-8">
                    <div className="grid overflow-hidden rounded-[26px] border border-border bg-card lg:grid-cols-2">
                        <div className="relative min-h-[320px] overflow-hidden">
                            <img
                                src="/storage/demo/hero2.jpg"
                                alt="Interior cálido de una barbería en Popayán"
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                        </div>

                        <div className="flex flex-col justify-center p-8 lg:p-12">
                            <h2 className="font-display text-[28px] leading-[1.05] font-bold tracking-[-0.045em] text-ink lg:text-[34px] dark:text-foreground">
                                Todo lo que buscas está en tu ciudad
                            </h2>
                            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                Por ahora operamos solo en Popayán. Estas son
                                las zonas con negocios publicados.
                            </p>

                            {zones.length > 0 && (
                                <ul className="mt-5 flex flex-wrap gap-2">
                                    {zones.map((zone) => (
                                        <li key={zone}>
                                            <Link
                                                href={`/descubrir?zona=${encodeURIComponent(zone)}`}
                                                className="inline-flex rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-gold/40 hover:bg-gold-soft/40 dark:text-foreground"
                                            >
                                                {zone}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <Link
                                href="/descubrir?vista=mapa"
                                className="mt-6 inline-flex w-fit items-center gap-2 text-[13px] font-semibold text-gold-deep hover:text-gold-deep"
                            >
                                Abrir el mapa
                                <ArrowRight
                                    className="size-4"
                                    strokeWidth={1.8}
                                    aria-hidden
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------------- OWNERS */}
            <section className="bg-ink py-16 text-cal lg:py-20">
                <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-5 lg:grid-cols-12 lg:items-end lg:px-8">
                    <div className="lg:col-span-8">
                        <p className="text-[11px] font-semibold tracking-[0.2em] text-cal/60 uppercase">
                            Para negocios
                        </p>
                        <h2 className="mt-4 max-w-3xl font-display text-[32px] leading-[1.02] font-bold tracking-[-0.05em] lg:text-[52px]">
                            Tu agenda llena.
                            <br />
                            Tu teléfono en paz.
                        </h2>
                        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-cal/70">
                            Publica tus servicios, deja que tus clientes reserven
                            solos y recibe un recordatorio antes de cada cita.
                        </p>
                    </div>

                    <div className="lg:col-span-4 lg:justify-self-end">
                        <Link
                            href="/register"
                            className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-[14px] font-semibold text-ink transition-colors hover:bg-gold-deep"
                        >
                            Publica tu negocio
                            <ArrowUpRight
                                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                strokeWidth={1.8}
                                aria-hidden
                            />
                        </Link>
                    </div>
                </div>
            </section>
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
