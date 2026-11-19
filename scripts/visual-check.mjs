import { chromium } from 'playwright-core';

const edge = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
const browser = await chromium.launch({ executablePath: edge, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });

await page.goto('http://127.0.0.1:4321/aitai/zh/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2500);

const info = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return { missing: true };
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
      color: cs.color, background: cs.backgroundColor, position: cs.position,
      transform: cs.transform, zIndex: cs.zIndex, overflow: cs.overflow,
    };
  };
  return {
    theme: document.documentElement.dataset.theme,
    docked: document.documentElement.dataset.docked,
    scrollY: window.scrollY,
    heroInner: pick('.hero-inner'),
    identity: pick('.identity-card'),
    avatarFixed: pick('.avatar-dock'),
    header: pick('.site-header'),
    heroAvatar: pick('.hero-avatar'),
    bodyScrollHeight: document.body.scrollHeight,
    cardHtml: document.querySelector('.identity-card')?.textContent?.slice(0, 80),
  };
});
console.log(JSON.stringify(info, null, 2));
console.log('ERRORS:', errors.slice(0, 10));

await page.screenshot({ path: '/tmp/aitai-hero2.png' });

for (const [name, y] of [['drift', 900], ['realms', 1900], ['thoughts', 2800], ['harbor', 3900]]) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/aitai-' + name + '.png' });
  const state = await page.evaluate(() => ({
    y: Math.round(window.scrollY),
    docked: document.documentElement.dataset.docked,
    glass: getComputedStyle(document.documentElement).getPropertyValue('--glass'),
    nav: getComputedStyle(document.documentElement).getPropertyValue('--nav-opacity'),
    avatar: (() => { const r = document.querySelector('.avatar-dock')?.getBoundingClientRect(); return r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height).toString(), transform: getComputedStyle(document.querySelector('.avatar-dock')).transform } : null; })(),
  }));
  console.log(name, JSON.stringify(state));
}

await browser.close();
