'use client';

import { useEffect, useRef, useState } from 'react';
import SideRays from './SideRays';

/**
 * ReactBits Side Rays, mounted only for the dawn theme.
 * Follow-mouse is off; a click gives the light a short intensity pulse.
 * Warm sunrise palette / brighter glow than the source defaults.
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
      <SideRays
        rayColor1="#ffb26f39"
        rayColor2="#ffef8b"
        blend={0.45}
        speed={2.4}
        intensity={pulse ? 3.4 : 2.7}
        spread={2.2}
        density={6}
        sharpness={0.5}
        glow={1.65}
        saturation={1.2}
        dust={0.14}
        followMouse={false}
      />
    </div>
  );
}
