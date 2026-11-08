import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
const before = await page.evaluate(() => {
  const h2 = [...document.querySelectorAll('h2')].find((n) => n.textContent.includes('Abiertos'));
  if (!h2) return { found: false };
  const r = h2.getBoundingClientRect();
  return { found: true, top: r.top, opacity: getComputedStyle(h2).opacity, parentOpacity: getComputedStyle(h2.parentElement).opacity, html: h2.parentElement.parentElement.className };
});
console.log('before', JSON.stringify(before));
await page.evaluate(() => window.scrollTo(0, 1200));
await page.waitForTimeout(1200);
const after = await page.evaluate(() => {
  const h2 = [...document.querySelectorAll('h2')].find((n) => n.textContent.includes('Abiertos'));
  if (!h2) return { found: false };
  return { opacity: getComputedStyle(h2).opacity, parentOpacity: getComputedStyle(h2.parentElement).opacity, top: h2.getBoundingClientRect().top };
});
console.log('after', JSON.stringify(after));
await browser.close();
