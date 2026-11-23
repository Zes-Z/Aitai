/*!
 * Default Fade Content effect adapted for Astro's cloned content sheets.
 * Source: https://reactbits.dev/animations/fade-content
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

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Fade each portfolio block once as it enters the sheet's own scroll area. */
export function mountFadeContent(content: HTMLElement, scroller: HTMLElement, duration = 0.6): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const targets = [
    ...content.querySelectorAll<HTMLElement>('[data-fade-content]'),
    ...content.querySelectorAll<HTMLElement>('[data-portfolio-narrative] > *'),
  ];
  let frame = 0;
  const context = gsap.context(() => {
    for (const target of targets) {
      const reveal = gsap.fromTo(target, { autoAlpha: 0 }, {
        autoAlpha: 1,
        duration,
        ease: 'power2.out',
        paused: true,
      });
      ScrollTrigger.create({
        trigger: target,
        scroller,
        start: () => {
          const top = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
          const limit = scroller.scrollHeight - scroller.clientHeight;
          return Math.min(top - scroller.clientHeight * 0.9, Math.max(0, limit - 1));
        },
        once: true,
        onEnter: () => reveal.play(),
      });
    }
  }, content);

  const resize = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => ScrollTrigger.refresh());
  });
  resize.observe(content);
  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    context.revert();
  };
}

