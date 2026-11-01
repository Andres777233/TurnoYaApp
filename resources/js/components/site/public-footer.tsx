import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { Logo } from '@/components/site/logo';

const columns = [
    {
        title: 'Descubrir',
        links: [
            { label: 'Buscar servicios', href: '/descubrir' },
            { label: 'Barberías', href: '/descubrir?categoria=barberias' },
            { label: 'Peluquerías', href: '/descubrir?categoria=peluquerias' },
            { label: 'Uñas', href: '/descubrir?categoria=unas' },
        ],
    },
    {
        title: 'Para negocios',
        links: [
            { label: 'Publica tu negocio', href: '/register' },
            { label: 'Planes y comisiones', href: '/register' },
            { label: 'Ingresar al panel', href: '/login' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Política de privacidad', href: '/legal/privacidad' },
            { label: 'Términos de uso', href: '/legal/terminos' },
            { label: 'Tratamiento de datos', href: '/legal/datos' },
        ],
    },
];

export function PublicFooter() {
    return (
        <footer className="border-t border-border bg-cal-deep/60 dark:bg-card">
            <div className="mx-auto w-full max-w-[1240px] px-5 py-14 lg:px-8">
                <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
                    <div className="max-w-xs">
                        <Logo />
                        <p className="mt-3 text-[13px] leading-relaxed text-ceniza dark:text-muted-foreground">
                            Agenda real para barberías, peluquerías y estudios de
                            belleza en Popayán.
                        </p>
                        <p className="mt-4 text-[12px] text-ceniza/80 dark:text-muted-foreground/80">
                            Hecho en Popayán, Cauca.
                        </p>
                    </div>

                    {columns.map((column) => (
                        <nav key={column.title} aria-label={column.title}>
                            <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ink uppercase dark:text-foreground">
                                {column.title}
                            </h2>
                            <ul className="mt-4 space-y-2.5">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="group inline-flex items-center gap-1 text-[13px] text-ceniza transition-colors hover:text-ink dark:text-muted-foreground dark:hover:text-foreground"
                                        >
                                            {link.label}
                                            <ArrowUpRight
                                                className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
                                                strokeWidth={1.8}
                                                aria-hidden
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-[12px] text-ceniza sm:flex-row sm:items-center sm:justify-between dark:text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} TurnoYa. Todos los derechos
                        reservados.
                    </p>
                    <p>
                        Precios en pesos colombianos. Zona horaria:
                        America/Bogota.
                    </p>
                </div>
            </div>
        </footer>
    );
}
