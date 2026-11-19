import { siteConfig } from '../../SiteConfig';
import type { ThemeId } from '../types';
import { themeBg, themeColor, isTheme } from '../theme/palettes';

const STORAGE_KEY = 'aitai-theme';
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let timers: number[] = [];
let switching = false;
let docBound = false;
let pressTimer = 0;

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === 'dawn' ? 'light' : 'dark';
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = themeColor[theme];
}

function updateOrb(theme: ThemeId) {
  document.querySelectorAll<HTMLElement>('[data-theme-option]').forEach((el) => {
    el.setAttribute('aria-pressed', String(el.dataset.themeOption === theme));
  });
}

function closeOrb() {
  const orb = document.querySelector<HTMLElement>('[data-theme-orb]');
  if (!orb) return;
  orb.dataset.open = 'false';
  orb.querySelector<HTMLElement>('[data-theme-trigger]')?.setAttribute('aria-expanded', 'false');
}

function openOrb() {
  const orb = document.querySelector<HTMLElement>('[data-theme-orb]');
  if (!orb) return;
  orb.dataset.open = 'true';
  orb.querySelector<HTMLElement>('[data-theme-trigger]')?.setAttribute('aria-expanded', 'true');
}

function cycleLanguage() {
  const order = ['zh', 'en', 'ja'];
  const current = document.documentElement.lang || 'zh';
  const next = order[(order.indexOf(current) + 1) % order.length];
  const link = document.querySelector<HTMLAnchorElement>('[data-lang-link="' + next + '"]');
  if (!link) return;
  closeOrb();
  link.click();
}

export function getTheme(): ThemeId {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : siteConfig.theme.default;
}

export function switchTheme(next: ThemeId, origin?: HTMLElement) {
  const current = getTheme();
  if (next === current || switching) return;
  closeOrb();

  if (REDUCED) {
    applyTheme(next);
    updateOrb(next);
    window.dispatchEvent(new CustomEvent('aitai:theme', { detail: { theme: next } }));
    return;
  }

  const overlay = document.querySelector<HTMLElement>('[data-theme-transition]');
  const root = document.documentElement;
  switching = true;

  if (overlay) {
    const rect = (origin || document.querySelector<HTMLElement>('[data-theme-trigger]'))?.getBoundingClientRect();
    const tx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const ty = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    overlay.style.setProperty('--tx', tx + 'px');
    overlay.style.setProperty('--ty', ty + 'px');
    overlay.style.setProperty('--to-bg', themeBg[next]);
    overlay.classList.remove('is-fading');
    overlay.classList.add('is-active');
  }
  root.classList.add('is-switching');

  timers.push(window.setTimeout(() => {
    applyTheme(next);
    updateOrb(next);
    window.dispatchEvent(new CustomEvent('aitai:theme', { detail: { theme: next } }));
  }, 340));

  timers.push(window.setTimeout(() => {
    overlay?.classList.add('is-fading');
    root.classList.remove('is-switching');
  }, 760));

  timers.push(window.setTimeout(() => {
    overlay?.classList.remove('is-active', 'is-fading');
    switching = false;
  }, 1240));
}

export function initTheme() {
  const orb = document.querySelector<HTMLElement>('[data-theme-orb]');
  const theme = getTheme();
  updateOrb(theme);
  applyTheme(theme);

  if (!orb) return;

  const trigger = orb.querySelector<HTMLElement>('[data-theme-trigger]');
  const options = orb.querySelectorAll<HTMLElement>('[data-theme-option]');

  if (!orb.dataset.bound) {
    orb.dataset.bound = 'true';
    let longPressed = false;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      longPressed = false;
      window.clearTimeout(pressTimer);
      pressTimer = window.setTimeout(() => {
        longPressed = true;
        openOrb();
      }, 460);
    };
    const onUp = () => {
      window.clearTimeout(pressTimer);
    };

    trigger?.addEventListener('pointerdown', onDown);
    trigger?.addEventListener('pointerup', onUp);
    trigger?.addEventListener('pointercancel', onUp);
    trigger?.addEventListener('pointerleave', onUp);
    trigger?.addEventListener('contextmenu', (event) => event.preventDefault());
    trigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      if (longPressed) {
        longPressed = false;
        return;
      }
      if (orb.dataset.open === 'true') {
        closeOrb();
        return;
      }
      cycleLanguage();
    });
    trigger?.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        openOrb();
      }
    });

    options.forEach((el) => {
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        const next = el.dataset.themeOption;
        if (isTheme(next)) switchTheme(next, el);
      });
    });
  }

  if (!docBound) {
    docBound = true;
    document.addEventListener('click', (event) => {
      const currentOrb = document.querySelector<HTMLElement>('[data-theme-orb]');
      if (!currentOrb || currentOrb.dataset.open !== 'true') return;
      if (!currentOrb.contains(event.target as Node)) closeOrb();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeOrb();
    });
    document.addEventListener('astro:before-swap', (event) => {
      window.clearTimeout(pressTimer);
      const nextDocument = (event as unknown as { newDocument?: Document }).newDocument;
      if (!nextDocument?.documentElement) return;
      const theme = getTheme();
      nextDocument.documentElement.dataset.theme = theme;
      nextDocument.documentElement.style.colorScheme = theme === 'dawn' ? 'light' : 'dark';
    });
  }
}
