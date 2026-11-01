import { Head } from '@inertiajs/react';

const sections = [
    {
        title: '1. Responsable del tratamiento',
        body: 'TurnoYa S.A.S. (en constitución), con domicilio en Popayán, Cauca, Colombia. Canal de atención: hola@turnoya.co.',
    },
    {
        title: '2. Datos que tratamos',
        body: 'Datos de identificación y contacto (nombre, correo, teléfono), datos de la reserva (servicio, profesional, fecha), historial de citas y, cuando el negocio los solicite, notas que el cliente decida compartir. No almacenamos números de tarjeta ni credenciales bancarias.',
    },
    {
        title: '3. Finalidad',
        body: 'Gestionar reservas, enviar recordatorios, permitir la comunicación entre cliente y establecimiento, procesar pagos a través de Wompi y mejorar el servicio. Los datos no se venden ni se comparten con terceros distintos de los proveedores necesarios para operar.',
    },
    {
        title: '4. Derechos del titular',
        body: 'Conforme a la Ley 1581 de 2012, puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, así como revocar la autorización, escribiendo a hola@turnoya.co. Responderemos en los plazos legales.',
    },
    {
        title: '5. Conservación',
        body: 'Los registros de reservas y pagos se conservan por el tiempo requerido para obligaciones contables y legales. Los datos de perfil se eliminan o anonimizan cuando la cuenta se cierra.',
    },
    {
        title: '6. Seguridad',
        body: 'Aplicamos control de acceso por roles, cifrado en tránsito, validación de datos y registro de operaciones sensibles. Ningún sistema es infalible: si detectamos un incidente, notificaremos a los titulares afectados.',
    },
];

export default function LegalShow({
    title,
    intro,
}: {
    document: string;
    title: string;
    intro: string;
}) {
    return (
        <>
            <Head title={`${title} · TurnoYa`} />

            <div className="mx-auto w-full max-w-[760px] px-5 py-12 lg:px-8 lg:py-16">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-ceniza uppercase dark:text-muted-foreground">
                    Legal
                </p>
                <h1 className="mt-3 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.05em] text-ink lg:text-[44px] dark:text-foreground">
                    {title}
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-ceniza dark:text-muted-foreground">
                    {intro}
                </p>

                <div className="mt-6 rounded-[16px] border border-gold/30 bg-gold-soft/30 p-4">
                    <p className="text-[12px] leading-relaxed text-ink dark:text-foreground">
                        <strong className="font-semibold">
                            Borrador para revisión legal.
                        </strong>{' '}
                        Este texto describe la operación prevista de TurnoYa y
                        debe ser revisado por un abogado antes de la apertura
                        comercial. No constituye asesoría jurídica.
                    </p>
                </div>

                <div className="mt-8 space-y-7">
                    {sections.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-[15px] font-semibold text-ink dark:text-foreground">
                                {section.title}
                            </h2>
                            <p className="mt-1.5 text-[14px] leading-relaxed text-ceniza dark:text-muted-foreground">
                                {section.body}
                            </p>
                        </section>
                    ))}
                </div>

                <p className="mt-10 text-[12px] text-ceniza dark:text-muted-foreground">
                    Última actualización: noviembre de 2026.
                </p>
            </div>
        </>
    );
}
