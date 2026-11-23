/*!
 * Adapted from React Bits Chroma Grid — https://reactbits.dev/components/chroma-grid
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * ## Commons Clause Restriction
 *
 * You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**
 *
 * The same restriction covers the React Bits tools (Background Studio, Texture Lab, Shape Magic, Center Stage, Sound Lab and any tools added later) and the sounds in the sound library. **You may not sell, sublicense, or redistribute the tools or the sounds themselves, or offer the tools or a substantially similar copy of them as a hosted service-whether alone, in a bundle, or as a ported version.**
 *
 * What you make with the tools is yours to use. You can use exported code, images, videos, and audio files in any personal or commercial application, website, or product, including paid ones. **You may not sell or redistribute the exports on their own, either individually or as the product itself, such as a sound, texture, background, or template pack.**
 *
 * ## No Warranty
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use client';

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
import './ChromaGrid.css';

export interface ChromaItem {
  image: string;
  id?: string;
  sheetKey?: string;
  title?: string;
  subtitle?: string;
  accent?: string;
  url?: string;
  alt?: string;
  borderColor?: string;
}

export interface ChromaGridProps {
  items?: ChromaItem[];
  columns?: number;
  minCardWidth?: number;
  gap?: number;
  radius?: number;
  softness?: number;
  damping?: number;
  fadeOut?: number;
  grayscale?: number;
  dim?: number;
  glow?: number;
  borderGlow?: number;
  reveal?: 'spotlight' | 'card';
  aspectRatio?: string;
  cardRadius?: number;
  showInfo?: boolean;
  frame?: boolean;
  theme?: 'dark' | 'light' | 'site';
  className?: string;
}

const THEMES: Record<'dark' | 'light', Record<string, string>> = {
  dark: {
    '--chroma-frame': 'rgba(38, 35, 46, 0.66)',
    '--chroma-frame-edge': 'rgba(255, 255, 255, 0.08)',
    '--chroma-frame-highlight': 'rgba(255, 255, 255, 0.07)',
    '--chroma-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--chroma-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
    '--chroma-tile-edge': 'rgba(255, 255, 255, 0.07)',
    '--chroma-tile-highlight': 'rgba(255, 255, 255, 0.12)',
    '--chroma-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
    '--chroma-media-edge': 'rgba(255, 255, 255, 0.06)',
    '--chroma-well': 'rgba(255, 255, 255, 0.08)',
    '--chroma-ink': '#f4f4f5',
    '--chroma-muted': 'rgba(244, 244, 245, 0.55)',
    '--chroma-hover': 'brightness(1.12)',
    '--chroma-press': 'brightness(0.85)'
  },
  light: {
    '--chroma-frame': 'rgba(240, 240, 243, 0.8)',
    '--chroma-frame-edge': 'rgba(24, 24, 27, 0.07)',
    '--chroma-frame-highlight': 'rgba(255, 255, 255, 0.95)',
    '--chroma-frame-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
    '--chroma-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--chroma-tile-edge': 'rgba(24, 24, 27, 0.08)',
    '--chroma-tile-highlight': 'rgba(255, 255, 255, 1)',
    '--chroma-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)',
    '--chroma-media-edge': 'rgba(24, 24, 27, 0.06)',
    '--chroma-well': 'rgba(24, 24, 27, 0.05)',
    '--chroma-ink': '#27272a',
    '--chroma-muted': 'rgba(39, 39, 42, 0.55)',
    '--chroma-hover': 'brightness(0.97)',
    '--chroma-press': 'brightness(0.92)'
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const falloffStops = (softness: number) => {
  const core = clamp(1 - softness, 0, 0.95);
  const stops = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const u = clamp((t - core) / Math.max(0.0001, 1 - core), 0, 1);
    const alpha = 1 - u * u * u * (u * (u * 6 - 15) + 10);
    stops.push(`rgba(0, 0, 0, ${alpha.toFixed(3)}) ${(t * 100).toFixed(1)}%`);
  }
  return stops.join(', ');
};

export const ChromaGrid = ({
  items,
  columns = 3,
  minCardWidth = 230,
  gap = 20,
  radius = 260,
  softness = 0.6,
  damping = 0.45,
  fadeOut = 0.6,
  grayscale = 1,
  dim = 0.12,
  glow = 0.5,
  borderGlow = 1,
  reveal = 'spotlight',
  aspectRatio = '3 / 2',
  cardRadius = 6,
  showInfo = true,
  frame = false,
  theme = 'site',
  className = ''
}: ChromaGridProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<{ damping: number; fadeOut: number; spotlight: boolean } | null>(null);
  const placeRef = useRef<(() => void) | null>(null);
  const data = items ?? [];
  settingsRef.current = { damping, fadeOut, spotlight: reveal !== 'card' };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const state = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0, primed: false };
    let raf = 0;
    let last = 0;

    const place = () => {
      const box = root.getBoundingClientRect();
      root.querySelectorAll<HTMLElement>('[data-chroma-area]').forEach(node => {
        const rect = node.getBoundingClientRect();
        node.style.setProperty('--chroma-ox', `${rect.left - box.left}px`);
        node.style.setProperty('--chroma-oy', `${rect.top - box.top}px`);
      });
    };
    placeRef.current = place;

    const frame = (now: number) => {
      raf = 0;
      const s = settingsRef.current;
      if (!s) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const follow = reduce ? 1 : 1 - Math.exp(-dt / Math.max(0.01, s.damping * 0.32));
      state.x += (state.tx - state.x) * follow;
      state.y += (state.ty - state.y) * follow;
      const span = state.target > state.power ? 0.1 : Math.max(0.02, s.fadeOut * 0.35);
      state.power += (state.target - state.power) * (reduce ? 1 : 1 - Math.exp(-dt / span));
      root.style.setProperty('--chroma-x', `${state.x.toFixed(2)}px`);
      root.style.setProperty('--chroma-y', `${state.y.toFixed(2)}px`);
      root.style.setProperty('--chroma-power', state.power.toFixed(4));
      const settled =
        Math.abs(state.tx - state.x) < 0.1 &&
        Math.abs(state.ty - state.y) < 0.1 &&
        Math.abs(state.target - state.power) < 0.002;
      if (settled) {
        state.power = state.target;
        root.style.setProperty('--chroma-power', state.power.toFixed(4));
        last = 0;
      } else {
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      if (!settingsRef.current?.spotlight) return;
      const box = root.getBoundingClientRect();
      state.tx = event.clientX - box.left;
      state.ty = event.clientY - box.top;
      if (!state.primed || state.power < 0.02) {
        state.x = state.tx;
        state.y = state.ty;
        state.primed = true;
      }
      state.target = 1;
      wake();
    };

    const onLeave = () => {
      state.target = 0;
      wake();
    };

    const onFocus = (event: FocusEvent) => {
      const card = event.target instanceof Element ? event.target.closest('.chroma-card') : null;
      if (!(card instanceof HTMLElement)) return;
      const box = root.getBoundingClientRect();
      const rect = card.getBoundingClientRect();
      state.tx = rect.left - box.left + rect.width / 2;
      state.ty = rect.top - box.top + rect.height / 2;
      state.target = 1;
      wake();
    };
    const onBlur = (event: FocusEvent) => {
      if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) onLeave();
    };
    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(root);
    root.addEventListener('focusin', onFocus);
    root.addEventListener('focusout', onBlur);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerdown', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointercancel', onLeave);
    place();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('focusout', onBlur);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointercancel', onLeave);
      placeRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    placeRef.current?.();
  });

  const rootStyle = {
    ...(theme === 'site' ? {} : THEMES[theme]),
    '--chroma-cols': Math.max(1, Math.round(columns)),
    '--chroma-min': `${Math.max(80, minCardWidth)}px`,
    '--chroma-gap': `${Math.max(0, gap)}px`,
    '--chroma-r': `${Math.max(20, radius)}px`,
    '--chroma-stops': falloffStops(clamp(softness, 0, 1)),
    '--chroma-gray': clamp(grayscale, 0, 1),
    '--chroma-dim': clamp(dim, 0, 0.9),
    '--chroma-glow': clamp(glow, 0, 1),
    '--chroma-border': clamp(borderGlow, 0, 1),
    '--chroma-fade': `${Math.max(0, fadeOut)}s`,
    '--chroma-ratio': aspectRatio,
    '--chroma-radius': `${Math.max(0, cardRadius)}px`
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`chroma-grid${frame ? ' has-frame' : ''}${className ? ` ${className}` : ''}`}
      data-chroma-reveal={reveal === 'card' ? 'card' : 'spotlight'}
      style={rootStyle}
    >
      <div className="chroma-grid-inner">
        {data.map((item, index) => {
          const accent = item.accent ?? item.borderColor ?? 'var(--accent)';
          const key = item.id ?? `${item.title}-${index}`;
          const cardStyle = { '--chroma-accent': accent } as CSSProperties;
          const body = (
            <>
              <span className="chroma-wash" aria-hidden="true" />
              <div className="chroma-media" data-chroma-area="" data-sheet-source="">
                <img className="chroma-mono" src={item.image} alt={item.alt ?? item.title ?? ''} loading="lazy" />
                <img className="chroma-color" src={item.image} alt="" aria-hidden="true" loading="lazy" />
                <span className="chroma-media-rim" aria-hidden="true" />
              </div>
              {showInfo && (item.title || item.subtitle) && (
                <div className="chroma-info">
                  {item.title && <span className="chroma-title">{item.title}</span>}
                  {item.subtitle && <span className="chroma-subtitle">{item.subtitle}</span>}
                </div>
              )}
              <span className="chroma-card-rim" aria-hidden="true" />
              <span className="chroma-card-glow" aria-hidden="true" />
            </>
          );
          return item.sheetKey ? (
            <button
              type="button"
              key={key}
              className="chroma-card"
              data-chroma-area=""
              data-content-sheet-trigger={item.sheetKey}
              style={cardStyle}
              aria-label={item.title}
              aria-haspopup="dialog"
            >
              {body}
            </button>
          ) : item.url ? (
            <a
              key={key}
              className="chroma-card"
              data-chroma-area=""
              style={cardStyle}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {body}
            </a>
          ) : (
            <article key={key} className="chroma-card" data-chroma-area="" style={cardStyle}>
              {body}
            </article>
          );
        })}
      </div>
      {frame && <span className="chroma-frame-rim" aria-hidden="true" />}
    </div>
  );
};

export default ChromaGrid;

