'use client';

import { useEffect, useState } from 'react';
import Galaxy from './Galaxy';

/**
 * ReactBits Galaxy, mounted only while the star theme is active.
 * The component itself is copied from the ReactBits source (no re-implementation).
 */
export default function GalaxyBackground() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(document.documentElement.dataset.theme === 'star');
    sync();
    window.addEventListener('aitai:theme', sync);
    return () => window.removeEventListener('aitai:theme', sync);
  }, []);

  if (!active) return null;

  return (
    <div className="galaxy-layer" aria-hidden="true">
      <Galaxy
        transparent
        starSpeed={0.32}
        density={0.95}
        hueShift={210}
        glowIntensity={0.4}
        opacity={0.85}
        saturation={0.08}
        twinkleIntensity={0.45}
        rotationSpeed={0.05}
        mouseInteraction={false}
        layers={5}
        starSize={1}
        flareIntensity={1.1}
        intro
        direction="forward"
        dpr={1.5}
      />
    </div>
  );
}
