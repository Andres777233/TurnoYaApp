import { BottomNav } from '@/components/site/bottom-nav';
import { DemoPanel } from '@/components/demo-panel';
import { PublicFooter } from '@/components/site/public-footer';
import { PublicHeader } from '@/components/site/public-header';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-[100dvh] flex-col bg-cal pb-nav lg:pb-nav-desktop dark:bg-background">
            <a
                href="#contenido"
                className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-cal"
            >
                Saltar al contenido
            </a>

            <PublicHeader />

            <main id="contenido" className="flex-1">
                {children}
            </main>

            <PublicFooter />

            <BottomNav />
            <DemoPanel />
        </div>
    );
}
