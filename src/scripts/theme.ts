import { navigate } from 'astro:transitions/client';
import { siteConfig } from '../../SiteConfig';
import type { ThemeId } from '../types';
import { themeBg, themeColor, isTheme } from '../theme/palettes';

const STORAGE_KEY = 'aitai-theme';
const HOLD_MS = 460;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let timers: number[] = [];
let switching = false;
let navigating = false;
let docBound = false;
let pendingTheme: ThemeId | null = null;
let cancelPress: (() => void) | undefined;

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === 'dawn' ? 'light' : 'dark';
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = themeColor[theme];
}

function updateOrb(theme: ThemeId, announce = false) {
  const orb = document.querySelector<HTMLElement>('[data-theme-orb]');
  const trigger = orb?.querySelector<HTMLButtonElement>('[data-theme-trigger]');
  if (!trigger) return;
  const name = trigger.getAttribute('data-theme-name-' + theme) || theme;
  trigger.setAttribute('aria-label', trigger.dataset.label + ' · ' + name);
  const status = orb?.querySelector<HTMLElement>('[data-theme-status]');
  if (status && announce) status.textContent = name;
}

function commitTheme(theme: ThemeId) {
  applyTheme(theme);
  updateOrb(theme, true);
  window.dispatchEvent(new CustomEvent('aitai:theme', { detail: { theme } }));
}

function clearTransition() {
  timers.forEach((timer) => window.clearTimeout(timer));
  timers = [];
  document.querySelector('[data-theme-transition]')?.classList.remove('is-active', 'is-fading');
  document.documentElement.classList.remove('is-switching');
  switching = false;
  pendingTheme = null;
}

function finishTransition() {
  if (pendingTheme && pendingTheme !== getTheme()) commitTheme(pendingTheme);
  clearTransition();
}

function cycleLanguage(trigger: HTMLButtonElement) {
  const href = trigger.dataset.languageHref;
  if (!href || switching || navigating) return;
  navigating = true;
  // Passing the button selects the current world's language transition.
  void navigate(href, { sourceElement: trigger }).finally(() => { navigating = false; });
}

function cycleTheme(trigger: HTMLButtonElement) {
  if (switching || navigating) return;
  const order = siteConfig.theme.order;
  const next = order[(order.indexOf(getTheme()) + 1) % order.length];
  switchTheme(next, trigger);
}

export function getTheme(): ThemeId {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : siteConfig.theme.default;
}

export function switchTheme(next: ThemeId, origin?: HTMLElement) {
  if (next === getTheme() || switching) return;

  const overlay = document.querySelector<HTMLElement>('[data-theme-transition]');
  if (reduced() || !overlay) {
    commitTheme(next);
    return;
  }

  switching = true;
  pendingTheme = next;
  const rect = (origin || document.querySelector<HTMLElement>('[data-theme-trigger]'))?.getBoundingClientRect();
  const tx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const ty = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  overlay.style.setProperty('--tx', tx + 'px');
  overlay.style.setProperty('--ty', ty + 'px');
  overlay.style.setProperty('--to-bg', themeBg[next]);
  overlay.classList.remove('is-fading');
  overlay.classList.add('is-active');
  document.documentElement.classList.add('is-switching');

  timers.push(window.setTimeout(() => { commitTheme(next); }, 340));
  timers.push(window.setTimeout(() => {
    overlay.classList.add('is-fading');
    document.documentElement.classList.remove('is-switching');
  }, 760));
  timers.push(window.setTimeout(clearTransition, 1240));
}

function bindTrigger(trigger: HTMLButtonElement) {
  let pressTimer = 0;
  let pointer: number | null = null;
  let startX = 0;
  let startY = 0;
  let downAt = 0;
  let longFired = false;
  let suppressClick = false;

  const endPress = () => {
    window.clearTimeout(pressTimer);
    pressTimer = 0;
    delete trigger.dataset.pressing;
    window.removeEventListener('pointerup', onWindowUp);
    window.removeEventListener('pointercancel', onWindowCancel);
    pointer = null;
  };

  const onWindowUp = () => endPress();
  const onWindowCancel = () => {
    suppressClick = true;
    endPress();
  };

  const fireHold = () => {
    if (longFired) return;
    longFired = true;
    suppressClick = true;
    delete trigger.dataset.pressing;
    cycleTheme(trigger);
  };

  cancelPress = () => {
    suppressClick = true;
    endPress();
  };

  trigger.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    if (switching || navigating) {
      suppressClick = true;
      return;
    }
    endPress();
    pointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    downAt = performance.now();
    longFired = false;
    suppressClick = false;
    trigger.dataset.pressing = 'true';
    window.addEventListener('pointerup', onWindowUp);
    window.addEventListener('pointercancel', onWindowCancel);
    pressTimer = window.setTimeout(fireHold, HOLD_MS);
  });

  trigger.addEventListener('pointermove', (event) => {
    if (pointer !== event.pointerId) return;
    // Trackpad jitter must not kill a hold; touch needs a slightly tighter guard.
    const limit = event.pointerType === 'touch' ? 18 : 36;
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > limit) {
      suppressClick = true;
      endPress();
    }
  });

  trigger.addEventListener('pointerup', (event) => {
    if (pointer !== event.pointerId) return;
    // Fallback for browsers that drop the timer while the pointer is down.
    if (!longFired && performance.now() - downAt >= HOLD_MS - 40) fireHold();
    endPress();
  });

  trigger.addEventListener('pointercancel', () => {
    suppressClick = true;
    endPress();
  });

  trigger.addEventListener('contextmenu', (event) => event.preventDefault());

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (suppressClick || switching || navigating) {
      suppressClick = false;
      return;
    }
    cycleLanguage(trigger);
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!event.repeat) {
        suppressClick = true;
        endPress();
        cycleTheme(trigger);
      }
    } else if (event.key === 'Escape') {
      suppressClick = true;
      endPress();
    } else if (event.key === 'Enter') {
      suppressClick = false;
    }
  });

  trigger.addEventListener('keyup', (event) => {
    if (event.key === ' ') event.preventDefault();
  });

  trigger.addEventListener('blur', () => {
    if (pointer !== null) {
      suppressClick = true;
      endPress();
    }
  });
}

export function initTheme() {
  const theme = getTheme();
  applyTheme(theme);
  updateOrb(theme);

  const trigger = document.querySelector<HTMLButtonElement>('[data-theme-trigger]');
  if (trigger && !trigger.dataset.bound) {
    trigger.dataset.bound = 'true';
    bindTrigger(trigger);
  }

  if (!docBound) {
    docBound = true;
    document.addEventListener('astro:before-preparation', () => {
      cancelPress?.();
      finishTransition();
    });
    document.addEventListener('astro:before-swap', (event) => {
      cancelPress?.();
      finishTransition();
      const nextDocument = (event as unknown as { newDocument?: Document }).newDocument;
      if (!nextDocument?.documentElement) return;
      const theme = getTheme();
      nextDocument.documentElement.dataset.theme = theme;
      nextDocument.documentElement.style.colorScheme = theme === 'dawn' ? 'light' : 'dark';
    });
    document.addEventListener('astro:page-load', () => { navigating = false; });
    window.addEventListener('blur', () => { cancelPress?.(); });
    document.addEventListener('visibilitychange', () => {
      document.documentElement.classList.toggle('orb-paused', document.hidden);
      if (document.hidden) {
        cancelPress?.();
        finishTransition();
      }
    });
  }
}
