const copFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

/** Prices arrive from the API in cents and are always displayed in COP. */
export function money(cents: number | null | undefined): string {
    if (cents === null || cents === undefined) {
        return '—';
    }

    if (cents === 0) {
        return 'Gratis';
    }

    return copFormatter.format(cents / 100).replace(/\u00a0/g, ' ') + ' COP';
}

export function number(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '—';
    }

    return new Intl.NumberFormat('es-CO').format(value);
}

export function duration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function rating(value: number): string {
    return decimalFormatter.format(value);
}
