import { Head, Link, router } from '@inertiajs/react';
import { Bell, BellOff, Heart, Star } from 'lucide-react';

import { money } from '@/lib/format';

type FavoriteItem = {
    name: string;
    slug: string;
    tagline: string | null;
    category: string | null;
    neighborhood: string | null;
    cover: string | null;
    rating: number;
    reviews: number;
    min_price_cents: number | null;
    is_demo: boolean;
    notify_on_vacancy: boolean;
};

export default function Favorites({
    favorites,
}: {
    favorites: FavoriteItem[];
}) {
    return (
        <>
            <Head title="Mis favoritos · TurnoYa" />

            <div className="mx-auto w-full max-w-[960px] px-4 py-8 lg:px-8 lg:py-12">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-ceniza uppercase dark:text-muted-foreground">
                    Tus locales
                </p>
                <h1 className="mt-2 font-display text-[32px] leading-none font-extrabold tracking-[-0.05em] text-ink lg:text-[42px] dark:text-foreground">
                    Favoritos
                </h1>
                <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ceniza dark:text-muted-foreground">
                    Solo los locales que guardes aquí te avisan cuando alguien
                    cancela y se libera un turno.
                </p>

                {favorites.length === 0 ? (
                    <div className="mt-8 rounded-[20px] border border-dashed border-border bg-card p-8">
                        <Heart className="size-6 text-gold" strokeWidth={1.8} />
                        <p className="mt-3 font-display text-[20px] font-bold tracking-[-0.03em] text-ink dark:text-foreground">
                            Todavía no tienes favoritos
                        </p>
                        <p className="mt-1 max-w-md text-[13px] text-ceniza dark:text-muted-foreground">
                            Toca el corazón en cualquier local para guardarlo y
                            recibir avisos de cupos liberados.
                        </p>
                        <Link
                            href="/"
                            className="mt-4 inline-flex h-10 items-center rounded-full bg-gold px-5 text-[13px] font-semibold text-ink"
                        >
                            Explorar locales
                        </Link>
                    </div>
                ) : (
                    <ul className="mt-6 grid gap-3">
                        {favorites.map((favorite) => (
                            <li
                                key={favorite.slug}
                                className="flex flex-wrap items-center gap-3 rounded-[18px] border border-border bg-card p-3"
                            >
                                <Link
                                    href={`/negocios/${favorite.slug}`}
                                    className="flex min-w-0 flex-1 items-center gap-3"
                                >
                                    {favorite.cover ? (
                                        <img
                                            src={favorite.cover}
                                            alt=""
                                            className="size-16 shrink-0 rounded-[14px] object-cover"
                                        />
                                    ) : (
                                        <span className="grid size-16 shrink-0 place-items-center rounded-[14px] bg-ink text-[13px] font-bold text-cal">
                                            {favorite.name.slice(0, 2)}
                                        </span>
                                    )}
                                    <span className="min-w-0">
                                        <span className="block truncate font-display text-[15px] font-bold tracking-[-0.02em] text-ink dark:text-foreground">
                                            {favorite.name}
                                        </span>
                                        <span className="block truncate text-[11.5px] text-ceniza dark:text-muted-foreground">
                                            {favorite.category} ·{' '}
                                            {favorite.neighborhood} ·{' '}
                                            {money(favorite.min_price_cents)}
                                        </span>
                                        {favorite.rating > 0 && (
                                            <span className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-semibold text-ink dark:text-foreground">
                                                <Star className="size-3 fill-gold text-gold" />
                                                {favorite.rating
                                                    .toFixed(1)
                                                    .replace('.', ',')}{' '}
                                                <span className="font-normal text-ceniza">
                                                    ({favorite.reviews})
                                                </span>
                                            </span>
                                        )}
                                    </span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            `/favoritos/${favorite.slug}/avisos`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                    className={
                                        favorite.notify_on_vacancy
                                            ? 'inline-flex h-9 items-center gap-1.5 rounded-full bg-green-soft px-3 text-[11px] font-semibold text-green-deep'
                                            : 'inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-medium text-ceniza'
                                    }
                                >
                                    {favorite.notify_on_vacancy ? (
                                        <Bell className="size-3.5" />
                                    ) : (
                                        <BellOff className="size-3.5" />
                                    )}
                                    {favorite.notify_on_vacancy
                                        ? 'Avisos activos'
                                        : 'Avisos apagados'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            `/favoritos/${favorite.slug}/alternar`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                    aria-label={`Quitar ${favorite.name} de favoritos`}
                                    className="grid size-10 place-items-center rounded-full border border-border text-gold-deep"
                                >
                                    <Heart className="size-4 fill-gold text-gold" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
