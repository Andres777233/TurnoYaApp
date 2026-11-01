import { Star } from 'lucide-react';

import { rating as formatRating } from '@/lib/format';
import { cn } from '@/lib/utils';

export function Rating({
    value,
    count,
    className,
}: {
    value: number;
    count: number;
    className?: string;
}) {
    if (count === 0) {
        return (
            <span
                className={cn(
                    'text-xs font-medium text-ceniza dark:text-muted-foreground',
                    className,
                )}
            >
                Sin reseñas todavía
            </span>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold text-ink dark:text-foreground',
                className,
            )}
        >
            <Star
                className="size-3.5 fill-gold text-gold-deep"
                strokeWidth={1.5}
                aria-hidden
            />
            <span className="tnum">{formatRating(value)}</span>
            <span className="font-normal text-ceniza dark:text-muted-foreground">
                ({count})
            </span>
            <span className="sr-only">de 5, {count} reseñas</span>
        </span>
    );
}
