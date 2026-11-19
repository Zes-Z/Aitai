import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

process.env.ASTRO_TELEMETRY_DISABLED = '1';
process.env.ASTRO_DISABLE_UPDATE_CHECK = '1';
const { dev } = await import('astro');
const server = await dev({ root: process.cwd(), logLevel: 'error', server: { host: '127.0.0.1', port: 4324 } });
let browser;
const errors = [];
const order = ['dawn', 'sea', 'star'];
const nextTheme = (theme) => order[(order.indexOf(theme) + 1) % order.length];
const origin = 'http://127.0.0.1:' + server.address.port;
const screenshots = process.env.ORB_SCREENSHOT_DIR || '/tmp/aitai-theme-orb';
const themeOf = (page) => page.locator('html').getAttribute('data-theme');
const triggerOf = (page) => page.locator('[data-theme-trigger]');
const ready = async (page) => {
  await page.waitForFunction(() => document.querySelector('[data-theme-trigger]')?.dataset.bound === 'true');
  await page.waitForFunction(() => !document.documentElement.matches('.is-switching, .is-transitioning'));
  await page.waitForFunction(() => !document.querySelector('[data-theme-transition]')?.classList.contains('is-active'));
};
const expectTheme = (page, theme) => page.waitForFunction((value) => document.documentElement.dataset.theme === value, theme);
const checkErrors = (page) => page.on('pageerror', (error) => errors.push(error.message));

try {
  browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE_PATH || '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    headless: true,
  });
  if (!process.argv.includes('--visual-only')) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
    checkErrors(page);
    await page.goto(origin + '/Aitai/zh/', { waitUntil: 'domcontentloaded' });
    await ready(page);
    assert.equal(await themeOf(page), 'dawn', 'New visitors start in Morning Calm');
    assert.equal(await page.locator('.orb-menu, .orb-lang, .orb-lang-jump, [data-theme-option]').count(), 0);
    assert.equal(await triggerOf(page).getAttribute('title'), null);
    await page.evaluate(() => {
      window.__orbChanges = 0;
      window.addEventListener('aitai:theme', () => { window.__orbChanges++; });
    });

    // A long mouse hold commits once, and releasing it must never change language.
    for (let i = 0; i < 3; i++) {
      const before = await themeOf(page);
      const changes = await page.evaluate(() => window.__orbChanges);
      const rect = await triggerOf(page).boundingBox();
      await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
      await page.mouse.down();
      await expectTheme(page, nextTheme(before));
      await page.waitForTimeout(950);
      assert.equal(await page.evaluate(() => window.__orbChanges), changes + 1);
      await page.mouse.up();
      await ready(page);
      assert.equal(new URL(page.url()).pathname, '/Aitai/zh/');
    }
    console.log('PASS: long holds cycle all 3 themes exactly once without changing language.');

    // A second press begun during the transition must not become a language click.
    const beforeBusy = await themeOf(page);
    const busyRect = await triggerOf(page).boundingBox();
    await page.mouse.move(busyRect.x + busyRect.width / 2, busyRect.y + busyRect.height / 2);
    await page.mouse.down();
    await expectTheme(page, nextTheme(beforeBusy));
    await page.mouse.up();
    await page.mouse.down();
    await page.waitForTimeout(900);
    await page.mouse.up();
    await ready(page);
    assert.equal(await themeOf(page), nextTheme(beforeBusy));
    assert.equal(new URL(page.url()).pathname, '/Aitai/zh/');
    console.log('PASS: presses during a theme transition cannot accidentally change language.');

    // Moving away cancels a hold and the subsequent click.
    const cancelledTheme = await themeOf(page);
    const rect = await triggerOf(page).boundingBox();
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.move(rect.x - 30, rect.y + 20);
    await page.waitForTimeout(550);
    await page.mouse.up();
    assert.equal(await themeOf(page), cancelledTheme);
    assert.equal(new URL(page.url()).pathname, '/Aitai/zh/');
    console.log('PASS: dragging away cancels the gesture.');

    // Keep the detail route and Ink transition when cycling languages.
    await page.goto(origin + '/Aitai/zh/projects/aitai/', { waitUntil: 'domcontentloaded' });
    await ready(page);
    const savedTheme = await themeOf(page);
    await triggerOf(page).click();
    await page.waitForURL('**/Aitai/en/projects/aitai/');
    await ready(page);
    assert.equal(await themeOf(page), savedTheme);
    assert.match(await triggerOf(page).getAttribute('aria-label'), /Hold/);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await ready(page);
    assert.equal(await themeOf(page), savedTheme);

    // Keyboard users can select themes directly without opening a popup.
    await triggerOf(page).focus();
    await page.keyboard.press('Space');
    await expectTheme(page, nextTheme(savedTheme));
    await ready(page);
    await page.keyboard.press('ArrowDown');
    await expectTheme(page, nextTheme(nextTheme(savedTheme)));
    await ready(page);
    await page.keyboard.press('Enter');
    await page.waitForURL('**/Aitai/ja/projects/aitai/');
    await ready(page);
    console.log('PASS: language switching preserves route and theme; reload, Space, Arrow Down and Enter work.');

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobile = await mobileContext.newPage();
    checkErrors(mobile);
    await mobile.goto(origin + '/Aitai/zh/', { waitUntil: 'domcontentloaded' });
    await ready(mobile);
    const touch = await mobileContext.newCDPSession(mobile);
    const box = await triggerOf(mobile).boundingBox();
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const mobileTheme = await themeOf(mobile);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    await expectTheme(mobile, nextTheme(mobileTheme));
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await ready(mobile);
    assert.equal(new URL(mobile.url()).pathname, '/Aitai/zh/');
    const afterHold = await themeOf(mobile);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    await mobile.waitForTimeout(120);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await mobile.waitForTimeout(600);
    assert.equal(await themeOf(mobile), afterHold);
    await mobile.touchscreen.tap(point.x, point.y);
    await mobile.waitForURL('**/Aitai/en/');
    await ready(mobile);
    assert.equal(await themeOf(mobile), afterHold);
    console.log('PASS: real mobile touch hold, touch cancellation and short tap.');
    await mobileContext.close();

    const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
    const reduced = await reducedContext.newPage();
    checkErrors(reduced);
    await reduced.goto(origin + '/Aitai/zh/', { waitUntil: 'domcontentloaded' });
    await ready(reduced);
    const reducedTheme = await themeOf(reduced);
    await triggerOf(reduced).focus();
    await reduced.keyboard.press('Space');
    await expectTheme(reduced, nextTheme(reducedTheme));
    assert.equal(await reduced.locator('html').evaluate((el) => el.classList.contains('is-switching')), false);
    assert.equal(await triggerOf(reduced).evaluate((el) => el.getAnimations({ subtree: true }).length), 0);
    await reducedContext.close();
    console.log('PASS: reduced motion switches immediately with static artwork.');

    const tideStates = await page.evaluate(async () => {
      document.documentElement.dataset.theme = 'sea';
      await new Promise(requestAnimationFrame);
      const scene = document.querySelector('.orb-scene--sea');
      const animations = scene.getAnimations({ subtree: true });
      const states = [];
      for (const time of [0, 5000, 10000]) {
        for (const animation of animations) {
          animation.pause();
          animation.currentTime = time;
        }
        await new Promise(requestAnimationFrame);
        const moon = scene.querySelector('.orb-moon');
        const moonRect = moon.getBoundingClientRect();
        const surface = scene.querySelector('.orb-wave-front path').getBoundingClientRect().top;
        states.push({ top: moonRect.top, bottom: moonRect.bottom, surface, opacity: Number(getComputedStyle(moon).opacity) });
      }
      return states;
    });
    assert.ok(tideStates[0].surface > tideStates[0].bottom, 'Low tide reveals the whole moon');
    assert.ok(tideStates[1].surface < tideStates[1].top, 'High tide fully swallows the moon');
    assert.ok(tideStates[1].opacity < tideStates[0].opacity / 2, 'Moonlight dims under rising water');
    assert.ok(tideStates[2].surface > tideStates[2].bottom && tideStates[2].opacity > .9, 'Receding tide restores moonlight');
    console.log('PASS: tide covers and reveals the whole moon, with matching brightness changes.');
  }

  // Export a comparison from the actual SVG and CSS, at 4x for visual review.
  await mkdir(screenshots, { recursive: true });
  const art = await readFile(new URL('../src/components/OrbArt.astro', import.meta.url), 'utf8');
  const css = (await readFile(new URL('../src/styles/theme-orb.css', import.meta.url), 'utf8'))
    .replaceAll(":root[data-theme=", "[data-preview-theme=");
  const preview = await browser.newPage({ viewport: { width: 960, height: 370 }, deviceScaleFactor: 2 });
  await preview.setContent(
    '<style>' + css + '</style><style>' +
    '*{box-sizing:border-box}body{margin:0;display:flex;font-family:system-ui,sans-serif;background:#10121a}' +
    'section{width:320px;height:370px;position:relative;padding:36px;color:#dff0ef}' +
    'section[data-preview-theme=dawn]{background:#f7f0e8;color:#574337}' +
    'section[data-preview-theme=sea]{background:#031018}section[data-preview-theme=star]{background:#05060f}' +
    'h2{font-size:16px;font-weight:500;margin:0}p{font-size:11px;opacity:.55;letter-spacing:.08em}' +
    '.theme-orb{position:absolute;top:145px;right:137px;transform:scale(4);transform-origin:top center}' +
    '.orb-button{border-color:#ffffff30;--corner-size:46px;--border-strong:#ffffff30;--glow:#f2c879;--bg:#090d17}' +
    '.orb-hold{display:none}.orb-scene *,.orb-sun{animation-play-state:paused!important}' +
    '</style>' +
    [['dawn', '朝凪', 'SUN / ORIGINAL ORBIT'], ['sea', '海月', 'MOON / RISING TIDE'], ['star', '星空', 'BLACK HOLE / ACCRETION']].map(([theme, name, note]) => (
      '<section data-preview-theme="' + theme + '"><h2>' + name + '</h2><p>' + note +
      '</p><div class="theme-orb"><div class="orb-button">' + art + '</div></div></section>'
    ).replaceAll('id="orb-', 'id="' + theme + '-orb-')
      .replaceAll('url(#orb-', 'url(#' + theme + '-orb-')
    ).join('')
  );
  await preview.evaluate(() => {
    document.querySelectorAll('.orb-scene--sea').forEach((scene) => {
      for (const animation of scene.getAnimations({ subtree: true })) animation.currentTime = 2900;
    });
  });
  await preview.screenshot({ path: screenshots + '/themes.png' });
  console.log('Visual comparison: ' + screenshots + '/themes.png');
  await preview.close();
  assert.deepEqual(errors, [], 'No browser runtime errors');
} finally {
  await browser?.close();
  await server.stop();
}
