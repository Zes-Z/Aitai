/**
 * Inert viewport copies for the Frame and Slices transitions.
 * Inspired by Interlude's old-page helper (Codrops, MIT); see
 * third-party/interlude-LICENSE.txt. Shadow roots isolate copied IDs, styles
 * and data attributes from Astro's page initializers.
 */
export interface PageSnapshot {
  ready: Promise<unknown>;
  mount(parent: HTMLElement): HTMLElement;
}

const sheets = new Map<string, CSSStyleSheet>();
const FREEZE = ['transform', 'translate', 'rotate', 'scale', 'opacity', 'filter', 'clip-path', 'stroke-dashoffset'];

function pageStyles() {
  const rules: string[] = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (!(rule instanceof CSSImportRule)) rules.push(rule.cssText);
      }
    } catch {
      // Cross-origin font faces are already registered by the real document.
    }
  }
  return rules.join('\n').replace(/(?:\:root|\bhtml)((?:\[[^\]]*\]|\.[\w-]+)*)/g, (_match, state: string) => state ? ':host(' + state + ')' : ':host') +
    '\n*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
}

function freeze(node: Node, incoming: boolean): Node | null {
  if (!(node instanceof Element)) return node.cloneNode();
  if (node.matches('script, template, style, link, iframe, audio, embed, object, [data-page-transition], [data-theme-transition], .cursor-dot, .cursor-ring, .cursor-label, .skip-link')) return null;

  if (node instanceof HTMLCanvasElement || node instanceof HTMLVideoElement) {
    const image = document.createElement('img');
    for (const attr of node.attributes) image.setAttribute(attr.name, attr.value);
    try {
      let canvas: HTMLCanvasElement;
      if (node instanceof HTMLCanvasElement) canvas = node;
      else {
        canvas = document.createElement('canvas');
        canvas.width = node.videoWidth || node.clientWidth;
        canvas.height = node.videoHeight || node.clientHeight;
        canvas.getContext('2d')?.drawImage(node, 0, 0, canvas.width, canvas.height);
      }
      image.src = canvas.toDataURL();
    } catch {
      if (node instanceof HTMLVideoElement && node.poster) image.src = node.poster;
    }
    image.style.width = node.clientWidth + 'px';
    image.style.height = node.clientHeight + 'px';
    image.decoding = 'sync';
    return image;
  }

  const copy = node.localName.includes('-') && node.namespaceURI === 'http://www.w3.org/1999/xhtml'
    ? document.createElement('div')
    : node.cloneNode(false) as Element;
  if (copy.localName !== node.localName) {
    for (const attr of node.attributes) copy.setAttribute(attr.name, attr.value);
    (copy as HTMLElement).style.display = getComputedStyle(node).display;
  }

  if (copy instanceof HTMLImageElement && node instanceof HTMLImageElement) {
    copy.removeAttribute('srcset');
    copy.removeAttribute('sizes');
    if (node.complete && node.naturalWidth) {
      copy.src = node.currentSrc || node.src;
      copy.loading = 'eager';
      copy.decoding = 'sync';
    } else {
      // Never start an off-screen/lazy network request just for a transition.
      copy.removeAttribute('src');
      copy.style.width = node.clientWidth + 'px';
      copy.style.height = node.clientHeight + 'px';
    }
  }
  if (copy instanceof HTMLInputElement && node instanceof HTMLInputElement) {
    if (node.type !== 'file') copy.value = node.value;
    copy.checked = node.checked;
  }
  if (copy instanceof HTMLTextAreaElement && node instanceof HTMLTextAreaElement) copy.value = node.value;

  if (node.getAnimations().length && (copy instanceof HTMLElement || copy instanceof SVGElement)) {
    const computed = getComputedStyle(node);
    for (const property of FREEZE) copy.style.setProperty(property, computed.getPropertyValue(property));
  }
  if (incoming && copy instanceof HTMLElement && node.matches('[data-reveal], .realm-panel[data-active="true"]')) {
    Object.assign(copy.style, { opacity: '1', transform: 'none', filter: 'none' });
  }
  for (const child of node.childNodes) {
    const still = freeze(child, incoming);
    if (still) copy.append(still);
  }
  return copy;
}

export function capturePage(incoming = false): PageSnapshot {
  const width = document.documentElement.clientWidth;
  const height = window.innerHeight;
  const theme = document.documentElement.dataset.theme || 'dawn';
  const lang = document.documentElement.lang;
  const css = pageStyles();
  const body = freeze(document.body, incoming) as HTMLElement;
  Object.assign(body.style, {
    position: 'absolute',
    top: -window.scrollY + 'px',
    left: '0',
    width: width + 'px',
    margin: '0',
  });
  const ready = Promise.allSettled(Array.from(body.querySelectorAll('img[src]'), (img) => (img as HTMLImageElement).decode()));

  return {
    ready,
    mount(parent) {
      const host = document.createElement('div');
      host.className = 'transition-snapshot';
      host.dataset.theme = theme;
      host.lang = lang;
      host.inert = true;
      host.setAttribute('aria-hidden', 'true');
      Object.assign(host.style, {
        position: 'absolute', inset: '0', width: width + 'px', height: height + 'px',
        overflow: 'hidden', contain: 'strict', pointerEvents: 'none',
      });
      const shadow = host.attachShadow({ mode: 'open' });
      try {
        let sheet = sheets.get(css);
        if (!sheet) {
          sheet = new CSSStyleSheet();
          sheet.replaceSync(css);
          if (sheets.size >= 4) sheets.clear();
          sheets.set(css, sheet);
        }
        shadow.adoptedStyleSheets = [sheet];
      } catch {
        const style = document.createElement('style');
        style.textContent = css;
        shadow.append(style);
      }
      shadow.append(body.cloneNode(true));
      parent.append(host);
      return host;
    },
  };
}
