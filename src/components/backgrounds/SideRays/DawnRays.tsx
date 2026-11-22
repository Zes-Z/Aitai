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
      <SideRays />
    </div>
  );
}
