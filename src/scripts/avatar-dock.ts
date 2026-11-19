import { siteConfig } from '../../SiteConfig';

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

let cleanup: (() => void) | null = null;

export function initAvatarDock() {
  cleanup?.();
  cleanup = null;

  const fixedEl = document.querySelector<HTMLAnchorElement>('[data-avatar-fixed]');
  if (!fixedEl) return;
  const fixed: HTMLAnchorElement = fixedEl;

  const hero = document.querySelector<HTMLElement>('[data-avatar-hero]');
  const headerSlot = document.querySelector<HTMLElement>('[data-avatar-header]');
  const header = document.querySelector<HTMLElement>('[data-header]');
  const root = document.documentElement;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isHome = document.body.dataset.page === 'home';
  const homeHref = fixed.dataset.home || '/';
  const labelAbout = fixed.dataset.labelAbout || 'About';
  const labelTop = fixed.dataset.labelTop || 'Back to top';

  let base = 120;
  let heroLeft = 0;
  let heroTop = 0;
  let targetX = 24;
  let targetY = 12;
  let targetSize = 40;
  let lastY = window.scrollY;
  let raf = 0;
  let docked = false;
  let sleepTimer = 0;

  const setVar = (name: string, value: string) => root.style.setProperty(name, value);

  function measure() {
    const heroRect = hero?.getBoundingClientRect();
    const slotRect = headerSlot?.getBoundingClientRect();
    if (heroRect) {
      base = Math.max(48, Math.round(heroRect.width));
      heroLeft = heroRect.left;
      heroTop = heroRect.top + window.scrollY;
    } else {
      base = slotRect?.width || 40;
      heroLeft = slotRect?.left || 24;
      heroTop = slotRect?.top || 12;
    }
    if (slotRect) {
      targetX = slotRect.left;
      targetY = slotRect.top;
      targetSize = slotRect.width || 40;
    } else {
      targetX = 24;
      targetY = 12;
      targetSize = 40;
    }
    fixed.style.width = base + 'px';
    fixed.style.height = base + 'px';
    if (reduce) fixed.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
  }

  function update() {
    const y = window.scrollY;
    const start = siteConfig.nav.avatarDock.start;
    const end = siteConfig.nav.avatarDock.end;
    const arc = siteConfig.nav.avatarDock.arc;

    let p = hero ? smooth(clamp((y - start) / (end - start))) : 1;
    if (reduce && hero) p = y >= end ? 1 : 0;

    const heroY = heroTop - y;
    const x = hero ? lerp(heroLeft, targetX, p) : targetX;
    const yy = hero ? lerp(heroY, targetY, p) - Math.sin(Math.PI * p) * arc : targetY;
    const scale = hero ? lerp(1, targetSize / base, p) : 1;

    fixed.style.transform = `translate3d(${x.toFixed(2)}px, ${yy.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    setVar('--glass', String(clamp((p - 0.08) / 0.45)));
    setVar('--nav-opacity', String(clamp((p - 0.45) / 0.4)));
    setVar('--wordmark-x', (p * 44).toFixed(1) + 'px');
    setVar('--ring-w', (2 / Math.max(scale, 0.1)).toFixed(2) + 'px');
    setVar('--ring-opacity', String(0.85 - p * 0.45));

    const wasDocked = docked;
    if (p >= 0.95) docked = true;
    else if (p <= 0.9) docked = false;
    if (wasDocked !== docked) root.dataset.docked = String(docked);

    if (docked) {
      fixed.href = isHome ? '#tide' : homeHref;
      fixed.setAttribute('aria-label', labelTop);
      fixed.dataset.state = 'docked';
    } else {
      fixed.href = '#drift';
      fixed.setAttribute('aria-label', labelAbout);
      fixed.dataset.state = 'hero';
    }

    if (header) {
      if (docked && y > lastY + 6 && y > 240) {
        header.dataset.sleep = 'true';
        window.clearTimeout(sleepTimer);
        sleepTimer = window.setTimeout(() => {
          if (docked && header.dataset.sleep === 'true') header.dataset.sleep = 'false';
        }, 600);
      } else if (y < lastY - 14 || !docked) {
        header.dataset.sleep = 'false';
        window.clearTimeout(sleepTimer);
      }
    }
    lastY = y;
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      update();
    });
  }

  function onResize() {
    measure();
    update();
  }

  measure();
  update();
  root.classList.add('avatar-ready');
  fixed.classList.add('is-ready');
  if (!isHome && !hero) {
    root.dataset.docked = 'true';
    docked = true;
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  document.fonts?.ready.then(onResize);

  cleanup = () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', onResize);
    window.clearTimeout(sleepTimer);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
}
