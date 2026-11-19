import assert from 'node:assert/strict';
import { mkdir, readdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

process.env.ASTRO_TELEMETRY_DISABLED = '1';
process.env.ASTRO_DISABLE_UPDATE_CHECK = '1';
const { dev } = await import('astro');
const server = await dev({ root: process.cwd(), logLevel: 'error', server: { host: '127.0.0.1', port: 4325 } });
const origin = 'http://127.0.0.1:' + server.address.port;
const output = '/tmp/aitai-avatar-dock';
const errors = [];
let browser;
const avatar = (page) => page.locator('[data-avatar-fixed]');
const ready = (page) => page.waitForFunction(() => document.querySelector('[data-avatar-fixed]')?.dataset.bound === 'true');
const open = async (page) => {
  await avatar(page).click();
  await page.waitForFunction(() => document.querySelector('[data-avatar-dock]')?.dataset.open === 'true');
};
const scrollDown = async (page) => {
  await page.evaluate(() => {
    const lenis = /** @type {Window & { __lenis?: import('lenis').default }} */ (window).__lenis;
    if (lenis) lenis.scrollTo(700, { immediate: true });
    else window.scrollTo(0, 700);
  });
  await page.waitForFunction(() => window.scrollY > 300);
};

async function checkLayout(page, width, path) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(origin + path, { waitUntil: 'domcontentloaded' });
  await ready(page);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const metrics = await page.evaluate(() => {
    const rect = (selector) => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, width: r.width, height: r.height };
    };
    const left = rect('[data-avatar-dock]');
    const right = rect('[data-theme-orb]');
    const overflow = [];
    for (const element of document.querySelectorAll('.hero-inner, .section-inner, .detail-inner, .notfound > div')) {
      const r = element.getBoundingClientRect();
      if (r.left < left.right - 1 || r.right > right.left + 1 || element.scrollWidth > element.clientWidth + 2) {
        overflow.push({ class: element.className, section: element.closest('section')?.id, left: r.left, right: r.right, scrollWidth: element.scrollWidth, width: element.clientWidth, spills: Array.from(element.querySelectorAll('*')).filter((child) => child.scrollWidth > child.clientWidth + 2 && getComputedStyle(child).overflowX === 'visible').slice(0, 8).map((child) => ({ class: child.className, text: child.textContent.slice(0, 70), width: child.clientWidth, scroll: child.scrollWidth })) });
      }
    }
    return { left, right, width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow };
  });
  const label = width + ' ' + path;
  assert.ok(Math.abs(metrics.left.left - (width - metrics.right.right)) < .6, label + ': mirrored offsets');
  assert.ok(Math.abs(metrics.left.top - metrics.right.top) < .6, label + ': same top');
  assert.ok(Math.abs(metrics.left.top - metrics.left.left) < .6, label + ': equal top and side margins');
  assert.equal(metrics.left.width, 46, label + ': avatar size');
  assert.equal(metrics.right.width, 46, label + ': theme size');
  assert.ok(metrics.scrollWidth <= metrics.width + 1, label + ': no page overflow');
  assert.deepEqual(metrics.overflow, [], label + ': content remains between the inner edges');
}

try {
  browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE_PATH || '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
  });
  await mkdir(output, { recursive: true });
  if (!process.argv.includes('--layout-only')) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(origin + '/Aitai/zh/', { waitUntil: 'domcontentloaded' });
    await ready(page);
    assert.equal(await avatar(page).getAttribute('href'), null);
    assert.equal(await page.locator('[data-avatar-actions]').evaluate((el) => el.inert), true);
    await open(page);
    assert.equal(await page.locator('[data-avatar-action]').count(), 4);
    assert.equal(await page.locator('[data-avatar-actions] button:disabled').count(), 1);
    assert.equal(await page.locator('[data-avatar-action][aria-label=小红书]').count(), 1);
    assert.match(await page.locator('[data-avatar-action][aria-label=Email]').getAttribute('href'), /^mailto:/);
    assert.equal(await page.locator('[data-avatar-action][aria-label=CV]').getAttribute('href'), '/Aitai/kim cv.pdf');
    await page.waitForTimeout(750);
    const distribution = await page.locator('.avatar-action-slot').evaluateAll((slots) => {
      const avatar = document.querySelector('[data-avatar-fixed]').getBoundingClientRect();
      const cx = avatar.left + avatar.width / 2;
      const cy = avatar.top + avatar.height / 2;
      return slots.map((slot) => {
        const r = slot.getBoundingClientRect();
        const dx = r.left + r.width / 2 - cx;
        const dy = r.top + r.height / 2 - cy;
        return { angle: Math.atan2(dy, dx), radius: Math.hypot(dx, dy) };
      });
    });
    assert.ok(Math.abs(distribution[0].angle) < .01, 'Arc starts directly to the right');
    assert.ok(Math.abs(distribution.at(-1).angle - Math.PI / 2) < .01, 'Arc ends directly below');
    const step = Math.PI / 2 / (distribution.length - 1);
    for (let i = 1; i < distribution.length; i++) {
      assert.ok(Math.abs(distribution[i].angle - distribution[i - 1].angle - step) < .01, 'Even angular spacing');
      assert.ok(Math.abs(distribution[i].radius - distribution[0].radius) < .6, 'Shared orbital radius');
    }
    await page.screenshot({ path: output + '/desktop.png' });
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-avatar-action][aria-label=CV]').click(),
    ]);
    assert.equal(download.suggestedFilename(), 'kim cv.pdf');
    assert.equal(new URL(page.url()).pathname, '/Aitai/zh/');
    assert.equal(await avatar(page).getAttribute('aria-expanded'), 'false');
    console.log('PASS: shared social links, uniform 90-degree arc, configurable placeholder and CV download.');

    await scrollDown(page);
    const point = await avatar(page).boundingBox();
    await page.mouse.move(point.x + 23, point.y + 23);
    await page.mouse.down();
    await page.waitForFunction(() => window.scrollY < 3);
    await page.mouse.up();
    assert.equal(await avatar(page).getAttribute('aria-expanded'), 'false');
    assert.equal(new URL(page.url()).pathname, '/Aitai/zh/');

    await scrollDown(page);
    await page.mouse.down();
    await page.waitForTimeout(130);
    await page.mouse.move(point.x + 70, point.y + 23);
    await page.waitForTimeout(550);
    await page.mouse.up();
    assert.ok(await page.evaluate(() => scrollY) > 300);
    assert.equal(await avatar(page).getAttribute('aria-expanded'), 'false');
    await avatar(page).focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'GitHub');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Email');
    await page.keyboard.press('Escape');
    assert.equal(await avatar(page).getAttribute('aria-expanded'), 'false');
    assert.equal(await avatar(page).evaluate((el) => el === document.activeElement), true);
    await page.keyboard.press('Home');
    await page.waitForFunction(() => scrollY < 3);
    console.log('PASS: mouse hold returns to top, drag cancels, keyboard links and Escape.');

    await page.goto(origin + '/Aitai/zh/projects/aitai/', { waitUntil: 'domcontentloaded' });
    await ready(page);
    await scrollDown(page);
    await avatar(page).focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => scrollY < 3);
    assert.equal(new URL(page.url()).pathname, '/Aitai/zh/projects/aitai/');
    await open(page);
    await page.locator('[data-theme-trigger]').click();
    await page.waitForURL('**/Aitai/en/projects/aitai/');
    await ready(page);
    await page.waitForFunction(() => !document.documentElement.classList.contains('is-transitioning'));
    await open(page);
    await page.mouse.click(500, 180);
    assert.equal(await avatar(page).getAttribute('aria-expanded'), 'false');
    console.log('PASS: detail-page top preserves route; both controls work after client navigation.');

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobile = await mobileContext.newPage();
    mobile.on('pageerror', (error) => errors.push(error.message));
    await mobile.goto(origin + '/Aitai/zh/', { waitUntil: 'domcontentloaded' });
    await ready(mobile);
    const mobileRect = await avatar(mobile).boundingBox();
    const touchPoint = { x: mobileRect.x + mobileRect.width / 2, y: mobileRect.y + mobileRect.height / 2 };
    await mobile.touchscreen.tap(touchPoint.x, touchPoint.y);
    assert.equal(await avatar(mobile).getAttribute('aria-expanded'), 'true');
    await mobile.waitForTimeout(750);
    await mobile.screenshot({ path: output + '/mobile.png' });
    await mobile.touchscreen.tap(280, 220);
    await scrollDown(mobile);
    const touch = await mobileContext.newCDPSession(mobile);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touchPoint] });
    await mobile.waitForFunction(() => scrollY < 3);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.equal(await avatar(mobile).getAttribute('aria-expanded'), 'false');
    assert.equal(new URL(mobile.url()).pathname, '/Aitai/zh/');
    await mobileContext.close();
    console.log('PASS: real touch tap and hold do not conflict.');
  }

  const layoutContext = await browser.newContext({ reducedMotion: 'reduce' });
  const layoutPage = await layoutContext.newPage();
  layoutPage.on('pageerror', (error) => errors.push(error.message));
  const files = await readdir(new URL('../dist/', import.meta.url), { recursive: true });
  const routes = files.filter((file) => file.endsWith('/index.html')).map((file) => '/Aitai/' + file.slice(0, -10));
  routes.push('/Aitai/not-a-page/');
  let count = 0;
  for (const width of [1440, 390]) {
    for (const path of routes) {
      await checkLayout(layoutPage, width, path);
      count++;
    }
  }
  for (const width of [320, 768, 1024]) {
    for (const path of ['/Aitai/zh/', '/Aitai/en/', '/Aitai/ja/', '/Aitai/zh/projects/', '/Aitai/zh/album/', '/Aitai/zh/thoughts/night-bus/']) {
      await checkLayout(layoutPage, width, path);
      count++;
    }
  }
  await layoutContext.close();
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log('PASS: ' + count + ' page/viewport layouts, mirrored controls, bounded content and no horizontal overflow.');
  console.log('Screenshots: ' + output);
} finally {
  await browser?.close();
  await server.stop();
}
