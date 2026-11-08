import { chromium } from '@playwright/test';
const browser = await chromium.launch();
for (const w of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://127.0.0.1:8000/negocios/casa-barberia/reservar', { waitUntil: 'networkidle' });
  const offenders = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    return [...document.querySelectorAll('*')].map((el) => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, cls: (el.className || '').toString().slice(0, 90), right: Math.round(r.right), width: Math.round(r.width) };
    }).filter((x) => x.right > vw + 1).slice(0, 12);
  });
  console.log('width', w, JSON.stringify(offenders, null, 1));
  await page.close();
}
await browser.close();
