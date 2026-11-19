import type Lenis from 'lenis';

let cleanup: (() => void) | null = null;

export function initAvatarDock() {
  const dock = document.querySelector<HTMLElement>('[data-avatar-dock]');
  const trigger = dock?.querySelector<HTMLButtonElement>('[data-avatar-fixed]');
  const menu = dock?.querySelector<HTMLElement>('[data-avatar-actions]');
  if (!dock || !trigger || !menu) return;
  if (trigger.dataset.bound === 'true') return;
  cleanup?.();
  cleanup = null;

  const controller = new AbortController();
  const options = { signal: controller.signal };
  const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>('[data-avatar-action]'));
  let timer = 0;
  let pointer: number | null = null;
  let startX = 0;
  let startY = 0;
  let suppressClick = false;

  function setOpen(open: boolean, focusFirst = false) {
    dock!.dataset.open = String(open);
    trigger!.setAttribute('aria-expanded', String(open));
    menu!.setAttribute('aria-hidden', String(!open));
    menu!.inert = !open;
    if (open && focusFirst) links[0]?.focus();
  }

  function endPress() {
    window.clearTimeout(timer);
    delete trigger!.dataset.pressing;
    if (pointer !== null && trigger!.hasPointerCapture(pointer)) trigger!.releasePointerCapture(pointer);
    pointer = null;
  }

  function cancelPress() {
    suppressClick = true;
    endPress();
  }

  function scrollToTop() {
    setOpen(false);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (lenis) lenis.scrollTo(0, { duration: .9, immediate: reduce });
    else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  trigger.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    if (document.documentElement.classList.contains('is-transitioning')) {
      suppressClick = true;
      return;
    }
    endPress();
    suppressClick = false;
    pointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    trigger.dataset.pressing = 'true';
    trigger.setPointerCapture(event.pointerId);
    timer = window.setTimeout(() => {
      suppressClick = true;
      delete trigger.dataset.pressing;
      scrollToTop();
    }, 460);
  }, options);
  trigger.addEventListener('pointermove', (event) => {
    if (pointer === event.pointerId && Math.hypot(event.clientX - startX, event.clientY - startY) > 12) cancelPress();
  }, options);
  trigger.addEventListener('pointerup', endPress, options);
  trigger.addEventListener('pointercancel', cancelPress, options);
  trigger.addEventListener('lostpointercapture', endPress, options);
  trigger.addEventListener('contextmenu', (event) => event.preventDefault(), options);
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (suppressClick || document.documentElement.classList.contains('is-transitioning')) {
      suppressClick = false;
      return;
    }
    setOpen(dock.dataset.open !== 'true');
  }, options);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Home') {
      event.preventDefault();
      if (!event.repeat) {
        cancelPress();
        scrollToTop();
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      cancelPress();
      setOpen(true, true);
    } else if (event.key === 'Enter') {
      suppressClick = false;
    }
  }, options);
  trigger.addEventListener('keyup', (event) => {
    if (event.key === ' ') event.preventDefault();
  }, options);
  trigger.addEventListener('blur', () => {
    if (pointer !== null) cancelPress();
  }, options);

  menu.addEventListener('keydown', (event) => {
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      links[(index + 1) % links.length]?.focus();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      links[(index - 1 + links.length) % links.length]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      links[event.key === 'Home' ? 0 : links.length - 1]?.focus();
    }
  }, options);
  links.forEach((link) => link.addEventListener('click', () => { setOpen(false); }, options));

  document.addEventListener('pointerdown', (event) => {
    if (!dock.contains(event.target as Node)) setOpen(false);
  }, options);
  document.addEventListener('focusin', (event) => {
    if (!dock.contains(event.target as Node)) setOpen(false);
  }, options);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dock.dataset.open === 'true') {
      event.preventDefault();
      setOpen(false);
      trigger.focus();
    }
  }, options);
  document.addEventListener('astro:before-preparation', () => {
    cancelPress();
    setOpen(false);
  }, options);
  document.addEventListener('astro:before-swap', () => { cleanup?.(); }, options);
  window.addEventListener('blur', () => {
    cancelPress();
    setOpen(false);
  }, options);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelPress();
      setOpen(false);
    }
  }, options);

  setOpen(false);
  trigger.dataset.bound = 'true';
  cleanup = () => {
    cancelPress();
    setOpen(false);
    delete trigger.dataset.bound;
    controller.abort();
  };
}
