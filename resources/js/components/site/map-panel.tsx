import { Link } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { money } from '@/lib/format';

export type MapPoint = {
    name: string;
    slug: string;
    lat: number;
    lng: number;
    neighborhood: string | null;
    rating: number;
    min_price_cents: number | null;
    cover: string | null;
    is_demo: boolean;
};

type Props = {
    points: MapPoint[];
    city: { name: string; lat: number; lng: number } | null;
    configured: boolean;
    browserKey: string | null;
};

/**
 * When a browser key exists we render a real Google map. Without a key we show
 * an honest fallback instead of a broken or fake map.
 */
export function MapPanel({ points, city, configured, browserKey }: Props) {
    const container = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);
    const key = browserKey ?? undefined;

    useEffect(() => {
        if (!configured || !key || !container.current || points.length === 0) {
            return;
        }

        const g = (window as unknown as { google?: any }).google;

        const render = () => {
            const google = (window as unknown as { google?: any }).google;

            if (!google || !container.current) {
                return;
            }

            const map = new google.maps.Map(container.current, {
                center: {
                    lat: city?.lat ?? points[0].lat,
                    lng: city?.lng ?? points[0].lng,
                },
                zoom: 14,
                disableDefaultUI: true,
                zoomControl: true,
                clickableIcons: false,
                styles: MAP_STYLE,
            });

            const info = new google.maps.InfoWindow();

            points.forEach((point) => {
                const marker = new google.maps.Marker({
                    position: { lat: point.lat, lng: point.lng },
                    map,
                    title: point.name,
                });

                marker.addListener('click', () => {
                    info.setContent(
                        `<div style="font-family:Instrument Sans,sans-serif;padding:2px 4px 4px">
                            <strong style="font-size:13px">${escapeHtml(point.name)}</strong>
                            <div style="font-size:11px;color:#6b655b;margin-top:2px">${escapeHtml(point.neighborhood ?? '')}</div>
                            <a href="/negocios/${point.slug}" style="font-size:11px;color:#c4371c;margin-top:6px;display:inline-block">Ver perfil</a>
                        </div>`,
                    );
                    info.open({ map, anchor: marker });
                });
            });
        };

        if (g) {
            render();

            return;
        }

        const src = `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly&language=es&region=CO`;
        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${src}"]`,
        );

        if (existing) {
            existing.addEventListener('load', render);

            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = render;
        script.onerror = () => setFailed(true);
        document.head.appendChild(script);
    }, [configured, key, points, city]);

    if (!configured || !key || failed) {
        return (
            <div className="grid gap-4">
                <div className="rounded-[20px] border border-dashed border-border bg-card p-6">
                    <div className="flex items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-soft/60 text-gold-deep">
                            <MapPin className="size-4" strokeWidth={1.8} />
                        </span>
                        <div>
                            <h3 className="text-[15px] font-semibold text-ink dark:text-foreground">
                                Vista de mapa pendiente de configurar
                            </h3>
                            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                Falta la clave de Google Maps Platform. Mientras
                                tanto puedes explorar los negocios por zona.
                                {failed && ' La carga del mapa falló.'}
                            </p>
                        </div>
                    </div>
                </div>

                <ul className="grid gap-2 sm:grid-cols-2">
                    {points.map((point) => (
                        <li key={point.slug}>
                            <Link
                                href={`/negocios/${point.slug}`}
                                className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-card px-4 py-3 transition-colors hover:border-gold/40"
                            >
                                <span className="min-w-0">
                                    <span className="block truncate text-[13px] font-semibold text-ink dark:text-foreground">
                                        {point.name}
                                    </span>
                                    <span className="block truncate text-[11px] text-ceniza dark:text-muted-foreground">
                                        {point.neighborhood ?? point.slug}
                                    </span>
                                </span>
                                <span className="shrink-0 text-[11px] font-medium text-ink tnum dark:text-foreground">
                                    {money(point.min_price_cents)}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                {points.length === 0 && (
                    <p className="text-[13px] text-ceniza dark:text-muted-foreground">
                        No hay negocios que coincidan con estos filtros.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div
            ref={container}
            role="region"
            aria-label="Mapa de negocios"
            className="h-[520px] w-full overflow-hidden rounded-[20px] border border-border"
        />
    );
}

const MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#f4f1ea' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#6b655b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f4f1ea' }] },
    {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#e9e3d6' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#dcd5c6' }],
    },
];

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
