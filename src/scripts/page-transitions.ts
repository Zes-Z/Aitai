import { siteConfig } from '../../SiteConfig';
import type Lenis from 'lenis';
import { isTheme } from '../theme/palettes';
import { createLanguageEffect, languageStyle, type Effect, type TransitionContext } from '../transitions/language';

type Kind = 'tide' | 'constellate' | 'develop' | 'veil' | 'language';
type Preparation = Event & {
  from: URL;
  to: URL;
  sourceElement?: Element;
  direction: 'forward' | 'back';
  navigationType: 'push' | 'replace' | 'traverse';
  signal: AbortSignal;
  loader: () => Promise<void>;
};
type Swap = Event & { newDocument: Document; viewTransition?: ViewTransition };
type Session = {
  root: HTMLElement;
  kind: Kind;
  controller: AbortController;
  animations: Set<Animation>;
  inert: Map<HTMLElement, boolean>;
  effect: Effect;
  phase: 'leaving' | 'covered' | 'swapped' | 'entering';
  focusTrigger: boolean;
  scroll?: { x: number; y: number };
  safety: number;
};

const KINDS = new Set<Kind>(['tide', 'constellate', 'develop', 'veil', 'language']);
const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown']);
let booted = false;
let active: Session | null = null;

function lenis() {
  return (window as Window & { __lenis?: Lenis }).__lenis;
}

function restoreScroll(session: Session) {
  if (!session.scroll) return;
  window.scrollTo({ left: session.scroll.x, top: session.scroll.y, behavior: 'instant' });
  // Keep Lenis' target in sync so restarting it cannot pull the viewport back.
  lenis()?.resize();
  if (history.state) history.replaceState({ ...history.state, scrollX, scrollY }, '');
}

function lock(session: Session) {
  document.documentElement.classList.add('is-transitioning');
  document.documentElement.dataset.transitionMode = session.kind;
  for (const el of document.querySelectorAll<HTMLElement>('.site-main, [data-avatar-dock], [data-theme-orb]')) {
    if (!session.inert.has(el)) session.inert.set(el, el.inert);
    el.inert = true;
  }
  lenis()?.stop();
}

function finish(session: Session, restoreFocus = false) {
  if (active !== session) return;
  active = null;
  session.controller.abort();
  window.clearTimeout(session.safety);
  for (const animation of session.animations) animation.cancel();
  session.root.replaceChildren();
  session.root.style.visibility = 'hidden';
  session.root.style.transform = '';
  session.root.style.clipPath = '';
  session.root.style.opacity = '';
  session.root.dataset.phase = 'idle';
  for (const [element, wasInert] of session.inert) element.inert = wasInert;
  document.documentElement.classList.remove('is-transitioning');
  delete document.documentElement.dataset.transitionMode;
  if (restoreFocus) restoreScroll(session);
  lenis()?.start();
  if (restoreFocus && session.focusTrigger) document.querySelector<HTMLElement>('[data-theme-trigger]')?.focus({ preventScroll: true });
}

function legacy(kind: Kind, source: Element | undefined, ctx: TransitionContext): Effect {
  const rect = source?.getBoundingClientRect();
  const x = rect ? (rect.left + rect.width / 2) / innerWidth * 100 : 50;
  const y = rect ? (rect.top + rect.height / 2) / innerHeight * 100 : 52;
  const at = x.toFixed(2) + '% ' + y.toFixed(2) + '%';
  const small = 'circle(0% at ' + at + ')';
  const full = 'circle(150% at ' + at + ')';
  const ease = 'cubic-bezier(.83,0,.17,1)';
  return {
    async leave() {
      if (ctx.reduced) {
        await ctx.animate(ctx.root, [{ opacity: 0 }, { opacity: 1 }], { duration: 100 });
      } else if (kind === 'tide' || kind === 'veil') {
        await ctx.animate(ctx.root, [{ transform: kind === 'tide' ? 'translateY(100%)' : 'translateY(-100%)' }, { transform: 'translateY(0)' }], { duration: kind === 'tide' ? 780 : 640, easing: ease });
      } else {
        ctx.root.style.clipPath = small;
        await ctx.animate(ctx.root, [{ clipPath: small }, { clipPath: full }], { duration: kind === 'constellate' ? 880 : 720, easing: ease });
      }
    },
    async enter() {
      if (ctx.reduced) {
        await ctx.animate(ctx.root, [{ opacity: 1 }, { opacity: 0 }], { duration: 100 });
      } else if (kind === 'tide' || kind === 'veil') {
        await ctx.animate(ctx.root, [{ transform: 'translateY(0)' }, { transform: kind === 'tide' ? 'translateY(-100%)' : 'translateY(100%)' }], { duration: kind === 'tide' ? 720 : 660, easing: ease });
      } else {
        await ctx.animate(ctx.root, [{ clipPath: full }, { clipPath: small }], { duration: kind === 'constellate' ? 760 : 620, easing: ease });
      }
    },
  };
}

function changesLanguage(from: URL, to: URL) {
  const locale = (url: URL) => url.pathname.match(/\/(zh|en|ja)(?=\/|$)/)?.[1];
  const a = locale(from);
  const b = locale(to);
  return !!a && !!b && a !== b;
}

function bounded(promise: Promise<unknown>, signal: AbortSignal, timeout: number) {
  return new Promise<void>((resolve) => {
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', end);
      resolve();
    };
    const timer = window.setTimeout(end, timeout);
    if (signal.aborted) end();
    else signal.addEventListener('abort', end, { once: true });
    void promise.then(end, end);
  });
}

async function enter(session: Session) {
  if (active !== session || session.phase !== 'swapped') return;
  session.phase = 'entering';
  session.root.dataset.phase = 'preparing';
  lock(session);
  let complete = false;
  try {
    // New page scripts and reveal observers get one paint before being frozen.
    await bounded(new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))), session.controller.signal, 150);
    const images = Array.from(document.images).filter((image) => {
      const r = image.getBoundingClientRect();
      return r.width && r.height && r.bottom > 0 && r.top < innerHeight;
    });
    await bounded(Promise.allSettled([document.fonts.ready, ...images.map((image) => image.decode())]), session.controller.signal, 900);
    if (active !== session || session.controller.signal.aborted) return;
    // Fonts/images can change page height; restore before taking the incoming copy.
    restoreScroll(session);
    session.root.dataset.phase = 'entering';
    await session.effect.enter();
    complete = !session.controller.signal.aborted;
  } finally {
    finish(session, complete);
  }
}

export function initPageTransitions() {
  if (booted) return;
  booted = true;

  document.addEventListener('astro:before-preparation', (event) => {
    const e = event as Preparation;
    if (active) finish(active);
    const root = document.querySelector<HTMLElement>('[data-page-transition]');
    if (!root || e.signal.aborted) return;
    const attr = e.sourceElement?.closest('[data-transition]')?.getAttribute('data-transition') as Kind | null;
    const kind = attr === 'language' || changesLanguage(e.from, e.to)
      ? 'language'
      : attr && KINDS.has(attr) ? attr : 'veil';
    const controller = new AbortController();
    const theme = isTheme(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : siteConfig.theme.default;
    const computed = getComputedStyle(document.documentElement);
    for (const token of ['bg', 'bg-2', 'bg-3', 'text', 'accent', 'accent-2', 'accent-3', 'glow']) {
      root.style.setProperty('--pt-' + token, computed.getPropertyValue('--' + token).trim());
    }
    root.dataset.kind = kind;
    root.dataset.theme = theme;
    root.dataset.direction = e.direction;
    root.dataset.phase = 'leaving';
    root.style.opacity = '1';
    root.style.transform = '';
    root.style.clipPath = '';
    const session: Session = {
      root, kind, controller, animations: new Set(), inert: new Map(),
      phase: 'leaving', focusTrigger: !!e.sourceElement?.matches('[data-theme-trigger]'),
      // A history traversal uses the destination entry, not the page being left.
      scroll: kind === 'language' ? e.navigationType === 'traverse'
        ? { x: history.state?.scrollX ?? scrollX, y: history.state?.scrollY ?? scrollY }
        : { x: scrollX, y: scrollY } : undefined,
      safety: 0, effect: undefined as unknown as Effect,
    };
    active = session;
    const ctx: TransitionContext = {
      root, direction: e.direction === 'back' ? -1 : 1,
      reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      signal: controller.signal,
      async animate(element, frames, options) {
        if (active !== session || controller.signal.aborted) return;
        const animation = element.animate(frames, { fill: 'forwards', ...options });
        session.animations.add(animation);
        try { await animation.finished; } catch { /* cancellation belongs to this navigation only */ }
      },
    };
    try {
      root.dataset.effect = kind === 'language' ? languageStyle[theme] : kind;
      session.effect = kind === 'language'
        ? createLanguageEffect(languageStyle[theme], ctx)
        : legacy(kind, e.sourceElement, ctx);
    } catch {
      ctx.reduced = true;
      session.effect = createLanguageEffect('frame', ctx);
    }
    root.style.visibility = 'visible';
    lock(session);
    e.signal.addEventListener('abort', () => finish(session), { once: true });
    session.safety = window.setTimeout(() => finish(session), 12000);
    const original = e.loader;
    e.loader = async () => {
      try {
        await Promise.all([original(), session.effect.leave()]);
        if (e.defaultPrevented || e.signal.aborted || controller.signal.aborted) finish(session);
        else if (active === session) {
          session.phase = 'covered';
          root.dataset.phase = 'covered';
        }
      } catch (error) {
        finish(session);
        throw error;
      }
    };
  });

  document.addEventListener('astro:before-swap', (event) => {
    if (!active) return;
    const e = event as Swap;
    // Our persistent DOM layer owns the visual transition, including in fallback browsers.
    void e.viewTransition?.ready.catch(() => {});
    e.viewTransition?.skipTransition();
    e.newDocument.documentElement.classList.add('is-transitioning');
    e.newDocument.documentElement.dataset.transitionMode = active.kind;
  });
  document.addEventListener('astro:after-swap', () => {
    if (!active) return;
    active.phase = 'swapped';
    lock(active);
    // Astro resets new routes to the top immediately before this event.
    restoreScroll(active);
  });
  document.addEventListener('astro:page-load', () => {
    if (active) void enter(active).catch((error) => console.warn('Transition reveal skipped:', error));
  });
  document.addEventListener('wheel', (event) => { if (active) event.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', (event) => { if (active) event.preventDefault(); }, { passive: false });
  document.addEventListener('keydown', (event) => {
    if (active && SCROLL_KEYS.has(event.key) && !event.altKey && !event.metaKey && !event.ctrlKey) event.preventDefault();
  });
  window.addEventListener('pagehide', () => { if (active) finish(active); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && active) finish(active); });
  window.addEventListener('resize', () => { if (active) finish(active); });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { if (active) finish(active); });
}
