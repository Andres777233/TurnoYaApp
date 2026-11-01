import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { cn } from '@/lib/utils';

export function SearchBar({
    zones,
    className,
    autoFocus = false,
}: {
    zones: string[];
    className?: string;
    autoFocus?: boolean;
}) {
    const [term, setTerm] = useState('');
    const [zone, setZone] = useState('');

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const params: Record<string, string> = {};

        if (term.trim() !== '') {
            params.q = term.trim();
        }

        if (zone !== '') {
            params.zona = zone;
        }

        router.get('/descubrir', params, { preserveScroll: true });
    };

    return (
        <form
            onSubmit={submit}
            role="search"
            aria-label="Buscar servicios de belleza"
            className={cn(
                'grid grid-cols-1 overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_24px_60px_-30px_rgba(23,20,18,0.35)] md:grid-cols-[1.4fr_1fr_auto]',
                className,
            )}
        >
            <div className="flex flex-col gap-1 px-5 py-3.5">
                <label
                    htmlFor="search-service"
                    className="text-[10px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground"
                >
                    ¿Qué te haces?
                </label>
                <input
                    id="search-service"
                    name="q"
                    value={term}
                    autoFocus={autoFocus}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder="Corte, color, uñas…"
                    className="h-7 w-full border-0 bg-transparent p-0 text-[15px] text-ink placeholder:text-ceniza/70 focus:ring-0 focus:outline-none dark:text-foreground dark:placeholder:text-muted-foreground/70"
                />
            </div>

            <div className="flex flex-col gap-1 border-t border-border px-5 py-3.5 md:border-t-0 md:border-l">
                <label
                    htmlFor="search-zone"
                    className="text-[10px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground"
                >
                    ¿Dónde?
                </label>
                <select
                    id="search-zone"
                    name="zona"
                    value={zone}
                    onChange={(event) => setZone(event.target.value)}
                    className="h-7 w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-[15px] text-ink focus:ring-0 focus:outline-none dark:text-foreground"
                >
                    <option value="">Todo Popayán</option>
                    {zones.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                className="m-2 inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-gold px-6 text-[14px] font-semibold text-ink transition-colors hover:bg-gold-deep active:scale-[0.99] md:h-auto"
            >
                <Search className="size-4" strokeWidth={2} aria-hidden />
                Buscar
            </button>
        </form>
    );
}
