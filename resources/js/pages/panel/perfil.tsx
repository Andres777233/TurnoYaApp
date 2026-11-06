import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';

export default function PanelPerfil({
    business,
    profile,
}: {
    business: { name: string; slug: string };
    profile: {
        name: string;
        slug: string;
        headline: string | null;
        bio: string | null;
        avatar: string | null;
        rating: number;
        reviews: number;
        specialties: string[];
        portfolio: string[];
        services: { name: string; price_cents: number }[];
    };
}) {
    return (
        <div className="mx-auto w-full max-w-[860px] px-4 py-6 lg:px-8">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-ceniza uppercase dark:text-muted-foreground">
                {business.name}
            </p>
            <h1 className="mt-2 font-display text-[30px] leading-none font-extrabold tracking-[-0.05em] text-ink lg:text-[38px] dark:text-foreground">
                Mi perfil y trabajos
            </h1>

            <div className="mt-6 flex items-center gap-4 rounded-[20px] border border-border bg-card p-4">
                {profile.avatar ? (
                    <img
                        src={profile.avatar}
                        alt=""
                        className="size-16 rounded-full object-cover"
                    />
                ) : (
                    <span className="grid size-16 place-items-center rounded-full bg-ink font-display text-[17px] font-bold text-cal">
                        {profile.name
                            .split(' ')
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join('')}
                    </span>
                )}
                <div className="min-w-0 flex-1">
                    <p className="font-display text-[18px] font-bold tracking-[-0.03em] text-ink dark:text-foreground">
                        {profile.name}
                    </p>
                    <p className="text-[12px] text-ceniza dark:text-muted-foreground">
                        {profile.headline}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-ink dark:text-foreground">
                        <Star className="size-3 fill-gold text-gold" />
                        {profile.reviews === 0
                            ? 'Sin reseñas todavía'
                            : `${profile.rating.toFixed(1)} · ${profile.reviews} reseñas`}
                    </p>
                </div>
                <Link
                    href={`/profesionales/${profile.slug}`}
                    className="rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-ink dark:text-foreground"
                >
                    Ver público
                </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
                {profile.specialties.map((specialty) => (
                    <span
                        key={specialty}
                        className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-ink dark:text-foreground"
                    >
                        {specialty}
                    </span>
                ))}
            </div>

            <h2 className="mt-8 text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                Mis trabajos
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {profile.portfolio.map((url) => (
                    <img
                        key={url}
                        src={url}
                        alt=""
                        className="aspect-[4/5] w-full rounded-[14px] object-cover"
                    />
                ))}
            </div>

            <h2 className="mt-8 text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                Mis servicios
            </h2>
            <ul className="mt-2 divide-y divide-border rounded-[16px] border border-border bg-card">
                {profile.services.map((service) => (
                    <li
                        key={service.name}
                        className="flex items-center justify-between px-4 py-3"
                    >
                        <span className="text-[13px] text-ink dark:text-foreground">
                            {service.name}
                        </span>
                        <span className="text-[13px] font-semibold text-ink tnum dark:text-foreground">
                            ${' '}
                            {new Intl.NumberFormat('es-CO').format(
                                service.price_cents / 100,
                            )}{' '}
                            COP
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
