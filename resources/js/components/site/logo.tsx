import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <Link
            href="/"
            aria-label="TurnoYa, ir al inicio"
            className={cn(
                'inline-flex items-baseline font-display text-[22px] leading-none font-extrabold tracking-[-0.06em] text-ink dark:text-foreground',
                className,
            )}
        >
            turno<span className="text-gold-deep">ya</span>
        </Link>
    );
}
