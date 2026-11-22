'use client';

import { useEffect, useRef, useState } from 'react';
import SideRays from './SideRays';

/**
 * ReactBits Side Rays, mounted only for the dawn theme.
 * Follow-mouse is off; a click gives the light a short intensity pulse.
 */
export default function DawnRays() {
  const [active, setActive] = useState(false);
  const [pulse, setPulse] = useState(false);
  const pulseTimer = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => setActive(document.documentElement.dataset.theme === 'dawn');
    sync();
    window.addEventListener('aitai:theme', sync);
    return () => window.removeEventListener('aitai:theme', sync);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onClick = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target as Element | null;
      if (target?.closest('[data-content-depth], a, button, input, textarea, select, [role="button"]')) return;
      setPulse(true);
      if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
      pulseTimer.current = window.setTimeout(() => setPulse(false), 420);
    };
    window.addEventListener('pointerdown', onClick);
    return () => {
      window.removeEventListener('pointerdown', onClick);
      if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="dawn-rays-layer" aria-hidden="true">
      <SideRays followMouse={false} intensity={pulse ? 2.8 : 2} />
    </div>
  );
}
