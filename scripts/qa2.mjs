import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
for (const [name, url] of [['explore','/'],['map','/mapa'],['local','/negocios/barberia-el-faro']]) {
  await page.goto('http://127.0.0.1:8000' + url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `storage/app/qa2-${name}.png`, fullPage: false });
  console.log(name, 'ok');
}
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
