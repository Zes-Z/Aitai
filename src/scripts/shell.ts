import Lenis from 'lenis';

let booted = false;
let lenis: Lenis | null = null;
let pageCleanups: Array<() => void> = [];

function addCleanup(fn: () => void) {
  pageCleanups.push(fn);
}
function cleanupPage() {
  pageCleanups.forEach((fn) => fn());
  pageCleanups = [];
}
function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function showToast(message: string) {
  const el = document.querySelector<HTMLElement>('[data-toast]');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  window.clearTimeout((el as HTMLElement & { _t?: number })._t);
  (el as HTMLElement & { _t?: number })._t = window.setTimeout(() => {
    el.classList.remove('is-visible');
  }, 2400);
}

function initLenis() {
  if (lenis || reduced()) return;
  lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.35,
  });
  (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
  lenis.on('scroll', () => updateProgress());
  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

function initProgress() {
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  if (!bar) return;
  updateProgress();
  const onScroll = () => updateProgress();
  window.addEventListener('scroll', onScroll, { passive: true });
  addCleanup(() => window.removeEventListener('scroll', onScroll));
}

function updateProgress() {
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  if (!bar) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  bar.style.setProperty('--progress', String(value));
}

function initClock() {
  const clocks = document.querySelectorAll<HTMLElement>('[data-clock]');
  const dates = document.querySelectorAll<HTMLElement>('[data-date]');
  if (!clocks.length && !dates.length) return;

  const tick = () => {
    clocks.forEach((el) => {
      const tz = el.dataset.tz || 'Asia/Tokyo';
      try {
        el.textContent = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
        }).format(new Date());
      } catch { el.textContent = '--:--'; }
    });
    dates.forEach((el) => {
      const tz = el.dataset.tz || 'Asia/Tokyo';
      const lang = el.dataset.lang || 'zh';
      const locale = lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : 'en-GB';
      try {
        el.textContent = new Intl.DateTimeFormat(locale, {
          timeZone: tz, month: 'short', day: '2-digit', weekday: 'short',
        }).format(new Date());
      } catch { el.textContent = ''; }
    });
  };
  tick();
  const id = window.setInterval(tick, 1000);
  addCleanup(() => window.clearInterval(id));
}

function initTypewriter() {
  const el = document.querySelector<HTMLElement>('[data-typewriter]');
  const out = el?.querySelector<HTMLElement>('[data-typewriter-text]');
  if (!el || !out) return;

  let lines: string[] = [];
  try { lines = JSON.parse(el.dataset.lines || '[]'); } catch { lines = []; }
  if (!lines.length) return;
  if (reduced()) { out.textContent = lines[0]; return; }

  let line = 0;
  let char = 0;
  let deleting = false;
  let timer = 0;
  const chars = () => Array.from(lines[line]);

  const tick = () => {
    const arr = chars();
    if (!deleting) {
      char += 1;
      out.textContent = arr.slice(0, char).join('');
      if (char >= arr.length) {
        deleting = true;
        timer = window.setTimeout(tick, 2200);
        return;
      }
      timer = window.setTimeout(tick, 58);
    } else {
      char -= 1;
      out.textContent = arr.slice(0, Math.max(0, char)).join('');
      if (char <= 0) {
        deleting = false;
        line = (line + 1) % lines.length;
        timer = window.setTimeout(tick, 520);
        return;
      }
      timer = window.setTimeout(tick, 26);
    }
  };
  timer = window.setTimeout(tick, 900);
  addCleanup(() => window.clearTimeout(timer));
}

function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;
  if (reduced()) { items.forEach((el) => el.classList.add('is-in')); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  items.forEach((el) => io.observe(el));
  addCleanup(() => io.disconnect());
}

function initTilt() {
  if (reduced() || window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    let raf = 0;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const strength = Number(el.dataset.tilt || 4);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.transition = 'transform 0.12s ease-out';
        el.style.transform = `perspective(900px) rotateX(${(-py * strength).toFixed(2)}deg) rotateY(${(px * strength).toFixed(2)}deg)`;
      });
    };
    const onLeave = () => {
      el.style.transition = 'transform 0.6s var(--ease-soft)';
      el.style.transform = '';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    addCleanup(() => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    });
  });
}

function initRails() {
  document.querySelectorAll<HTMLElement>('[data-rail]').forEach((rail) => {
    let down = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let pointerId: number | null = null;

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      down = true;
      moved = false;
      startX = event.clientX;
      startScroll = rail.scrollLeft;
      pointerId = event.pointerId;
      rail.classList.add('is-dragging');
    };
    const onMove = (event: PointerEvent) => {
      if (!down) return;
      const dx = event.clientX - startX;
      if (!moved && Math.abs(dx) <= 6) return;
      if (!moved) {
        moved = true;
        rail.setPointerCapture?.(event.pointerId);
      }
      rail.scrollLeft = startScroll - dx;
      event.preventDefault();
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      rail.classList.remove('is-dragging');
      if (pointerId !== null) rail.releasePointerCapture?.(pointerId);
      pointerId = null;
      window.setTimeout(() => { moved = false; }, 30);
    };
    const onClick = (event: MouseEvent) => {
      if (moved) { event.preventDefault(); event.stopPropagation(); }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const step = Math.max(220, rail.clientWidth * 0.6);
      rail.scrollBy({ left: event.key === 'ArrowRight' ? step : -step, behavior: 'smooth' });
    };

    rail.addEventListener('pointerdown', onDown);
    rail.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    rail.addEventListener('click', onClick, true);
    rail.addEventListener('keydown', onKey);
    addCleanup(() => {
      rail.removeEventListener('pointerdown', onDown);
      rail.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      rail.removeEventListener('click', onClick, true);
      rail.removeEventListener('keydown', onKey);
    });
  });
}

function initActiveNav() {
  const sections = document.querySelectorAll<HTMLElement>('[data-section]');
  const links = document.querySelectorAll<HTMLAnchorElement>('a[data-nav-link]');
  if (!sections.length || !links.length) return;

  const setActive = (id: string) => {
    links.forEach((link) => {
      const hash = link.href.includes('#') ? link.href.split('#')[1] : '';
      if (hash === id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-42% 0px -50% 0px', threshold: 0 });

  sections.forEach((section) => io.observe(section));
  addCleanup(() => io.disconnect());
}

function initCopy() {
  document.querySelectorAll<HTMLElement>('[data-copy-email]').forEach((el) => {
    const onClick = async (event: Event) => {
      event.preventDefault();
      const email = el.dataset.copyEmail || '';
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        const input = document.createElement('textarea');
        input.value = email;
        document.body.appendChild(input);
        input.select();
        (document as unknown as { execCommand: (cmd: string) => boolean }).execCommand('copy');
        input.remove();
      }
      showToast(el.dataset.toast || 'Copied.');
    };
    el.addEventListener('click', onClick);
    addCleanup(() => el.removeEventListener('click', onClick));
  });
}

function initAnchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    const onClick = (event: MouseEvent) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.2 });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.querySelector<HTMLElement>('[data-mobile-menu]')?.setAttribute('data-open', 'false');
      document.body.classList.remove('is-locked');
      lenis?.start();
    };
    link.addEventListener('click', onClick);
    addCleanup(() => link.removeEventListener('click', onClick));
  });
}


function initCounters() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!els.length || reduced()) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      io.unobserve(el);
      const target = Number(el.dataset.count || 0);
      const start = performance.now();
      const duration = 1100;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = String(target);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  els.forEach((el) => { el.textContent = '0'; io.observe(el); });
  addCleanup(() => io.disconnect());
}

function initRealmTabs() {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-realm-tab]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-realm-panel]'));
  if (!tabs.length) return;

  const activate = (id: string) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.realmTab === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel) => {
      const on = panel.dataset.realmPanel === id;
      panel.dataset.active = String(on);
      panel.setAttribute('aria-hidden', String(!on));
    });
  };

  const activateAt = (index: number) => {
    const tab = tabs[(index + tabs.length) % tabs.length];
    if (!tab) return;
    const id = tab.dataset.realmTab || 'projects';
    activate(id);
    tab.focus();
  };

  tabs.forEach((tab, index) => {
    const onClick = () => activate(tab.dataset.realmTab || 'projects');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        activateAt(index + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        activateAt(index - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        activateAt(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        activateAt(tabs.length - 1);
      }
    };
    tab.addEventListener('click', onClick);
    tab.addEventListener('keydown', onKey);
    addCleanup(() => {
      tab.removeEventListener('click', onClick);
      tab.removeEventListener('keydown', onKey);
    });
  });
}

type DriftState = {
  el: HTMLElement;
  baseX: number;
  baseY: number;
  w: number;
  h: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  phase: number;
  pressed: boolean;
  dragging: boolean;
  moved: boolean;
  resetting: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  lastX: number;
  lastY: number;
};

function initDrift() {
  const stage = document.querySelector<HTMLElement>('[data-drift-stage]');
  if (!stage) return;
  if (window.matchMedia('(max-width: 767px)').matches) return;
  const stageEl: HTMLElement = stage;

  const cards = Array.from(stageEl.querySelectorAll<HTMLElement>('[data-drift-card]'));
  if (!cards.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let stageW = 0;
  let stageH = 0;
  let raf = 0;

  const states: DriftState[] = cards.map((el, index) => ({
    el,
    baseX: 0,
    baseY: 0,
    w: 0,
    h: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rot: Number.parseFloat(el.style.getPropertyValue('--rot')) || 0,
    phase: index * 1.37,
    pressed: false,
    dragging: false,
    moved: false,
    resetting: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    lastX: 0,
    lastY: 0,
  }));

  function measure() {
    stageW = stageEl.clientWidth;
    stageH = stageEl.clientHeight;
    for (const state of states) {
      state.baseX = state.el.offsetLeft;
      state.baseY = state.el.offsetTop;
      state.w = state.el.offsetWidth;
      state.h = state.el.offsetHeight;
    }
  }

  function bounds(state: DriftState) {
    const minX = -state.baseX;
    const maxX = Math.max(minX, stageW - state.baseX - state.w);
    const minY = -state.baseY;
    const maxY = Math.max(minY, stageH - state.baseY - state.h);
    return { minX, maxX, minY, maxY };
  }

  function render(now: number) {
    const t = now / 1000;
    for (const state of states) {
      if (state.resetting) {
        state.x += (0 - state.x) * 0.12;
        state.y += (0 - state.y) * 0.12;
        if (Math.abs(state.x) < 0.2 && Math.abs(state.y) < 0.2) {
          state.x = 0;
          state.y = 0;
          state.resetting = false;
        }
      } else if (!state.dragging) {
        state.x += state.vx;
        state.y += state.vy;
        state.vx *= 0.9;
        state.vy *= 0.9;
        if (Math.abs(state.vx) < 0.03) state.vx = 0;
        if (Math.abs(state.vy) < 0.03) state.vy = 0;
        const b = bounds(state);
        if (state.x < b.minX) { state.x = b.minX; state.vx *= -0.35; }
        if (state.x > b.maxX) { state.x = b.maxX; state.vx *= -0.35; }
        if (state.y < b.minY) { state.y = b.minY; state.vy *= -0.35; }
        if (state.y > b.maxY) { state.y = b.maxY; state.vy *= -0.35; }
      }

      const fx = Math.sin(t * 0.7 + state.phase) * 3;
      const fy = Math.cos(t * 0.55 + state.phase) * 4;
      state.el.style.transform =
        'translate3d(' + (state.x + fx).toFixed(2) + 'px, ' + (state.y + fy).toFixed(2) + 'px, 0) rotate(' + state.rot + 'deg)';
    }
    raf = requestAnimationFrame(render);
  }

  measure();

  if (reduce) {
    for (const state of states) {
      state.el.style.transform = 'rotate(' + state.rot + 'deg)';
    }
    return;
  }

  states.forEach((state) => {
    const el = state.el;

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      state.pressed = true;
      state.dragging = false;
      state.moved = false;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.originX = state.x;
      state.originY = state.y;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', (((event.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (((event.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%');

      if (!state.pressed) return;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;

      if (!state.dragging && Math.hypot(dx, dy) > 6) {
        state.dragging = true;
        el.classList.add('is-dragging');
        el.setPointerCapture?.(event.pointerId);
      }
      if (!state.dragging) return;

      state.x = state.originX + dx;
      state.y = state.originY + dy;
      const b = bounds(state);
      state.x = Math.min(b.maxX, Math.max(b.minX, state.x));
      state.y = Math.min(b.maxY, Math.max(b.minY, state.y));
      state.vx = event.clientX - state.lastX;
      state.vy = event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      event.preventDefault();
    };

    const onUp = (event: PointerEvent) => {
      if (!state.pressed) return;
      state.pressed = false;
      if (!state.dragging) return;
      state.dragging = false;
      el.classList.remove('is-dragging');
      el.releasePointerCapture?.(event.pointerId);
      state.moved = true;
      window.setTimeout(() => { state.moved = false; }, 30);
    };

    const onLeave = () => {
      if (!state.dragging) state.pressed = false;
    };

    const onClick = (event: MouseEvent) => {
      if (state.moved) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('click', onClick, true);
    addCleanup(() => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('click', onClick, true);
    });
  });

  const reset = stageEl.querySelector<HTMLButtonElement>('[data-drift-reset]');
  const onReset = () => {
    states.forEach((state) => {
      state.resetting = true;
      state.vx = 0;
      state.vy = 0;
    });
  };
  reset?.addEventListener('click', onReset);

  const onResize = () => measure();
  window.addEventListener('resize', onResize);
  addCleanup(() => {
    reset?.removeEventListener('click', onReset);
    window.removeEventListener('resize', onResize);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  });

  raf = requestAnimationFrame(render);
}

function initPage() {
  initLenis();
  lenis?.resize();
  lenis?.start();
  initClock();
  initTypewriter();
  initReveal();
  initTilt();
  initRails();
  initDrift();
  initRealmTabs();
  initCounters();
  initActiveNav();
  initCopy();
  initAnchors();
  initProgress();
}

export function initShell() {
  if (!booted) {
    booted = true;
    document.addEventListener('astro:page-load', () => {
      cleanupPage();
      initPage();
    });
    document.addEventListener('astro:before-swap', () => {
      cleanupPage();
      lenis?.stop();
      document.body.classList.remove('is-locked');
    });
  }
  cleanupPage();
  initPage();
}
