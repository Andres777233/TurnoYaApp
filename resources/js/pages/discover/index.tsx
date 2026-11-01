import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, LayoutGrid, Map, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

import { BusinessCard } from '@/components/site/business-card';
import type { BusinessCardData } from '@/components/site/business-card';
import { MapPanel, type MapPoint } from '@/components/site/map-panel';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';

type Filters = {
    q: string;
    category: string | null;
    zone: string | null;
    min: number | null;
    max: number | null;
    rating: number | null;
    sort: string;
    view: 'lista' | 'mapa';
};

type Paginated = {
    data: BusinessCardData[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    filters: Filters;
    results: Paginated;
    mapPoints: MapPoint[];
    city: { name: string; department: string; lat: number; lng: number } | null;
    options: {
        categories: { name: string; slug: string }[];
        zones: string[];
        priceFloor: number;
        priceCeiling: number;
    };
    mapsConfigured: boolean;
    mapsKey: string | null;
};

const sortOptions = [
    { value: 'relevancia', label: 'Relevancia' },
    { value: 'calificacion', label: 'Mejor calificados' },
    { value: 'precio_asc', label: 'Menor precio' },
    { value: 'precio_desc', label: 'Mayor precio' },
    { value: 'recientes', label: 'Recién publicados' },
];

export default function Discover({
    filters,
    results,
    mapPoints,
    city,
    options,
    mapsConfigured,
    mapsKey,
}: Props) {
    const [term, setTerm] = useState(filters.q);
    const [showFilters, setShowFilters] = useState(false);

    const apply = (overrides: Partial<Filters>) => {
        const next = { ...filters, ...overrides };
        const params: Record<string, string> = {};

        if (next.q) params.q = next.q;
        if (next.category) params.categoria = next.category;
        if (next.zone) params.zona = next.zone;
        if (next.min !== null) params.min = String(next.min);
        if (next.max !== null) params.max = String(next.max);
        if (next.rating !== null) params.rating = String(next.rating);
        if (next.sort !== 'relevancia') params.orden = next.sort;
        if (next.view === 'mapa') params.vista = 'mapa';

        router.get('/descubrir', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clear = () => router.get('/descubrir', {}, { replace: true });

    const activeCount = [
        filters.q,
        filters.category,
        filters.zone,
        filters.min,
        filters.max,
        filters.rating,
    ].filter((value) => value !== null && value !== '').length;

    return (
        <>
            <Head title="Descubrir · TurnoYa" />

            <div className="mx-auto w-full max-w-[1240px] px-5 py-10 lg:px-8 lg:py-14">
                <header className="max-w-2xl">
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-ceniza uppercase dark:text-muted-foreground">
                        {city ? `${city.name}, ${city.department}` : 'Colombia'}
                    </p>
                    <h1 className="mt-3 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.05em] text-ink lg:text-[46px] dark:text-foreground">
                        Encuentra tu próximo turno
                    </h1>
                    <p className="mt-3 text-[15px] leading-relaxed text-ceniza dark:text-muted-foreground">
                        {results.total}{' '}
                        {results.total === 1
                            ? 'negocio disponible'
                            : 'negocios disponibles'}{' '}
                        con agenda publicada.
                    </p>
                </header>

                <div className="mt-8 grid gap-8 lg:grid-cols-12">
                    {/* -------------------------------------------------- FILTERS */}
                    <aside className="lg:col-span-3">
                        <button
                            type="button"
                            onClick={() => setShowFilters((value) => !value)}
                            aria-expanded={showFilters}
                            className="flex h-11 w-full items-center justify-between rounded-full border border-border px-4 text-[13px] font-medium text-ink lg:hidden dark:text-foreground"
                        >
                            <span className="inline-flex items-center gap-2">
                                <SlidersHorizontal
                                    className="size-4"
                                    strokeWidth={1.7}
                                />
                                Filtros
                                {activeCount > 0 && (
                                    <span className="grid size-5 place-items-center rounded-full bg-gold text-[10px] text-ink">
                                        {activeCount}
                                    </span>
                                )}
                            </span>
                            <span className="text-ceniza">
                                {showFilters ? 'Cerrar' : 'Abrir'}
                            </span>
                        </button>

                        <div
                            className={cn(
                                'mt-3 space-y-6 lg:sticky lg:top-24 lg:mt-0 lg:block',
                                showFilters ? 'block' : 'hidden',
                            )}
                        >
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    apply({ q: term.trim() });
                                }}
                            >
                                <label
                                    htmlFor="filter-term"
                                    className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground"
                                >
                                    Buscar
                                </label>
                                <div className="mt-2 flex items-center gap-2 rounded-[14px] border border-border bg-card px-3">
                                    <input
                                        id="filter-term"
                                        value={term}
                                        onChange={(event) =>
                                            setTerm(event.target.value)
                                        }
                                        placeholder="Corte, color, uñas…"
                                        className="h-11 w-full border-0 bg-transparent text-[14px] text-ink placeholder:text-ceniza/70 focus:ring-0 focus:outline-none dark:text-foreground"
                                    />
                                    {term !== '' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTerm('');
                                                apply({ q: '' });
                                            }}
                                            aria-label="Limpiar búsqueda"
                                            className="text-ceniza hover:text-ink dark:hover:text-foreground"
                                        >
                                            <X
                                                className="size-4"
                                                strokeWidth={1.8}
                                            />
                                        </button>
                                    )}
                                </div>
                            </form>

                            <fieldset>
                                <legend className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                                    Categoría
                                </legend>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    <FilterChip
                                        active={filters.category === null}
                                        onClick={() =>
                                            apply({ category: null })
                                        }
                                    >
                                        Todas
                                    </FilterChip>
                                    {options.categories.map((category) => (
                                        <FilterChip
                                            key={category.slug}
                                            active={
                                                filters.category ===
                                                category.slug
                                            }
                                            onClick={() =>
                                                apply({
                                                    category: category.slug,
                                                })
                                            }
                                        >
                                            {category.name}
                                        </FilterChip>
                                    ))}
                                </div>
                            </fieldset>

                            <div>
                                <label
                                    htmlFor="filter-zone"
                                    className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground"
                                >
                                    Zona
                                </label>
                                <select
                                    id="filter-zone"
                                    value={filters.zone ?? ''}
                                    onChange={(event) =>
                                        apply({
                                            zone:
                                                event.target.value || null,
                                        })
                                    }
                                    className="mt-2 h-11 w-full rounded-[14px] border border-border bg-card px-3 text-[14px] text-ink dark:text-foreground"
                                >
                                    <option value="">Toda la ciudad</option>
                                    {options.zones.map((zone) => (
                                        <option key={zone} value={zone}>
                                            {zone}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <span className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                                    Precio del servicio
                                </span>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <select
                                        aria-label="Precio mínimo"
                                        value={filters.min ?? ''}
                                        onChange={(event) =>
                                            apply({
                                                min: event.target.value
                                                    ? Number(event.target.value)
                                                    : null,
                                            })
                                        }
                                        className="h-11 w-full rounded-[14px] border border-border bg-card px-3 text-[13px] text-ink dark:text-foreground"
                                    >
                                        <option value="">Desde</option>
                                        {priceSteps(
                                            options.priceFloor,
                                            options.priceCeiling,
                                        ).map((value) => (
                                            <option key={value} value={value}>
                                                {money(value * 100)}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        aria-label="Precio máximo"
                                        value={filters.max ?? ''}
                                        onChange={(event) =>
                                            apply({
                                                max: event.target.value
                                                    ? Number(event.target.value)
                                                    : null,
                                            })
                                        }
                                        className="h-11 w-full rounded-[14px] border border-border bg-card px-3 text-[13px] text-ink dark:text-foreground"
                                    >
                                        <option value="">Hasta</option>
                                        {priceSteps(
                                            options.priceFloor,
                                            options.priceCeiling,
                                        ).map((value) => (
                                            <option key={value} value={value}>
                                                {money(value * 100)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <fieldset>
                                <legend className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                                    Calificación
                                </legend>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    <FilterChip
                                        active={filters.rating === null}
                                        onClick={() =>
                                            apply({ rating: null })
                                        }
                                    >
                                        Cualquiera
                                    </FilterChip>
                                    {[4, 4.5].map((value) => (
                                        <FilterChip
                                            key={value}
                                            active={filters.rating === value}
                                            onClick={() =>
                                                apply({ rating: value })
                                            }
                                        >
                                            {value}+
                                        </FilterChip>
                                    ))}
                                </div>
                            </fieldset>

                            {activeCount > 0 && (
                                <button
                                    type="button"
                                    onClick={clear}
                                    className="text-[12px] font-medium text-gold-deep hover:text-gold-deep"
                                >
                                    Limpiar todos los filtros
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* -------------------------------------------------- RESULTS */}
                    <section className="lg:col-span-9">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                            <p className="text-[12px] text-ceniza dark:text-muted-foreground">
                                {results.from ?? 0}–{results.to ?? 0} de{' '}
                                {results.total}
                            </p>

                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="sort"
                                    className="text-[12px] text-ceniza dark:text-muted-foreground"
                                >
                                    Ordenar por
                                </label>
                                <select
                                    id="sort"
                                    value={filters.sort}
                                    onChange={(event) =>
                                        apply({ sort: event.target.value })
                                    }
                                    className="h-9 rounded-full border border-border bg-card px-3 text-[12px] font-medium text-ink dark:text-foreground"
                                >
                                    {sortOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <div className="ml-1 flex rounded-full border border-border p-0.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            apply({ view: 'lista' })
                                        }
                                        aria-pressed={
                                            filters.view === 'lista'
                                        }
                                        className={cn(
                                            'grid size-8 place-items-center rounded-full transition-colors',
                                            filters.view === 'lista'
                                                ? 'bg-ink text-cal dark:bg-foreground dark:text-background'
                                                : 'text-ceniza hover:text-ink',
                                        )}
                                    >
                                        <LayoutGrid
                                            className="size-4"
                                            strokeWidth={1.7}
                                        />
                                        <span className="sr-only">Lista</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => apply({ view: 'mapa' })}
                                        aria-pressed={filters.view === 'mapa'}
                                        className={cn(
                                            'grid size-8 place-items-center rounded-full transition-colors',
                                            filters.view === 'mapa'
                                                ? 'bg-ink text-cal dark:bg-foreground dark:text-background'
                                                : 'text-ceniza hover:text-ink',
                                        )}
                                    >
                                        <Map
                                            className="size-4"
                                            strokeWidth={1.7}
                                        />
                                        <span className="sr-only">Mapa</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {results.data.length === 0 ? (
                            <div className="mt-10 flex flex-col items-start gap-4 rounded-[20px] border border-dashed border-border bg-card p-8">
                                <h2 className="font-display text-[22px] font-bold tracking-[-0.03em] text-ink dark:text-foreground">
                                    Nada por aquí todavía
                                </h2>
                                <p className="max-w-md text-[14px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                    Prueba con otra categoría, amplía el rango
                                    de precio o busca en toda la ciudad.
                                </p>
                                <button
                                    type="button"
                                    onClick={clear}
                                    className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[13px] font-medium text-cal dark:bg-foreground dark:text-background"
                                >
                                    Ver todo
                                </button>
                            </div>
                        ) : filters.view === 'mapa' ? (
                            <div className="mt-5">
                                <MapPanel
                                    points={mapPoints}
                                    city={city}
                                    configured={mapsConfigured}
                                    browserKey={mapsKey}
                                />
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {results.data.map((business) => (
                                    <BusinessCard
                                        key={business.slug}
                                        business={business}
                                    />
                                ))}
                            </div>
                        )}

                        {filters.view === 'lista' &&
                            results.last_page > 1 && (
                                <nav
                                    aria-label="Paginación"
                                    className="mt-10 flex items-center justify-between border-t border-border pt-5"
                                >
                                    <PageButton
                                        disabled={results.current_page === 1}
                                        onClick={() =>
                                            goTo(results.current_page - 1)
                                        }
                                        direction="prev"
                                    />
                                    <span className="text-[12px] text-ceniza tnum dark:text-muted-foreground">
                                        Página {results.current_page} de{' '}
                                        {results.last_page}
                                    </span>
                                    <PageButton
                                        disabled={
                                            results.current_page ===
                                            results.last_page
                                        }
                                        onClick={() =>
                                            goTo(results.current_page + 1)
                                        }
                                        direction="next"
                                    />
                                </nav>
                            )}
                    </section>
                </div>
            </div>
        </>
    );
}

function goTo(page: number) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(page));
    router.get(`/descubrir?${params.toString()}`, {}, {
        preserveState: true,
        preserveScroll: true,
    });
}

function FilterChip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                'rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
                active
                    ? 'border-ink bg-ink text-cal dark:border-foreground dark:bg-foreground dark:text-background'
                    : 'border-border text-ceniza hover:border-ink/30 hover:text-ink dark:text-muted-foreground dark:hover:text-foreground',
            )}
        >
            {children}
        </button>
    );
}

function PageButton({
    disabled,
    onClick,
    direction,
}: {
    disabled: boolean;
    onClick: () => void;
    direction: 'prev' | 'next';
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="inline-flex h-9 items-center gap-1 rounded-full border border-border px-4 text-[12px] font-medium text-ink disabled:opacity-40 dark:text-foreground"
        >
            {direction === 'prev' ? (
                <ChevronLeft className="size-3.5" strokeWidth={1.8} />
            ) : null}
            {direction === 'prev' ? 'Anterior' : 'Siguiente'}
            {direction === 'next' ? (
                <ChevronRight className="size-3.5" strokeWidth={1.8} />
            ) : null}
        </button>
    );
}

function priceSteps(floor: number, ceiling: number): number[] {
    const start = Math.max(0, Math.floor(floor / 10000) * 10000);
    const end = Math.ceil(ceiling / 10000) * 10000;
    const steps: number[] = [];

    for (let value = start; value <= end; value += 20000) {
        steps.push(value);
    }

    return steps;
}
