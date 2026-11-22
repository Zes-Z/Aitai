'use client';

import { useEffect, useState } from 'react';
import CrystalizedBall from './CrystalizedBall/CrystalizedBall';

/**
 * ReactBits Crystalized Ball, mounted only for the sea theme.
 * The URL preset is kept; size is raised to fill the 46px control orb.
 */
export default function SeaCrystalOrb() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(document.documentElement.dataset.theme === 'sea');
    sync();
    window.addEventListener('aitai:theme', sync);
    return () => window.removeEventListener('aitai:theme', sync);
  }, []);

  if (!active) return null;

  return (
    <CrystalizedBall
      preset="eclipse"
      color="#BABABA"
      size={0.9}
      strands={3}
      sparks={0}
      particleCount={500}
      haze={0}
      dustSpeed={1.65}
      glow={0.7}
      particleShape="round"
      flares={0.05}
      depth={0.65}
      twinkle={0.1}
      speed={1.8}
      hoverStrength={0.9}
      fill={0.95}
      crackle={0.3}
      intro={false}
      interactive={false}
      paused={false}
      theme="dark"
    />
  );
}
