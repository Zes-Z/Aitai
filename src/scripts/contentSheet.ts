import { mountFadeContent } from './fadeContent';

/** Full-screen readers for Markdown entries and mixed-media portfolios. */
function clipFromRect(rect: DOMRect, radius: number): string {
  const top = Math.max(0, rect.top);
  const left = Math.max(0, rect.left);
  const right = Math.max(0, window.innerWidth - rect.right);
  const bottom = Math.max(0, window.innerHeight - rect.bottom);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${Math.max(0, radius)}px)`;
}

function anchorRect(trigger: HTMLElement): { rect: DOMRect; radius: number } {
  const anchor = trigger.querySelector<HTMLElement>('[data-sheet-source]') ?? trigger;
  let rect = anchor.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) {
    rect = new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 1, 1);
  }
  const radius = parseFloat(getComputedStyle(anchor).borderTopLeftRadius) || 6;
  return { rect, radius };
}

function pageScroll(paused: boolean) {
  const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
  if (paused) lenis?.stop();
  else lenis?.start();
}

export function initContentSheet(): void {
  const root = document.querySelector<HTMLElement>('[data-content-sheet-root]');
  if (!root || root.dataset.ready === 'true') return;

  const scroll = root.querySelector<HTMLElement>('[data-content-sheet-scroll]');
  const inner = root.querySelector<HTMLElement>('[data-content-sheet-content]');
  const close = root.querySelector<HTMLButtonElement>('[data-content-sheet-close]');
  if (!scroll || !inner || !close) return;
  root.dataset.ready = 'true';

  const templates = new Map(Array.from(document.querySelectorAll<HTMLTemplateElement>('template[data-content-sheet]'))
    .map(template => [template.dataset.contentSheet!, template]));
  const controller = new AbortController();
  const { signal } = controller;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastTrigger: HTMLElement | null = null;
  let lastAnchor: { rect: DOMRect; radius: number } | null = null;
  let closeTimer = 0;
  let revealFrame = 0;
  let morph: Animation | null = null;
  let cleanupFade: (() => void) | undefined;

  const animateClip = (from: string, to: string, duration = 720) => {
    if (reduced) return;
    morph?.cancel();
    morph = root.animate([{ clipPath: from }, { clipPath: to }],
      { duration, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'both' });
  };

  const pauseVideos = () => root.querySelectorAll('video').forEach(video => video.pause());

  const open = (key: string, trigger: HTMLElement) => {
    const template = templates.get(key);
    if (!template) return;
    window.clearTimeout(closeTimer);
    cancelAnimationFrame(revealFrame);
    cleanupFade?.();
    morph?.cancel();
    morph = null;
    pauseVideos();
    lastTrigger = trigger;
    lastAnchor = anchorRect(trigger);
    inner.replaceChildren(template.content.cloneNode(true));
    root.dataset.kind = template.dataset.contentKind ?? 'article';
    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    const title = inner.querySelector('h1');
    if (title) {
      title.id = 'content-sheet-title';
      root.setAttribute('aria-labelledby', title.id);
    }
    scroll.scrollTop = 0;
    document.documentElement.classList.add('is-sheet-open');
    pageScroll(true);

    if (root.dataset.kind !== 'portfolio') {
      animateClip(clipFromRect(lastAnchor.rect, lastAnchor.radius), 'inset(0px 0px 0px 0px round 0px)');
    }
    revealFrame = requestAnimationFrame(() => {
      root.classList.add('is-open');
      if (root.dataset.kind === 'portfolio') cleanupFade = mountFadeContent(inner, scroll, 0.6);
      close.focus({ preventScroll: true });
    });
  };

  const hide = () => {
    if (root.hidden || !root.classList.contains('is-open')) return;
    cancelAnimationFrame(revealFrame);
    cleanupFade?.();
    cleanupFade = undefined;
    pauseVideos();
    const rect = lastAnchor?.rect;
    if (root.dataset.kind !== 'portfolio' && rect && rect.bottom > -20 && rect.top < window.innerHeight + 20
      && rect.right > -20 && rect.left < window.innerWidth + 20 && rect.width > 0) {
      animateClip('inset(0px 0px 0px 0px round 0px)', clipFromRect(rect, lastAnchor!.radius), 560);
    }
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-sheet-open');
    pageScroll(false);
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      root.hidden = true;
      morph?.cancel();
      morph = null;
      inner.replaceChildren();
    }, reduced ? 0 : 620);
    if (lastTrigger?.offsetParent !== null) lastTrigger?.focus({ preventScroll: true });
  };

  // Delegation also covers React hydration and the depth field's cloned cards.
  document.addEventListener('click', event => {
    const trigger = event.target instanceof Element
      ? event.target.closest<HTMLElement>('[data-content-sheet-trigger]') : null;
    const key = trigger?.dataset.contentSheetTrigger;
    if (!trigger || !key || event.button !== 0) return;
    event.preventDefault();
    open(key, trigger);
  }, { signal });
  close.addEventListener('click', hide, { signal });
  document.addEventListener('keydown', event => {
    if (!root.classList.contains('is-open') || document.querySelector('dialog[open]')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      hide();
    } else if (event.key === 'Tab') {
      const controls = Array.from(root.querySelectorAll<HTMLElement>('button, a[href], input, video[controls], [tabindex]:not([tabindex="-1"])'))
        .filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
      const first = controls[0];
      const last = controls.at(-1);
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !root.contains(active))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (active === last || !root.contains(active))) {
        event.preventDefault();
        first?.focus();
      }
    }
  }, { signal });
  document.addEventListener('astro:before-swap', () => {
    window.clearTimeout(closeTimer);
    cancelAnimationFrame(revealFrame);
    cleanupFade?.();
    morph?.cancel();
    pauseVideos();
    if (document.documentElement.classList.contains('is-sheet-open')) pageScroll(false);
    document.documentElement.classList.remove('is-sheet-open');
    controller.abort();
  }, { once: true, signal });
}
