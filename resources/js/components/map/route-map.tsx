import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet';

import { money } from '@/lib/format';

export type MapBusiness = {
    name: string;
    slug: string;
    category: string;
    neighborhood: string | null;
    address: string;
    lat: number;
    lng: number;
    rating: number;
    min_price_cents: number | null;
    cover: string | null;
    is_demo: boolean;
};

type Mode = 'moto' | 'carro' | 'pie';

const modeConfig: Record<Mode, { profile: string; factor: number; label: string; icon: string }> = {
    moto: { profile: 'driving', factor: 0.78, label: 'En moto', icon: '🏍️' },
    carro: { profile: 'driving', factor: 1, label: 'En carro', icon: '🚗' },
    pie: { profile: 'foot', factor: 1, label: 'A pie', icon: '🚶' },
};

function pin(color: string, label: string) {
    return L.divIcon({
        className: '',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;background:${color};color:#121214;font:700 11px/1 Archivo,sans-serif;border:3px solid #fff;box-shadow:0 6px 16px -6px rgba(18,18,20,.55)">${label}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
    });
}

function Recenter({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);

    return null;
}

export function RouteMap({
    businesses,
    center,
}: {
    businesses: MapBusiness[];
    center: { lat: number; lng: number };
}) {
    const [selected, setSelected] = useState<MapBusiness | null>(null);
    const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
    const [originLabel, setOriginLabel] = useState('Centro de Popayán');
    const [mode, setMode] = useState<Mode>('moto');
    const [route, setRoute] = useState<[number, number][]>([]);
    const [stats, setStats] = useState<{ km: number; minutes: number } | null>(null);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [routeError, setRouteError] = useState<string | null>(null);
    const [simulating, setSimulating] = useState(false);
    const [simIndex, setSimIndex] = useState(0);
    const timer = useRef<number | null>(null);

    const mapCenter = useMemo<[number, number]>(
        () => [center.lat, center.lng],
        [center.lat, center.lng],
    );

    const locate = () => {
        if (!('geolocation' in navigator)) {
            setOriginLabel('Ubicación no disponible');

            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setOrigin({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setOriginLabel('Tu ubicación');
            },
            () => {
                setOrigin({ lat: center.lat, lng: center.lng });
                setOriginLabel('Centro de Popayán (sin permiso de ubicación)');
            },
            { timeout: 8000 },
        );
    };

    const buildRoute = async (business: MapBusiness, nextMode: Mode) => {
        const start = origin ?? { lat: center.lat, lng: center.lng };
        const config = modeConfig[nextMode];
        setLoadingRoute(true);
        setRouteError(null);
        setRoute([]);
        setStats(null);

        try {
            const url = `https://router.project-osrm.org/route/v1/${config.profile}/${start.lng},${start.lat};${business.lng},${business.lat}?overview=full&geometries=geojson`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('osrm');
            }

            const data = await response.json();
            const first = data.routes?.[0];

            if (!first) {
                throw new Error('empty');
            }

            const coords = first.geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
            );

            setRoute(coords);
            setStats({
                km: first.distance / 1000,
                minutes: Math.max(1, Math.round((first.duration / 60) * config.factor)),
            });
            setSimIndex(0);
        } catch {
            // Never pretend a route exists: show a straight, labelled approximation.
            setRoute([
                [start.lat, start.lng],
                [business.lat, business.lng],
            ]);
            const km = haversine(start, business);
            setStats({ km, minutes: Math.max(1, Math.round((km / 18) * 60 * config.factor)) });
            setRouteError('Ruta aproximada: el servidor de calles no respondió.');
        } finally {
            setLoadingRoute(false);
        }
    };

    const selectBusiness = (business: MapBusiness) => {
        setSelected(business);
        setSimulating(false);
        buildRoute(business, mode);
    };

    useEffect(() => {
        if (!selected) {
            return;
        }

        buildRoute(selected, mode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    useEffect(() => {
        if (!simulating || route.length < 2) {
            return;
        }

        timer.current = window.setInterval(() => {
            setSimIndex((index) => {
                if (index >= route.length - 1) {
                    setSimulating(false);

                    return route.length - 1;
                }

                return index + 1;
            });
        }, 120);

        return () => {
            if (timer.current) {
                window.clearInterval(timer.current);
            }
        };
    }, [simulating, route]);

    const simulatedPoint = route[simIndex];

    return (
        <div className="relative overflow-hidden rounded-[20px] border border-border">
            <div className="h-[440px] w-full lg:h-[560px]">
                <MapContainer
                    center={mapCenter}
                    zoom={14}
                    scrollWheelZoom
                    className="h-full w-full [&_.leaflet-tile-pane]:brightness-[1.03] [&_.leaflet-tile-pane]:grayscale-[0.35] [&_.leaflet-tile-pane]:sepia-[0.06]"
                    attributionControl
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {businesses.map((business) => (
                        <Marker
                            key={business.slug}
                            position={[business.lat, business.lng]}
                            icon={pin(
                                selected?.slug === business.slug ? '#C59B27' : '#121214',
                                business.name.slice(0, 1),
                            )}
                            eventHandlers={{ click: () => selectBusiness(business) }}
                        >
                            <Popup>
                                <div style={{ minWidth: 160 }}>
                                    <strong>{business.name}</strong>
                                    <div style={{ color: '#6b6862', fontSize: 12 }}>
                                        {business.neighborhood}
                                    </div>
                                    <a href={`/negocios/${business.slug}`}>Ver local</a>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {origin && (
                        <Marker position={[origin.lat, origin.lng]} icon={pin('#16A34A', 'TÚ')}>
                            <Popup>Tú estás aquí</Popup>
                        </Marker>
                    )}

                    {route.length > 1 && (
                        <Polyline
                            positions={route}
                            pathOptions={{
                                color: '#C59B27',
                                weight: 5,
                                opacity: 0.95,
                                dashArray: routeError ? '8 10' : undefined,
                            }}
                        />
                    )}

                    {simulatedPoint && simulating && (
                        <Marker position={simulatedPoint} icon={pin('#16A34A', '🏍')} />
                    )}

                    <Recenter center={mapCenter} />
                </MapContainer>
            </div>

            <div className="pointer-events-none absolute inset-x-3 top-3">
                <div className="pointer-events-auto rounded-[16px] border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-ink dark:text-foreground">
                                {selected ? selected.name : 'Elige un local en el mapa'}
                            </p>
                            <p className="truncate text-[11px] text-ceniza dark:text-muted-foreground">
                                {selected
                                    ? `${selected.address}${selected.neighborhood ? ', ' + selected.neighborhood : ''}`
                                    : originLabel}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={locate}
                            className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-ink dark:text-foreground"
                        >
                            {origin ? 'Actualizar' : 'Usar mi ubicación'}
                        </button>
                    </div>

                    {selected && (
                        <>
                            <div className="mt-2 flex gap-1.5">
                                {(Object.keys(modeConfig) as Mode[]).map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setMode(key)}
                                        className={
                                            mode === key
                                                ? 'rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-ink'
                                                : 'rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-ceniza'
                                        }
                                    >
                                        {modeConfig[key].icon} {modeConfig[key].label}
                                    </button>
                                ))}
                            </div>

                            {loadingRoute ? (
                                <p className="mt-2 text-[11px] text-ceniza">Calculando ruta…</p>
                            ) : stats ? (
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <p className="text-[12px] font-semibold text-ink tnum dark:text-foreground">
                                        A {stats.km.toFixed(1)} km · {stats.minutes} min
                                    </p>
                                    <div className="flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSimIndex(0);
                                                setSimulating(true);
                                            }}
                                            className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-cal"
                                        >
                                            Simular viaje
                                        </button>
                                        <a
                                            href={`/negocios/${selected.slug}`}
                                            className="rounded-full bg-gold px-3 py-1.5 text-[11px] font-semibold text-ink"
                                        >
                                            Ver local
                                        </a>
                                    </div>
                                </div>
                            ) : null}

                            {routeError && (
                                <p className="mt-1.5 text-[10.5px] text-ceniza">{routeError}</p>
                            )}

                            {selected.min_price_cents !== null && (
                                <p className="mt-1 text-[10.5px] text-ceniza">
                                    Desde {money(selected.min_price_cents)}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(h));
}
