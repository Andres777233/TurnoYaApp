import { Head, Link } from '@inertiajs/react';

export default function About() {
    return (
        <>
            <Head title="Acerca de TurnoYa" />

            <div className="mx-auto w-full max-w-[720px] px-4 py-10 lg:px-8">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-ceniza uppercase dark:text-muted-foreground">
                    Acerca
                </p>
                <h1 className="mt-2 font-display text-[32px] leading-[1.02] font-extrabold tracking-[-0.05em] text-ink lg:text-[42px] dark:text-foreground">
                    TurnoYa
                </h1>
                <p className="mt-4 text-[15px] leading-relaxed text-ceniza dark:text-muted-foreground">
                    TurnoYa conecta a las personas de Popayán con barberías,
                    peluquerías y salones de belleza que publican su agenda
                    real. Eliges el servicio, ves las horas disponibles y
                    reservas en tres toques. Si alguien cancela, avisamos solo a
                    quienes tienen el local en favoritos.
                </p>

                <ul className="mt-6 space-y-2 text-[14px] text-ink dark:text-foreground">
                    <li>· Cobertura: Popayán, Cauca.</li>
                    <li>· Precios siempre en pesos colombianos.</li>
                    <li>· Zona horaria: America/Bogota.</li>
                </ul>

                <div className="mt-8 flex flex-wrap gap-2">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center rounded-full bg-gold px-5 text-[13px] font-semibold text-ink"
                    >
                        Explorar locales
                    </Link>
                    <Link
                        href="/legal/privacidad"
                        className="inline-flex h-10 items-center rounded-full border border-border px-5 text-[13px] font-medium text-ink dark:text-foreground"
                    >
                        Privacidad
                    </Link>
                    <Link
                        href="/legal/terminos"
                        className="inline-flex h-10 items-center rounded-full border border-border px-5 text-[13px] font-medium text-ink dark:text-foreground"
                    >
                        Términos
                    </Link>
                </div>

                <p className="mt-8 text-[11px] leading-relaxed text-ceniza dark:text-muted-foreground">
                    Los perfiles marcados como “Demostración” son contenido de
                    ejemplo para revisar el producto, no negocios reales.
                </p>
            </div>
        </>
    );
}
