import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';

type Variant = 'bento' | 'stack' | 'grid';

export type BusinessCardData = {
    name: string;
    slug: string;
    tagline: string | null;
    category: string | null;
    neighborhood: string | null;
    city: string | null;
    cover: string | null;
    rating: number;
    reviews: number;
    min_price_cents: number | null;
    professionals: number | null;
    is_demo: boolean;
};

/**
 * One card family, three densities. The image does the work; metadata is
 * deliberately sparse so the grid reads as a magazine, not a dashboard.
 */
export function BusinessCard({
    business,
    variant = 'grid',
    className,
}: {
    business: BusinessCardData;
    variant?: Variant;
    className?: string;
}) {
    const large = variant === 'bento';

    return (
        <Link
            href={`/negocios/${business.slug}`}
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card',
                'transition-[box-shadow,transform] duration-300 ease-out',
                'hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(23,20,18,0.45)]',
                className,
            )}
        >
            <div
                className={cn(
                    'relative w-full overflow-hidden bg-arena dark:bg-ink-soft',
                    variant === 'grid'
                        ? 'aspect-[4/3]'
                        : 'min-h-0 flex-1',
                )}
            >
                {business.cover ? (
                    <img
                        src={business.cover}
                        alt={`Fachada o interior de ${business.name}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-ceniza">
                        <span className="font-display text-3xl font-bold">
                            {business.name.slice(0, 2)}
                        </span>
                    </div>
                )}

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {business.is_demo && (
                        <span className="rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-cal uppercase backdrop-blur">
                            Demostración
                        </span>
                    )}
                </div>

                {business.min_price_cents !== null && (
                    <span className="absolute right-3 bottom-3 rounded-full bg-cal/95 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur tnum">
                        desde {formatPrice(business.min_price_cents)}
                    </span>
                )}
            </div>

            <div className={cn('flex flex-col gap-1.5', large ? 'p-5' : 'p-4')}>
                <div className="flex items-start justify-between gap-3">
                    <h3
                        className={cn(
                            'font-display font-bold tracking-[-0.035em] text-ink dark:text-foreground',
                            large ? 'text-xl' : 'text-[17px]',
                        )}
                    >
                        {business.name}
                    </h3>
                    {business.rating > 0 && (
                        <span className="mt-0.5 shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold tnum">
                            {business.rating.toFixed(1).replace('.', ',')}
                        </span>
                    )}
                </div>

                {business.tagline && (
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-ceniza dark:text-muted-foreground">
                        {business.tagline}
                    </p>
                )}

                <div className="mt-auto flex items-center gap-2 pt-2 text-[11px] font-medium tracking-[0.02em] text-ceniza uppercase dark:text-muted-foreground">
                    <span>{business.category}</span>
                    {business.neighborhood && (
                        <>
                            <span aria-hidden className="text-arena dark:text-border">
                                /
                            </span>
                            <span>{business.neighborhood}</span>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}

function formatPrice(cents: number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    })
        .format(cents / 100)
        .replace(/\u00a0/g, ' ') + ' COP';
}
