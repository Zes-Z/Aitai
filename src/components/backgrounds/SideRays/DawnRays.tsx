'use client';

import { useEffect, useState } from 'react';
import SideRays from './SideRays';

/**
 * ReactBits Side Rays, mounted only for the dawn theme.
 * Source is shifted to the top-right control orb.
 */
export default function DawnRays() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(document.documentElement.dataset.theme === 'dawn');
    sync();
    window.addEventListener('aitai:theme', sync);
    return () => window.removeEventListener('aitai:theme', sync);
  }, []);

  if (!active) return null;

  return (
    <div className="dawn-rays-layer" aria-hidden="true">
      <SideRays
        origin="top-right"
        rayColor1="#F0A064"
        rayColor2="#FFD9A6"
        blend={0.35}
        speed={2}
        intensity={1.5}
        spread={2.1}
        density={6}
        sharpness={0.5}
        tilt={-10}
        falloff={1.4}
        glow={1.25}
        saturation={0.9}
        dust={0.14}
        followMouse={false}
        intro
        lightMode={false}
        opacity={0.9}
      />
    </div>
  );
}
