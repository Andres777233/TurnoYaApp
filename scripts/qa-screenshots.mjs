import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.env.QA_BASE ?? 'http://127.0.0.1:8000';
const out = 'storage/app/qa';
mkdirSync(out, { recursive: true });

const pages = [
    ['home', '/'],
    ['discover', '/descubrir'],
    ['business', '/negocios/casa-barberia'],
    ['professional', '/profesionales/casa-barberia-camilo-rivas'],
    ['booking', '/negocios/casa-barberia/reservar'],
    ['login', '/login'],
];

const browser = await chromium.launch();

for (const [name, path] of pages) {
    for (const [label, width, height] of [
        ['desktop', 1440, 900],
        ['mobile', 390, 844],
    ]) {
        const page = await browser.newPage({
            viewport: { width, height },
            deviceScaleFactor: 1,
        });
        const errors = [];
        page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
        page.on('console', (message) => {
            if (message.type() === 'error') {
                errors.push(`console: ${message.text()}`);
            }
        });

        const response = await page.goto(base + path, {
            waitUntil: 'networkidle',
            timeout: 30_000,
        });

        await page.waitForTimeout(400);

        // Trigger scroll-reveals before capturing a full-page screenshot.
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let total = 0;
                const timer = setInterval(() => {
                    window.scrollBy(0, 500);
                    total += 500;

                    if (total >= document.body.scrollHeight) {
                        clearInterval(timer);
                        window.scrollTo(0, 0);
                        resolve();
                    }
                }, 260);
            });
        });

        await page.waitForTimeout(700);

        const overflow = await page.evaluate(
            () =>
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth,
        );

        await page.screenshot({
            path: `${out}/${name}-${label}.png`,
            fullPage: label === 'desktop',
        });

        console.log(
            `${name.padEnd(13)} ${label.padEnd(8)} ${response?.status()} ${overflow ? 'OVERFLOW ' : ''}${errors.length ? 'ERRORS: ' + errors.join(' | ') : 'ok'}`,
        );

        await page.close();
    }
}

await browser.close();
