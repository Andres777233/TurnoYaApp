import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Star } from 'lucide-react';

import { RouteMap, type MapBusiness } from '@/components/map/route-map';
import { money } from '@/lib/format';

export default function MapPage({
    businesses,
    center,
}: {
    businesses: MapBusiness[];
    center: { lat: number; lng: number };
}) {
    return (
        <>
            <Head title="Mapa · TurnoYa" />

            <div className="mx-auto w-full max-w-[1240px] px-4 py-6 lg:px-8">
                <h1 className="font-display text-[28px] leading-none font-extrabold tracking-[-0.05em] text-ink lg:text-[38px] dark:text-foreground">
                    Mapa de Popayán
                </h1>
                <p className="mt-2 text-[13px] text-ceniza dark:text-muted-foreground">
                    Toca un local para ver la ruta, la distancia y el tiempo.
                    Todo dentro de TurnoYa.
                </p>

                <div className="mt-5">
                    <RouteMap businesses={businesses} center={center} />
                </div>

                <h2 className="mt-8 text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                    Locales en el mapa
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {businesses.map((business) => (
                        <li key={business.slug}>
                            <Link
                                href={`/negocios/${business.slug}`}
                                className="flex items-center gap-3 rounded-[16px] border border-border bg-card p-3 transition-colors hover:border-gold/50"
                            >
                                {business.cover ? (
                                    <img
                                        src={business.cover}
                                        alt=""
                                        className="size-12 shrink-0 rounded-[12px] object-cover"
                                    />
                                ) : (
                                    <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-ink text-[12px] font-bold text-cal">
                                        {business.name.slice(0, 2)}
                                    </span>
                                )}
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[13px] font-semibold text-ink dark:text-foreground">
                                        {business.name}
                                    </span>
                                    <span className="block truncate text-[11px] text-ceniza dark:text-muted-foreground">
                                        {business.neighborhood} ·{' '}
                                        {money(business.min_price_cents)}
                                    </span>
                                </span>
                                {business.rating > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold">
                                        <Star className="size-3 fill-gold text-gold" />
                                        {business.rating.toFixed(1)}
                                    </span>
                                )}
                                <ArrowRight className="size-3.5 text-ceniza" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
