import { router } from '@inertiajs/react';
import { Eye, EyeOff, Wallet } from 'lucide-react';

export default function PanelPropinas({
    business,
    profile,
    methods,
}: {
    business: { name: string };
    profile: { name: string; slug: string };
    methods: {
        id: number;
        type: string;
        type_label: string;
        account_value: string;
        is_visible: boolean;
    }[];
}) {
    return (
        <div className="mx-auto w-full max-w-[760px] px-4 py-6 lg:px-8">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-ceniza uppercase dark:text-muted-foreground">
                {business.name}
            </p>
            <h1 className="mt-2 font-display text-[30px] leading-none font-extrabold tracking-[-0.05em] text-ink lg:text-[38px] dark:text-foreground">
                Mis propinas
            </h1>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ceniza dark:text-muted-foreground">
                Estos datos son los que ve el cliente en tu botón de propina.
                Ocúltalos cuando quieras.
            </p>

            <div className="mt-6 space-y-2">
                {methods.map((method) => (
                    <div
                        key={method.id}
                        className="flex items-center gap-3 rounded-[16px] border border-border bg-card p-4"
                    >
                        <span className="grid size-10 place-items-center rounded-full bg-gold-soft text-gold-deep">
                            <Wallet className="size-4" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-ink dark:text-foreground">
                                {method.type_label}
                            </p>
                            <p className="text-[12px] text-ceniza tnum dark:text-muted-foreground">
                                {method.account_value}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                router.post(
                                    `/panel/propinas/${method.id}/visibilidad`,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            className={
                                method.is_visible
                                    ? 'inline-flex h-9 items-center gap-1.5 rounded-full bg-green-soft px-3 text-[11px] font-semibold text-green-deep'
                                    : 'inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-medium text-ceniza'
                            }
                        >
                            {method.is_visible ? (
                                <Eye className="size-3.5" />
                            ) : (
                                <EyeOff className="size-3.5" />
                            )}
                            {method.is_visible ? 'Visible' : 'Oculto'}
                        </button>
                    </div>
                ))}

                {methods.length === 0 && (
                    <p className="rounded-[16px] border border-dashed border-border p-6 text-center text-[13px] text-ceniza">
                        Aún no tienes métodos de propina configurados.
                    </p>
                )}
            </div>
        </div>
    );
}
