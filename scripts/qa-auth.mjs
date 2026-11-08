import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = 'http://127.0.0.1:8000';
const out = 'storage/app/qa';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

page.on('pageerror', (error) => console.log('PAGEERROR:', error.message));
page.on('console', (message) => {
    if (message.type() === 'error') {
        console.log('CONSOLE:', message.text());
    }
});

// 1. Log in with a demo owner account.
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('#email', 'dueno.casa-barberia@turnoya.demo');
await page.fill('#password', 'password');
await page.click('[data-test="login-button"]');
await page.waitForURL(/dashboard|mis-reservas/, { timeout: 20000 });
console.log('login ->', page.url());

await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${out}/account-desktop.png`, fullPage: true });

// 2. Book an appointment through the UI.
await page.goto(`${base}/negocios/casa-barberia/reservar`, { waitUntil: 'networkidle' });
await page.locator('input[name="service"]').first().check();

// Nearest Monday (business is closed on Sunday).
await page.getByRole('button', { name: /lun/i }).first().click();
await page.waitForSelector('button.tnum', { timeout: 15000 });

const slots = await page.locator('button.tnum').count();
console.log('slots offered:', slots);

if (slots > 0) {
    await page.locator('button.tnum').first().click();
    await page.getByRole('button', { name: /confirmar reserva/i }).click();
    await page.waitForURL(/reservas\/TY-/, { timeout: 20000 });
    console.log('booking ->', page.url());
    await page.screenshot({ path: `${out}/appointment-desktop.png`, fullPage: true });

    await page.goto(`${base}/mis-reservas`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${out}/appointments-desktop.png`, fullPage: true });
}

await browser.close();
