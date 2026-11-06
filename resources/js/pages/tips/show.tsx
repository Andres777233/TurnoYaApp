import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { DemoBadge } from '@/components/site/demo-badge';
import { money } from '@/lib/format';

type Method = {
    id: number;
    type: string;
    type_label: string;
    account_value: string;
    account_holder: string | null;
    qr: string | null;
    link: string | null;
    instructions: string | null;
};

export default function Tips({
    professional,
    business,
    methods,
}: {
    professional: {
        name: string;
        headline: string | null;
        avatar: string | null;
        is_demo: boolean;
    };
    business: { name: string; slug: string };
    methods: Method[];
}) {
    const [amount, setAmount] = useState<number>(5000);
    const [methodId, setMethodId] = useState<number | null>(methods[0]?.id ?? null);
    const [copied, setCopied] = useState(false);

    const method = methods.find((m) => m.id === methodId) ?? null;

    const copy = async () => {
        if (!method) {
            return;
        }

        await navigator.clipboard.writeText(method.account_value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <>
            <Head title={`Propina a ${professional.name} · TurnoYa`} />

            <div className="mx-auto w-full max-w-[560px] px-4 py-6 lg:py-10">
                <Link
                    href={`/negocios/${business.slug}`}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ceniza hover:text-ink dark:text-muted-foreground"
                >
                    <ArrowLeft className="size-3.5" strokeWidth={1.8} />
                    Volver a {business.name}
                </Link>

                <div className="mt-5 flex items-center gap-3">
                    {professional.avatar ? (
                        <img
                            src={professional.avatar}
                            alt=""
                            className="size-14 rounded-full object-cover"
                        />
                    ) : (
                        <span className="grid size-14 place-items-center rounded-full bg-ink font-display text-[15px] font-bold text-cal">
                            {professional.name
                                .split(' ')
                                .slice(0, 2)
                                .map((p) => p[0])
                                .join('')}
                        </span>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-display text-[22px] font-bold tracking-[-0.035em] text-ink dark:text-foreground">
                                Propina para {professional.name.split(' ')[0]}
                            </h1>
                            {professional.is_demo && <DemoBadge />}
                        </div>
                        <p className="text-[12px] text-ceniza dark:text-muted-foreground">
                            {professional.headline}
                        </p>
                    </div>
                </div>

                <div className="mt-6 rounded-[20px] border border-border bg-card p-5">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                        ¿Cuánto quieres dar?
                    </p>

                    <div className="mt-3 grid grid-cols-4 gap-2">
                        {[2000, 5000, 10000, 20000].map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setAmount(value)}
                                aria-pressed={amount === value}
                                className={
                                    amount === value
                                        ? 'h-12 rounded-[14px] bg-gold text-[13px] font-semibold text-ink tnum'
                                        : 'h-12 rounded-[14px] border border-border text-[13px] font-medium text-ink tnum dark:text-foreground'
                                }
                            >
                                {money(value)}
                            </button>
                        ))}
                    </div>

                    <div className="mt-2">
                        <label
                            htmlFor="custom-amount"
                            className="text-[11px] text-ceniza dark:text-muted-foreground"
                        >
                            Otro valor en pesos
                        </label>
                        <input
                            id="custom-amount"
                            type="number"
                            min={1000}
                            step={1000}
                            value={amount}
                            onChange={(event) => setAmount(Number(event.target.value))}
                            className="mt-1 h-11 w-full rounded-[14px] border border-border bg-cal px-3 text-[14px] font-semibold text-ink tnum dark:text-foreground"
                        />
                    </div>

                    <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-ceniza uppercase dark:text-muted-foreground">
                        ¿Por dónde?
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {methods.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setMethodId(item.id)}
                                aria-pressed={methodId === item.id}
                                className={
                                    methodId === item.id
                                        ? 'rounded-[14px] border-2 border-gold bg-gold-soft/40 px-3 py-2.5 text-left text-[12.5px] font-semibold text-ink'
                                        : 'rounded-[14px] border border-border px-3 py-2.5 text-left text-[12.5px] font-medium text-ink dark:text-foreground'
                                }
                            >
                                {item.type_label}
                            </button>
                        ))}
                    </div>

                    {method && (
                        <div className="mt-4 rounded-[16px] border border-border bg-cal p-4 dark:bg-background">
                            <p className="text-[11px] text-ceniza dark:text-muted-foreground">
                                {method.account_holder}
                            </p>
                            <p className="mt-1 font-display text-[20px] font-bold tracking-[-0.02em] text-ink tnum dark:text-foreground">
                                {method.account_value}
                            </p>

                            {method.qr && (
                                <img
                                    src={method.qr}
                                    alt="Código QR del profesional"
                                    className="mt-3 size-40 rounded-[12px] border border-border bg-white p-2"
                                />
                            )}

                            {method.link && (
                                <a
                                    href={method.link}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="mt-3 inline-flex h-10 items-center rounded-full bg-ink px-4 text-[12px] font-semibold text-cal"
                                >
                                    Abrir link de pago
                                </a>
                            )}

                            <button
                                type="button"
                                onClick={copy}
                                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gold text-[13px] font-semibold text-ink"
                            >
                                {copied ? (
                                    <Check className="size-4" strokeWidth={2} />
                                ) : (
                                    <Copy className="size-4" strokeWidth={1.9} />
                                )}
                                {copied ? 'Copiado' : 'Copiar número'}
                            </button>

                            {method.instructions && (
                                <p className="mt-2 text-[10.5px] leading-relaxed text-ceniza">
                                    {method.instructions}
                                </p>
                            )}
                        </div>
                    )}

                    <p className="mt-4 text-[11px] leading-relaxed text-ceniza dark:text-muted-foreground">
                        La propina va directo al profesional por su cuenta. TurnoYa
                        no procesa ni retiene ese dinero.
                    </p>
                </div>
            </div>
        </>
    );
}
