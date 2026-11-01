import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/**
 * Demo records are real database rows flagged `is_demo`. They must be visible as
 * such so nobody mistakes them for a real business or a real customer review.
 */
export function DemoBadge({
    className,
    ...props
}: ComponentProps<'span'>) {
    return (
        <span
            title="Contenido de demostración, no es un negocio real"
            className={cn(
                'inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold-soft/60 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-gold-deep uppercase dark:border-gold/30 dark:bg-gold/10 dark:text-gold-deep',
                className,
            )}
            {...props}
        >
            Demostración
        </span>
    );
}
