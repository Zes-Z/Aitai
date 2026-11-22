'use client';

import { useEffect, useState } from 'react';
import GradientWaves from './GradientWaves';

/**
 * ReactBits Gradient Waves, mounted only for the sea theme.
 * Parameters come from the ocean preset URL.
 */
export default function SeaWaves() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(document.documentElement.dataset.theme === 'sea');
    sync();
    window.addEventListener('aitai:theme', sync);
    return () => window.removeEventListener('aitai:theme', sync);
  }, []);

  if (!active) return null;

  return (
    <div className="sea-waves-layer" aria-hidden="true">
      <GradientWaves
        horizonColor="#2563eb"
        waveColor="#38bdf8"
        crestColor="#e0f2fe"
        speed={0.5}
        amplitude={1.8}
        waveScale={0.9}
        swell={25}
        turbulence={28}
        lightAngle={150}
        lightMode={false}
        intro
        quality="medium"
        dpr={2}
      />
    </div>
  );
}
