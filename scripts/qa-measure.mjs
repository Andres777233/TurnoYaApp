import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
const m = await page.evaluate(() => {
  const form = document.querySelector('form[role="search"]');
  const wrap = form?.parentElement;
  const r = form.getBoundingClientRect();
  const w = wrap.getBoundingClientRect();
  return { form: { left: r.left, width: r.width }, wrap: { left: w.left, width: w.width }, vw: innerWidth };
});
console.log(JSON.stringify(m));
await browser.close();
