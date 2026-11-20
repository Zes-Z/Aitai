/**
 * Frame / Curtain / Slices choreography adapted from codrops/interlude (MIT).
 * Native Web Animations, isolated still-page copies and Aitai's own palette.
 * License: third-party/interlude-LICENSE.txt
 */
import type { ThemeId } from '../types';
import { capturePage } from './snapshot';

export type LanguageStyle = 'frame' | 'curtain' | 'slices';
export const languageStyle: Record<ThemeId, LanguageStyle> = {
  dawn: 'frame',
  sea: 'curtain',
  star: 'slices',
};

export interface TransitionContext {
  root: HTMLElement;
  direction: 1 | -1;
  reduced: boolean;
  signal: AbortSignal;
  animate(element: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions): Promise<void>;
}

export interface Effect {
  leave(): Promise<void>;
  enter(): Promise<void>;
}

export function panel(root: HTMLElement, name: string, style: Partial<CSSStyleDeclaration> = {}) {
  const el = document.createElement('div');
  el.className = 'transition-panel ' + name;
  Object.assign(el.style, style);
  root.append(el);
  return el;
}

const FULL = 'inset(0% 0% 0% 0%)';
const SMALL = 'inset(50% 35% 50% 35%)';
const EASE = 'cubic-bezier(.76,0,.24,1)';
const GROW = 'cubic-bezier(.16,1,.3,1)';

export function createLanguageEffect(style: LanguageStyle, ctx: TransitionContext): Effect {
  const { root, animate, direction } = ctx;
  if (ctx.reduced) {
    const cover = panel(root, 'language-soft-cover', { opacity: '0' });
    return {
      leave: () => animate(cover, [{ opacity: 0 }, { opacity: 1 }], { duration: 100 }),
      enter: () => animate(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 100 }),
    };
  }

  if (style === 'curtain') {
    const under = panel(root, 'language-curtain language-curtain--under');
    const front = panel(root, 'language-curtain language-curtain--front');
    const origin = direction > 0 ? '50% 100%' : '50% 0%';
    for (const el of [under, front]) {
      el.style.transformOrigin = origin;
      el.style.transform = 'scaleY(0)';
    }
    return {
      async leave() {
        const content = document.querySelector<HTMLElement>('.site-main');
        await Promise.all([
          animate(under, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 660, easing: EASE }),
          animate(front, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 690, delay: 70, easing: EASE }),
          ...(content ? [animate(content, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(' + -direction * 64 + 'px)', opacity: .35 }], { duration: 760, easing: EASE })] : []),
        ]);
      },
      async enter() {
        const content = document.querySelector<HTMLElement>('.site-main');
        for (const el of [under, front]) el.style.transformOrigin = direction > 0 ? '50% 0%' : '50% 100%';
        await Promise.all([
          animate(front, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 780, easing: GROW }),
          animate(under, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 780, delay: 75, easing: GROW }),
          ...(content ? [animate(content, [{ transform: 'translateY(' + direction * 64 + 'px)', opacity: .35 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 850, easing: GROW })] : []),
        ]);
      },
    };
  }

  const oldPage = capturePage();
  let oldHost: HTMLElement;
  return {
    async leave() {
      await oldPage.ready;
      if (ctx.signal.aborted) return;
      oldHost = oldPage.mount(root);
    },
    async enter() {
      const nextPage = capturePage(true);
      await nextPage.ready;
      if (ctx.signal.aborted) return;

      if (style === 'frame') {
        const mat = panel(root, 'language-frame-mat', { clipPath: direction > 0 ? SMALL : FULL });
        if (direction > 0) {
          const view = panel(root, 'language-frame-view', { clipPath: SMALL });
          nextPage.mount(view);
          await Promise.all([
            animate(mat, [{ clipPath: SMALL }, { clipPath: FULL }], { duration: 1100, easing: GROW }),
            animate(view, [{ clipPath: SMALL }, { clipPath: FULL }], { duration: 1100, delay: 145, easing: GROW }),
          ]);
        } else {
          root.insertBefore(mat, oldHost);
          await Promise.all([
            animate(oldHost, [{ clipPath: FULL }, { clipPath: SMALL }], { duration: 820, easing: EASE }),
            animate(mat, [{ clipPath: FULL }, { clipPath: SMALL }], { duration: 820, delay: 140, easing: EASE }),
          ]);
        }
        return;
      }

      const width = document.documentElement.clientWidth;
      const height = window.innerHeight;
      const count = width < 768 ? 3 : 5;
      const gap = 16;
      const columns: Array<{ old: HTMLElement; next: HTMLElement }> = [];
      const stage = panel(root, 'language-slices');
      for (let i = 0; i < count; i++) {
        const left = i * width / count;
        const box = panel(stage, 'language-slice', { left: left + 'px', width: width / count + 1 + 'px' });
        const old = panel(box, 'language-slice-frame');
        const oldView = panel(old, 'language-slice-page', { left: -left + 'px', width: width + 'px' });
        oldPage.mount(oldView);
        const next = panel(box, 'language-slice-frame', { transform: 'translateY(' + direction * (height + gap) + 'px)' });
        const newView = panel(next, 'language-slice-page', { left: -left + 'px', width: width + 'px' });
        nextPage.mount(newView);
        columns.push({ old, next });
      }
      oldHost.remove();
      const ordered = direction > 0 ? columns : [...columns].reverse();
      await Promise.all(ordered.flatMap((column, i) => [
        animate(column.old, [{ transform: 'translateY(0)' }, { transform: 'translateY(' + -direction * (height + gap) + 'px)' }], { duration: 850, delay: i * 65, easing: EASE }),
        animate(column.next, [{ transform: 'translateY(' + direction * (height + gap) + 'px)' }, { transform: 'translateY(0)' }], { duration: 850, delay: i * 65, easing: EASE }),
      ]));
    },
  };
}
