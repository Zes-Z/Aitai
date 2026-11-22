import type { Lang } from '../../types';

export type LanyardTheme = 'dawn' | 'sea' | 'star';

export interface LanyardFaceCounts {
  languages: number;
  notes: number;
  photos: number;
  projects: number;
}

export interface LanyardFaceData {
  lang: Lang;
  name: string;
  nameJa: string;
  available: string;
  status: string;
  location: string;
  quote: string;
  avatar: string;
  counts: LanyardFaceCounts;
}

interface FacePalette {
  bg1: string;
  bg2: string;
  bg3: string;
  halo1: string;
  halo2: string;
  text: string;
  accent: string;
  gold: string;
  back1: string;
  back2: string;
  back3: string;
  spot1: string;
  spot2: string;
  spot3: string;
  watermark: string;
  pillText: string;
}

const PALETTES: Record<LanyardTheme, FacePalette> = {
  dawn: {
    bg1: '#fbf2e7', bg2: '#f6e3cf', bg3: '#efcdb2',
    halo1: '#e98b6a', halo2: '#ffd9a6',
    text: '#2a2022', accent: '#c75c33', gold: '#b8552f',
    back1: '#fbf0e4', back2: '#f7dfc8', back3: '#efcbb2',
    spot1: '#e98b6a', spot2: '#ffd9a6', spot3: '#f3b98f',
    watermark: '#c75c33', pillText: '#7a2f18',
  },
  sea: {
    bg1: '#03131a', bg2: '#062b33', bg3: '#0b4a52',
    halo1: '#6fe7de', halo2: '#9fe8e0',
    text: '#eaf7f5', accent: '#6fe7de', gold: '#fff6e6',
    back1: '#021018', back2: '#042028', back3: '#0b4a52',
    spot1: '#a9f3e8', spot2: '#6fe7de', spot3: '#fff6e6',
    watermark: '#6fe7de', pillText: '#d9fffa',
  },
  star: {
    bg1: '#070811', bg2: '#0b1020', bg3: '#131327',
    halo1: '#6fe7de', halo2: '#8fb3ff',
    text: '#f7f0e8', accent: '#6fe7de', gold: '#ffd9a0',
    back1: '#090a10', back2: '#101021', back3: '#171126',
    spot1: '#ffd9a0', spot2: '#f3a66d', spot3: '#6fe7de',
    watermark: '#ffffff', pillText: '#d9fffa',
  },
};

type Labels = {
  identity: string;
  open: string;
  now: string;
  location: string;
  trilingual: string;
  back: string;
  side: string;
  notes: string;
  photos: string;
  projects: string;
  flip: string;
  languages: string;
};

const LABELS: Record<Lang, Labels> = {
  zh: {
    identity: '身份卡', open: '可接新项目', now: '现在', location: '所在地',
    trilingual: '三语', back: '聚光灯', side: '背面', notes: '随想', photos: '照片',
    projects: '项目', flip: '拖动 · 点击翻面', languages: '语言',
  },
  en: {
    identity: 'IDENTITY CARD', open: 'OPEN TO WORK', now: 'NOW', location: 'LOCATION',
    trilingual: 'TRILINGUAL', back: 'SPOTLIGHT', side: 'BACK SIDE', notes: 'NOTES', photos: 'PHOTOS',
    projects: 'PROJECTS', flip: 'DRAG · CLICK TO FLIP', languages: 'LANGUAGES',
  },
  ja: {
    identity: 'ID CARD', open: '新しい仕事を受け付けています', now: 'いま', location: '場所',
    trilingual: '三言語', back: 'スポットライト', side: '裏面', notes: '随想', photos: '写真',
    projects: 'プロジェクト', flip: 'ドラッグ · クリックで裏返す', languages: '言語',
  },
};

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const wrap = (text: string, max: number, limit = 3): string[] => {
  const source = text.includes(' ') ? text.split(/\s+/) : Array.from(text);
  const lines: string[] = [];
  let current = '';
  for (const token of source) {
    const candidate = text.includes(' ') ? (current ? current + ' ' : '') + token : current + token;
    if (candidate.length > max && current) {
      lines.push(current);
      current = token;
      if (lines.length >= limit) break;
    } else {
      current = candidate;
    }
  }
  if (current && lines.length < limit) lines.push(current);
  return lines;
};

const svgUrl = (svg: string) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

export function makeLanyardFaces(data: LanyardFaceData, theme: LanyardTheme = 'star'): { front: string; back: string } {
  const p = PALETTES[theme] ?? PALETTES.star;
  const l = LABELS[data.lang];
  const name = escapeXml(data.name);
  const nameJa = escapeXml(data.nameJa);
  const available = escapeXml(data.available);
  const status = escapeXml(data.status);
  const location = escapeXml(data.location);
  const quote = wrap(data.quote, data.lang === 'en' ? 16 : 9, 3).map(escapeXml);
  const quoteText = quote.map((line, i) => `<text x="70" y="${330 + i * 62}" class="quote">${line}</text>`).join('');

  const front = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1020" viewBox="0 0 720 1020">
  <style>
  .mono { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 21px; letter-spacing: 2.6px; text-transform: uppercase; }
  .tiny { font-size: 16px; letter-spacing: 3px; }
  .end { text-anchor: end; }
  .name { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 112px; letter-spacing: -4px; fill: ${p.text}; }
  .value { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 28px; letter-spacing: .3px; fill: ${p.text}; }
  .watermark { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 112px; letter-spacing: -4px; fill: ${p.watermark}; fill-opacity: .06; }
  .quote { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 42px; letter-spacing: -1px; fill: ${p.text}; }
  .stat { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 72px; fill: ${p.gold}; }
</style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg1}"/><stop offset=".55" stop-color="${p.bg2}"/><stop offset="1" stop-color="${p.bg3}"/>
    </linearGradient>
    <radialGradient id="halo" cx=".76" cy=".16" r=".62">
      <stop offset="0" stop-color="${p.halo1}" stop-opacity=".27"/><stop offset=".45" stop-color="${p.halo2}" stop-opacity=".09"/><stop offset="1" stop-color="${p.halo2}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="52" height="52" patternUnits="userSpaceOnUse"><path d="M52 0H0V52" fill="none" stroke="${p.text}" stroke-opacity=".045"/></pattern>
    <clipPath id="avatar"><circle cx="126" cy="222" r="58"/></clipPath>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="720" height="1020" rx="48" fill="url(#bg)"/>
  <rect width="720" height="1020" rx="48" fill="url(#halo)"/>
  <rect width="720" height="1020" rx="48" fill="url(#grid)" opacity=".65"/>
  <rect x="30" y="30" width="660" height="960" rx="38" fill="none" stroke="${p.text}" stroke-opacity=".14"/>
  <text x="64" y="102" class="mono" fill="${p.text}" fill-opacity=".8">AITAI / 会いたい</text>
  <text x="656" y="102" class="mono end" fill="${p.text}" fill-opacity=".5">ID / 2026</text>
  <text x="64" y="148" class="mono tiny" fill="${p.text}" fill-opacity=".38">${l.identity}</text>

  <circle cx="126" cy="222" r="65" fill="${p.text}" fill-opacity=".07"/>
  <image href="${data.avatar}" x="68" y="164" width="116" height="116" clip-path="url(#avatar)" preserveAspectRatio="xMidYMid slice"/>
  <circle cx="126" cy="222" r="58" fill="none" stroke="${p.accent}" stroke-opacity=".55"/>
  <text x="212" y="252" class="name">${name}</text>
  <text x="216" y="294" class="mono" fill="${p.text}" fill-opacity=".55">${nameJa} / ${name}</text>

  <rect x="64" y="338" width="368" height="54" rx="27" fill="${p.accent}" fill-opacity=".09" stroke="${p.accent}" stroke-opacity=".42"/>
  <circle cx="92" cy="365" r="4" fill="${p.accent}"/>
  <text x="108" y="372" class="mono" fill="${p.pillText}">${available}</text>

  <text x="64" y="446" class="mono tiny" fill="${p.text}" fill-opacity=".38">${l.now}</text>
  <text x="64" y="488" class="value">${status}</text>
  <text x="64" y="556" class="mono tiny" fill="${p.text}" fill-opacity=".38">${l.location}</text>
  <text x="64" y="598" class="value">${location}</text>
  <text x="64" y="666" class="mono tiny" fill="${p.text}" fill-opacity=".38">${l.trilingual}</text>
  <text x="64" y="708" class="value">ZH / EN / JA</text>

  <g fill="${p.text}" fill-opacity=".68">
    <rect x="64" y="786" width="3" height="46"/><rect x="73" y="786" width="7" height="46"/><rect x="86" y="786" width="2" height="46"/><rect x="95" y="786" width="10" height="46"/><rect x="111" y="786" width="3" height="46"/><rect x="120" y="786" width="6" height="46"/><rect x="132" y="786" width="2" height="46"/><rect x="141" y="786" width="9" height="46"/><rect x="156" y="786" width="3" height="46"/><rect x="165" y="786" width="5" height="46"/>
  </g>
  <text x="64" y="884" class="mono" fill="${p.text}" fill-opacity=".72">AITAI.SITE</text>
  <text x="656" y="884" class="mono end" fill="${p.text}" fill-opacity=".42">KIM / 2026</text>
  <text x="656" y="952" text-anchor="end" class="watermark">会いたい</text>
  <rect width="720" height="1020" rx="48" filter="url(#grain)" opacity=".045" fill="${p.text}"/>
</svg>`;

  const stats = [
    { value: data.counts.languages, label: l.languages },
    { value: data.counts.notes, label: l.notes },
    { value: data.counts.photos, label: l.photos },
    { value: data.counts.projects, label: l.projects },
  ];
  const statsSvg = stats.map((stat, i) => {
    const x = 70 + (i % 2) * 300;
    const y = 590 + Math.floor(i / 2) * 170;
    return `<text x="${x}" y="${y}" class="stat">${stat.value}</text><text x="${x}" y="${y + 34}" class="mono tiny" fill="${p.text}" fill-opacity=".44">${escapeXml(stat.label)}</text>`;
  }).join('');

  const back = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1020" viewBox="0 0 720 1020">
  <style>
  .mono { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 21px; letter-spacing: 2.6px; text-transform: uppercase; }
  .tiny { font-size: 16px; letter-spacing: 3px; }
  .end { text-anchor: end; }
  .quote { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 42px; letter-spacing: -1px; fill: ${p.text}; }
  .stat { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 72px; fill: ${p.gold}; }
</style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.back1}"/><stop offset=".58" stop-color="${p.back2}"/><stop offset="1" stop-color="${p.back3}"/>
    </linearGradient>
    <radialGradient id="spot" cx=".72" cy=".24" r=".62">
      <stop offset="0" stop-color="${p.spot1}" stop-opacity=".38"/><stop offset=".26" stop-color="${p.spot2}" stop-opacity=".16"/><stop offset=".58" stop-color="${p.spot3}" stop-opacity=".1"/><stop offset="1" stop-color="${p.spot3}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="border" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.gold}" stop-opacity=".7"/><stop offset=".5" stop-color="${p.text}" stop-opacity=".1"/><stop offset="1" stop-color="${p.accent}" stop-opacity=".55"/>
    </linearGradient>
    <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="${p.text}" stroke-opacity=".055"/></pattern>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="720" height="1020" rx="48" fill="url(#bg)"/>
  <rect width="720" height="1020" rx="48" fill="url(#spot)"/>
  <rect width="720" height="1020" rx="48" fill="url(#grid)" opacity=".8"/>
  <rect x="30" y="30" width="660" height="960" rx="38" fill="none" stroke="url(#border)" stroke-width="1.5"/>
  <text x="64" y="100" class="mono" fill="${p.gold}" fill-opacity=".9">${l.back}</text>
  <text x="656" y="100" class="mono end" fill="${p.text}" fill-opacity=".45">${l.side} / 02</text>
  <circle cx="628" cy="178" r="52" fill="${p.gold}" fill-opacity=".09"/>
  <circle cx="628" cy="178" r="34" fill="none" stroke="${p.gold}" stroke-opacity=".4"/>
  <circle cx="628" cy="178" r="4" fill="${p.gold}"/>

  <text x="64" y="238" class="mono tiny" fill="${p.text}" fill-opacity=".4">A NOTE FROM THE OTHER SIDE</text>
  ${quoteText}

  ${statsSvg}
  <line x1="64" y1="900" x2="656" y2="900" stroke="${p.text}" stroke-opacity=".12"/>
  <text x="64" y="944" class="mono" fill="${p.text}" fill-opacity=".66">AITAI / KIM / 2026</text>
  <text x="656" y="944" class="mono end" fill="${p.gold}" fill-opacity=".8">${l.flip}</text>
  <rect width="720" height="1020" rx="48" filter="url(#grain)" opacity=".05" fill="${p.text}"/>
</svg>`;

  return { front: svgUrl(front), back: svgUrl(back) };
}
