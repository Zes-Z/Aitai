/**
 * Full-screen in-page sheet for project / thought entries.
 * Markdown is rendered server-side into <template> nodes by ContentFlow.
 */
export function initContentSheet(): void {
  const root = document.querySelector<HTMLElement>('[data-content-sheet-root]');
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';

  const scroll = root.querySelector<HTMLElement>('[data-content-sheet-scroll], .content-sheet__scroll');
  const inner = root.querySelector<HTMLElement>('[data-content-sheet-content]');
  const close = root.querySelector<HTMLButtonElement>('[data-content-sheet-close]');
  const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-content-sheet-trigger]'));
  if (!scroll || !inner || !close) return;

  let lastTrigger: HTMLElement | null = null;
  let closeTimer = 0;

  const open = (key: string, trigger: HTMLElement) => {
    const template = document.querySelector<HTMLTemplateElement>('[data-content-sheet="' + key + '"]');
    if (!template) return;
    window.clearTimeout(closeTimer);
    lastTrigger = trigger;
    inner.replaceChildren(template.content.cloneNode(true));
    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-sheet-open');
    scroll.scrollTop = 0;
    requestAnimationFrame(() => root.classList.add('is-open'));
    close.focus({ preventScroll: true });
  };

  const hide = () => {
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-sheet-open');
    const focusTarget = lastTrigger && lastTrigger.offsetParent !== null ? lastTrigger : null;
    focusTarget?.focus({ preventScroll: true });
    closeTimer = window.setTimeout(() => {
      root.hidden = true;
      inner.replaceChildren();
    }, 300);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const key = trigger.dataset.contentSheetTrigger;
      if (key) open(key, trigger);
    });
  });

  close.addEventListener('click', hide);
  document.addEventListener('keydown', (event) => {
    if (!root.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      hide();
    }
  });
  document.addEventListener('astro:before-swap', () => {
    window.clearTimeout(closeTimer);
    document.documentElement.classList.remove('is-sheet-open');
  }, { once: true });
}
