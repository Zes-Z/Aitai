'use client';

import { useEffect, useState } from 'react';
import Lanyard from './Lanyard';
import type { LanyardTheme } from './faces';

interface Props {
  faces: Record<LanyardTheme, string>;
  backImage: string;
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

export default function HeroLanyard({ faces, backImage }: Props) {
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

  return (
    <Lanyard
      className="hero-lanyard"
      frontImage={faces[theme] ?? faces.dawn}
      backImage={backImage}
      imageFit="cover"
      cardColor={CARD_COLOR[theme]}
      orientation="landscape"
      finish="matte"
      cornerRadius={0.16}
      size={0.38}
      anchor="right"
      strapLength={0.3}
      strapColor={STRAP_COLOR[theme]}
      strapWidth={0.72}
      metal="silver"
      gravity={0.25}
      damping={0.3}
      elasticity={0.1}
      breeze={0}
      interactive
      intro={false}
    />
  );
}
