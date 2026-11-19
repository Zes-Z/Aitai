type Kind = 'tide' | 'constellate' | 'develop' | 'veil' | 'ink';

const KINDS = new Set<Kind>(['tide', 'constellate', 'develop', 'veil', 'ink']);
let booted = false;
let current: Animation | null = null;
let kind: Kind = 'veil';
let origin = { x: 50, y: 52 };
let safety = 0;

function overlay() {
  return document.querySelector<HTMLElement>('[data-page-transition]');
}

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function lock(on: boolean) {
  document.documentElement.classList.toggle('is-transitioning', on);
  const lenis = (window as unknown as { __lenis?: { start?: () => void; stop?: () => void } }).__lenis;
  if (on) lenis?.stop?.();
  else lenis?.start?.();
}

function setOrigin(source?: Element) {
  const rect = source?.getBoundingClientRect();
  if (!rect || !rect.width) {
    origin = { x: 50, y: 52 };
    return;
  }
  const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
  const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
  origin = { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
}

function cancel() {
  current?.cancel();
  current = null;
}

async function animate(el: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions): Promise<void> {
  cancel();
  const animation = el.animate(frames, { fill: 'forwards', ...options });
  current = animation;
  try {
    await animation.finished;
  } catch {
    // A newer transition cancelled this one.
  }
}

function reset() {
  cancel();
  const el = overlay();
  if (el) {
    el.style.visibility = 'hidden';
    el.style.transform = '';
    el.style.clipPath = '';
    el.style.opacity = '';
    el.dataset.kind = 'veil';
  }
  document.documentElement.classList.remove('is-transitioning');
  lock(false);
  window.clearTimeout(safety);
}

async function leave(nextKind: Kind, source?: Element) {
  const el = overlay();
  if (!el) return;

  kind = nextKind;
  setOrigin(source);
  el.dataset.kind = kind;
  el.style.visibility = 'visible';
  el.style.transform = '';
  el.style.clipPath = '';
  el.style.opacity = '1';
  lock(true);

  if (reduced()) {
    await animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: 'ease-out' });
    return;
  }

  if (kind === 'ink') {
    const theme = document.documentElement.dataset.theme || 'star';
    el.dataset.theme = theme;
    if (theme === 'sea') {
      await animate(
        el,
        [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
        { duration: 760, easing: 'cubic-bezier(.83,0,.17,1)' }
      );
      return;
    }
    if (theme === 'dawn') {
      await animate(
        el,
        [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
        { duration: 700, easing: 'cubic-bezier(.83,0,.17,1)' }
      );
      return;
    }
    const inkAt = '82% 16%';
    el.style.clipPath = 'circle(0% at ' + inkAt + ')';
    await animate(
      el,
      [
        { clipPath: 'circle(0% at ' + inkAt + ')' },
        { clipPath: 'circle(150% at ' + inkAt + ')' },
      ],
      { duration: 820, easing: 'cubic-bezier(.83,0,.17,1)' }
    );
    return;
  }

  const at = origin.x.toFixed(2) + '% ' + origin.y.toFixed(2) + '%';

  if (kind === 'tide') {
    await animate(
      el,
      [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
      { duration: 780, easing: 'cubic-bezier(.83,0,.17,1)' }
    );
    return;
  }

  if (kind === 'veil') {
    await animate(
      el,
      [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }],
      { duration: 640, easing: 'cubic-bezier(.83,0,.17,1)' }
    );
    return;
  }

  const duration = kind === 'constellate' ? 880 : 720;
  el.style.clipPath = 'circle(0% at ' + at + ')';
  await animate(
    el,
    [
      { clipPath: 'circle(0% at ' + at + ')' },
      { clipPath: 'circle(150% at ' + at + ')' },
    ],
    { duration, easing: 'cubic-bezier(.83,0,.17,1)' }
  );
}

async function enter() {
  const el = overlay();
  if (!el) return;

  if (reduced()) {
    await animate(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-in' });
    reset();
    return;
  }

  if (kind === 'ink') {
    const theme = el.dataset.theme || document.documentElement.dataset.theme || 'star';
    if (theme === 'sea') {
      await animate(
        el,
        [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
        { duration: 720, easing: 'cubic-bezier(.83,0,.17,1)' }
      );
    } else if (theme === 'dawn') {
      await animate(
        el,
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }],
        { duration: 680, easing: 'cubic-bezier(.83,0,.17,1)' }
      );
    } else {
      const inkAt = '82% 16%';
      await animate(
        el,
        [
          { clipPath: 'circle(150% at ' + inkAt + ')' },
          { clipPath: 'circle(0% at ' + inkAt + ')' },
        ],
        { duration: 760, easing: 'cubic-bezier(.83,0,.17,1)' }
      );
    }
    reset();
    return;
  }

  const at = origin.x.toFixed(2) + '% ' + origin.y.toFixed(2) + '%';

  if (kind === 'tide') {
    await animate(
      el,
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
      { duration: 720, easing: 'cubic-bezier(.83,0,.17,1)' }
    );
  } else if (kind === 'veil') {
    await animate(
      el,
      [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
      { duration: 660, easing: 'cubic-bezier(.83,0,.17,1)' }
    );
  } else {
    await animate(
      el,
      [
        { clipPath: 'circle(150% at ' + at + ')' },
        { clipPath: 'circle(0% at ' + at + ')' },
      ],
      { duration: kind === 'constellate' ? 760 : 620, easing: 'cubic-bezier(.83,0,.17,1)' }
    );
  }

  reset();
}

export function initPageTransitions() {
  if (booted) return;
  booted = true;

  document.addEventListener('astro:before-preparation', (event) => {
    const e = event as unknown as {
      sourceElement?: Element;
      loader: () => Promise<void>;
      navigationType?: string;
    };
    const source = e.sourceElement;
    const attr = source?.getAttribute('data-transition') as Kind | null;
    const nextKind: Kind = attr && KINDS.has(attr) ? attr : 'veil';
    const original = e.loader;

    window.clearTimeout(safety);
    safety = window.setTimeout(() => {
      if (document.documentElement.classList.contains('is-transitioning')) reset();
    }, 6000);

    e.loader = async () => {
      await Promise.all([original(), leave(nextKind, source)]);
    };
  });

  document.addEventListener('astro:after-swap', () => {
    requestAnimationFrame(() => { void enter(); });
  });

  document.addEventListener('astro:page-load', () => {
    const el = overlay();
    if (el && !document.documentElement.classList.contains('is-transitioning')) {
      el.style.visibility = 'hidden';
    }
  });
}
