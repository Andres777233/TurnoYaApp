import { motion, useReducedMotion } from 'motion/react';

/**
 * Scroll reveal. Honours the OS reduced-motion setting and only animates
 * transform/opacity, so it stays cheap on low-end phones.
 */
export function Reveal({
    children,
    delay = 0,
    className,
    as = 'div',
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    as?: 'div' | 'section' | 'li';
}) {
    const reduce = useReducedMotion();
    const Component = motion[as];

    return (
        <Component
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: 0.65,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={className}
        >
            {children}
        </Component>
    );
}
