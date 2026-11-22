'use client';

import { useEffect, useState } from 'react';
import Lanyard from './Lanyard';
import type { LanyardTheme } from './faces';

type FaceSet = { front: string; back: string };
interface Props {
  faces: Record<LanyardTheme, FaceSet>;
}

const CARD_COLOR: Record<LanyardTheme, string> = {
  dawn: '#f6e3cf',
  sea: '#062b33',
  star: '#0b1020',
};
const STRAP_COLOR: Record<LanyardTheme, string> = {
  dawn: '#4a332d',
  sea: '#0b2a30',
  star: '#1a1a26',
};

export default function HeroLanyard({ faces }: Props) {
  const [theme, setTheme] = useState<LanyardTheme>('dawn');

  useEffect(() => {
    const sync = () => {
      const value = document.documentElement.dataset.theme;
      if (value === 'dawn' || value === 'sea' || value === 'star') setTheme(value);
    };
    sync();
    window.addEventListener('aitai:theme', sync);
    return () => window.removeEventListener('aitai:theme', sync);
  }, []);

  const face = faces[theme] ?? faces.dawn;

  return (
    <Lanyard
      className="hero-lanyard"
      frontImage={face.front}
      backImage={face.back}
      imageFit="cover"
      cardColor={CARD_COLOR[theme]}
      orientation="portrait"
      finish="matte"
      cornerRadius={0.2}
      size={0.56}
      anchor="center"
      strapLength={0.35}
      strapColor={STRAP_COLOR[theme]}
      strapWidth={0.72}
      metal="silver"
      gravity={0.9}
      damping={0.55}
      elasticity={0.5}
      breeze={0.35}
      interactive
      intro
    />
  );
}
