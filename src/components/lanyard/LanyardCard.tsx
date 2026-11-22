'use client';

import type { ReactNode } from 'react';
import Lanyard from './Lanyard';
import SpotlightCard from './SpotlightCard/SpotlightCard';
import './LanyardCard.css';

type Lang = 'zh' | 'en' | 'ja';

interface Counts {
  languages: number;
  notes: number;
  photos: number;
  projects: number;
}

interface Props {
  frontImage: string;
  backImage: string;
  lang: Lang;
  quote: string;
  counts: Counts;
}

const LABELS: Record<Lang, { back: string; side: string; languages: string; notes: string; photos: string; projects: string; footer: string }> = {
  zh: { back: '聚光灯', side: '背面', languages: '语言', notes: '随想', photos: '照片', projects: '项目', footer: '拖动 · 点击翻面' },
  en: { back: 'SPOTLIGHT', side: 'BACK', languages: 'LANGUAGES', notes: 'NOTES', photos: 'PHOTOS', projects: 'PROJECTS', footer: 'DRAG · CLICK TO FLIP' },
  ja: { back: 'スポットライト', side: '裏面', languages: '言語', notes: '随想', photos: '写真', projects: 'プロジェクト', footer: 'ドラッグ · クリックで裏返す' },
};

function BackSpotlight({ lang, quote, counts }: { lang: Lang; quote: string; counts: Counts }): ReactNode {
  const l = LABELS[lang];
  const stats = [
    { value: counts.languages, label: l.languages },
    { value: counts.notes, label: l.notes },
    { value: counts.photos, label: l.photos },
    { value: counts.projects, label: l.projects },
  ];

  return (
    <SpotlightCard
      className="lanyard-spotlight"
      theme="dark"
      spotlightColor="#ffd9a0"
      intensity={0.32}
      spotlightSize={240}
      borderGlow={0.9}
      softness={0.65}
      grain={0.18}
      flare
      ambient
    >
      <div className="lanyard-back-inner">
        <div className="lanyard-back-top">
          <span className="lanyard-back-kicker">{l.back}</span>
          <span className="lanyard-back-side">{l.side} / 02</span>
        </div>
        <p className="lanyard-back-quote">{quote}</p>
        <div className="lanyard-back-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="lanyard-back-footer">
          <span>AITAI / KIM / 2026</span>
          <span>{l.footer}</span>
        </div>
      </div>
    </SpotlightCard>
  );
}

export default function LanyardCard({ frontImage, backImage, lang, quote, counts }: Props) {
  return (
    <Lanyard
      frontImage={frontImage}
      backImage={backImage}
      backContent={<BackSpotlight lang={lang} quote={quote} counts={counts} />}
      imageFit="cover"
      cardColor="#0b0b12"
      orientation="portrait"
      finish="matte"
      cornerRadius={0.22}
      size={0.55}
      anchor="center"
      strapLength={0.55}
      strapColor="#1a1a26"
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
