/** One-row disclosures for the independent project and post collections. */
export function initContentGrids(): void {
  document.querySelectorAll<HTMLElement>('[data-content-grid]').forEach((section) => {
    if (section.dataset.gridReady === 'true') return;
    const viewport = section.querySelector<HTMLElement>('[data-grid-viewport]');
    const grid = section.querySelector<HTMLElement>('.chroma-grid-inner');
    const button = section.querySelector<HTMLButtonElement>('[data-grid-toggle]');
    const label = button?.querySelector<HTMLElement>('[data-grid-toggle-label]');
    if (!viewport || !grid || !button || !label) return;
    section.dataset.gridReady = 'true';
    const controller = new AbortController();
    let animation: Animation | null = null;
    let fades: Animation[] = [];
    let width = 0;

    const cards = () => Array.from(grid.querySelectorAll<HTMLElement>('.chroma-card'));
    const rowLimit = () => getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
    const updateButton = () => {
      const expanded = section.dataset.expanded === 'true';
      button.disabled = cards().length <= rowLimit();
      const text = (expanded ? button.dataset.collapseLabel : button.dataset.expandLabel) ?? '';
      label.textContent = text;
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', text + ' ' + (button.dataset.collectionLabel ?? ''));
    };
    const stopAnimations = () => {
      animation?.cancel();
      animation = null;
      fades.forEach((fade) => fade.cancel());
      fades = [];
      delete viewport.dataset.gridAnimating;
    };

    button.addEventListener('click', () => {
      const from = viewport.getBoundingClientRect().height;
      stopAnimations();
      const expanded = section.dataset.expanded !== 'true';
      section.dataset.expanded = String(expanded);
      updateButton();
      const to = viewport.getBoundingClientRect().height;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      viewport.dataset.gridAnimating = 'true';
      const current = viewport.animate([{ height: from + 'px' }, { height: to + 'px' }], {
        duration: 560,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      });
      animation = current;
      current.finished.then(() => {
        if (animation !== current) return;
        animation = null;
        delete viewport.dataset.gridAnimating;
      }).catch(() => {});
      if (expanded) {
        fades = cards().slice(rowLimit()).map((card, index) => card.animate(
          [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 440, delay: Math.min(index, 6) * 18, fill: 'backwards', easing: 'ease-out' },
        ));
      }
    }, { signal: controller.signal });

    const resize = new ResizeObserver(([entry]) => {
      if (Math.abs(width - entry.contentRect.width) < 0.5) return;
      width = entry.contentRect.width;
      stopAnimations();
      updateButton();
    });
    resize.observe(section);
    updateButton();
    document.addEventListener('astro:before-swap', (event) => {
      // Preserve the disclosure before language navigation restores scrolling.
      const next = (event as Event & { newDocument?: Document }).newDocument?.getElementById(section.id);
      if (next?.hasAttribute('data-content-grid')) next.dataset.expanded = section.dataset.expanded ?? 'false';
      stopAnimations();
      resize.disconnect();
      controller.abort();
    }, { once: true, signal: controller.signal });
  });
}
