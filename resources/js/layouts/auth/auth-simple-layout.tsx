import { Link } from '@inertiajs/react';

import { Logo } from '@/components/site/logo';
import type { AuthLayoutProps } from '@/types';

/**
 * Split editorial layout: photography on the left, form on the right.
 * The image is decorative and hidden on small screens, where the form is the
 * only thing that matters.
 */
export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-[100dvh] bg-cal lg:grid-cols-2 dark:bg-background">
            <aside className="relative hidden overflow-hidden bg-ink lg:block">
                <img
                    src="/storage/demo/hero2.jpg"
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />

                <div className="relative flex h-full flex-col justify-between p-10">
                    <Link
                        href="/"
                        className="w-fit font-display text-[24px] leading-none font-extrabold tracking-[-0.06em] text-cal"
                    >
                        turno<span className="text-gold-deep">ya</span>
                    </Link>

                    <div className="max-w-sm">
                        <p className="font-display text-[30px] leading-[1.05] font-bold tracking-[-0.04em] text-cal">
                            Tu agenda, tus clientes y tu trabajo en un solo
                            lugar.
                        </p>
                        <p className="mt-3 text-[13px] leading-relaxed text-cal/70">
                            Reservas reales, recordatorios automáticos y un
                            perfil que muestra lo que haces.
                        </p>
                    </div>
                </div>
            </aside>

            <main className="flex flex-col px-5 py-8 sm:px-10 lg:px-14 lg:py-10">
                <div className="lg:hidden">
                    <Logo />
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-[380px]">
                        <div className="mb-7">
                            <h1 className="font-display text-[28px] leading-[1.05] font-bold tracking-[-0.04em] text-ink dark:text-foreground">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-2 text-[14px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>

                        {children}
                    </div>
                </div>

                <p className="mt-8 text-center text-[11px] text-ceniza lg:text-left dark:text-muted-foreground">
                    Al continuar aceptas los términos de uso y la política de
                    tratamiento de datos.
                </p>
            </main>
        </div>
    );
}
