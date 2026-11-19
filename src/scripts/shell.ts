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

function initMobileMenu() {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  if (!button || !menu) return;

  const setOpen = (open: boolean) => {
    menu.dataset.open = String(open);
    button.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
    if (open) lenis?.stop(); else lenis?.start();
  };
  const closeButton = menu.querySelector<HTMLButtonElement>('[data-menu-close]');
  const onButton = () => setOpen(menu.dataset.open !== 'true');
  const onClose = () => setOpen(false);
  const onLink = () => setOpen(false);
  const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };

  button.addEventListener('click', onButton);
  closeButton?.addEventListener('click', onClose);
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', onLink));
  document.addEventListener('keydown', onKey);
  addCleanup(() => {
    button.removeEventListener('click', onButton);
    closeButton?.removeEventListener('click', onClose);
    menu.querySelectorAll('a').forEach((a) => a.removeEventListener('click', onLink));
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('is-locked');
  });
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

function initCursor() {
  if (reduced() || window.matchMedia('(hover: none)').matches) return;
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  const label = document.querySelector<HTMLElement>('.cursor-label');
  if (!dot || !ring) return;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let rx = x;
  let ry = y;
  let raf = 0;

  const loop = () => {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    if (label) label.style.transform = `translate3d(${rx + 18}px, ${ry + 18}px, 0)`;
    raf = requestAnimationFrame(loop);
  };
  const onMove = (event: PointerEvent) => { x = event.clientX; y = event.clientY; };
  const onOver = (event: PointerEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor]');
    if (!target) return;
    ring.classList.add('is-active');
    if (label) {
      const text = target.dataset.cursorLabel;
      if (text) { label.textContent = text; label.classList.add('is-visible'); }
    }
  };
  const onOut = () => {
    ring.classList.remove('is-active');
    label?.classList.remove('is-visible');
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerover', onOver);
  document.addEventListener('pointerout', onOut);
  raf = requestAnimationFrame(loop);

  addCleanup(() => {
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerout', onOut);
    if (raf) cancelAnimationFrame(raf);
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

function initPage() {
  initLenis();
  lenis?.resize();
  lenis?.start();
  initClock();
  initTypewriter();
  initReveal();
  initTilt();
  initRails();
  initRealmTabs();
  initCounters();
  initActiveNav();
  initMobileMenu();
  initCopy();
  initAnchors();
  initCursor();
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
