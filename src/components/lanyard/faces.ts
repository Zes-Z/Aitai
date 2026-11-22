import type { Lang } from '../../types';

export type LanyardTheme = 'dawn' | 'sea' | 'star';

export interface LanyardFaceData {
  lang: Lang;
  name: string;
  nameJa: string;
  age: number;
  location: string;
  motto: string;
  occupation: string;
}

interface Palette {
  bg1: string;
  bg2: string;
  bg3: string;
  halo: string;
  text: string;
  accent: string;
  gold: string;
  watermark: string;
}

const PALETTES: Record<LanyardTheme, Palette> = {
  dawn: {
    bg1: '#fbf2e7', bg2: '#f6e3cf', bg3: '#efcdb2',
    halo: '#e98b6a', text: '#2a2022', accent: '#c75c33', gold: '#b8552f', watermark: '#c75c33',
  },
  sea: {
    bg1: '#03131a', bg2: '#062b33', bg3: '#0b4a52',
    halo: '#6fe7de', text: '#eaf7f5', accent: '#6fe7de', gold: '#fff6e6', watermark: '#6fe7de',
  },
  star: {
    bg1: '#070811', bg2: '#0b1020', bg3: '#131327',
    halo: '#6fe7de', text: '#f7f0e8', accent: '#6fe7de', gold: '#ffd9a0', watermark: '#ffffff',
  },
};

type Labels = { identity: string; name: string; motto: string; practice: string; site: string };

const LABELS: Record<Lang, Labels> = {
  zh: { identity: '身份卡', name: '名字 · 年龄 · 居住地', motto: '座右铭', practice: '职业内容', site: 'AITAI.SITE' },
  en: { identity: 'IDENTITY CARD', name: 'NAME · AGE · HOME', motto: 'MOTTO', practice: 'PRACTICE', site: 'AITAI.SITE' },
  ja: { identity: 'ID CARD', name: '名前 · 年齢 · 場所', motto: '座右の銘', practice: '仕事', site: 'AITAI.SITE' },
};

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const wrap = (text: string, max: number, limit = 2): string[] => {
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

export function makeLanyardFront(data: LanyardFaceData, theme: LanyardTheme = 'star'): string {
  const p = PALETTES[theme] ?? PALETTES.star;
  const l = LABELS[data.lang];
  const name = escapeXml(data.name);
  const nameJa = escapeXml(data.nameJa);
  const location = escapeXml(data.location);
  const occupation = escapeXml(data.occupation);
  const motto = wrap(data.motto, data.lang === 'en' ? 34 : 22, 2).map(escapeXml);
  const mottoSvg = motto.map((line, i) => `<text x="64" y="${540 + i * 58}" class="motto">${line}</text>`).join('');

  const front = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1024" viewBox="0 0 1440 1024">
  <style>
  .mono { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 18px; letter-spacing: 2.6px; text-transform: uppercase; }
  .tiny { font-size: 14px; letter-spacing: 3px; }
  .end { text-anchor: end; }
  .name { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 142px; letter-spacing: -5px; fill: ${p.text}; }
  .meta { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 34px; letter-spacing: 1px; fill: ${p.text}; }
  .motto { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 48px; letter-spacing: -1px; fill: ${p.text}; }
  .value { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 34px; letter-spacing: .4px; fill: ${p.text}; }
  .watermark { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 130px; letter-spacing: -5px; fill: ${p.watermark}; fill-opacity: .055; }
</style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg1}"/><stop offset=".55" stop-color="${p.bg2}"/><stop offset="1" stop-color="${p.bg3}"/>
    </linearGradient>
    <radialGradient id="halo" cx=".78" cy=".18" r=".65">
      <stop offset="0" stop-color="${p.halo}" stop-opacity=".25"/><stop offset=".5" stop-color="${p.halo}" stop-opacity=".06"/><stop offset="1" stop-color="${p.halo}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M56 0H0V56" fill="none" stroke="${p.text}" stroke-opacity=".04"/></pattern>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="1440" height="1024" rx="44" fill="url(#bg)"/>
  <rect width="1440" height="1024" rx="44" fill="url(#halo)"/>
  <rect width="1440" height="1024" rx="44" fill="url(#grid)" opacity=".65"/>
  <rect x="28" y="28" width="1384" height="968" rx="34" fill="none" stroke="${p.text}" stroke-opacity=".14"/>
  <line x1="42" y1="150" x2="42" y2="870" stroke="${p.accent}" stroke-opacity=".5" stroke-width="2"/>

  <text x="64" y="92" class="mono" fill="${p.text}" fill-opacity=".82">AITAI / 会いたい</text>
  <text x="1376" y="92" class="mono end" fill="${p.text}" fill-opacity=".48">ID / 2026</text>
  <text x="64" y="124" class="tiny mono" fill="${p.text}" fill-opacity=".36">${l.identity}</text>

  <text x="64" y="206" class="tiny mono" fill="${p.accent}" fill-opacity=".9">01 / ${l.name}</text>
  <text x="64" y="348" class="name">${name}</text>
  <text x="1376" y="340" class="meta end" fill="${p.text}" fill-opacity=".72">${data.age} · ${location}</text>
  <text x="1376" y="372" class="mono end" fill="${p.text}" fill-opacity=".38">${nameJa}</text>
  <line x1="64" y1="400" x2="1376" y2="400" stroke="${p.text}" stroke-opacity=".12"/>

  <text x="64" y="470" class="tiny mono" fill="${p.accent}" fill-opacity=".9">02 / ${l.motto}</text>
  ${mottoSvg}
  <line x1="64" y1="650" x2="1376" y2="650" stroke="${p.text}" stroke-opacity=".12"/>

  <text x="64" y="720" class="tiny mono" fill="${p.accent}" fill-opacity=".9">03 / ${l.practice}</text>
  <text x="64" y="792" class="value">${occupation}</text>
  <line x1="64" y1="850" x2="1376" y2="850" stroke="${p.text}" stroke-opacity=".12"/>

  <g fill="${p.text}" fill-opacity=".62">
    <rect x="64" y="896" width="3" height="34"/><rect x="73" y="896" width="7" height="34"/><rect x="86" y="896" width="2" height="34"/><rect x="95" y="896" width="10" height="34"/><rect x="111" y="896" width="3" height="34"/><rect x="120" y="896" width="6" height="34"/><rect x="132" y="896" width="2" height="34"/><rect x="141" y="896" width="9" height="34"/><rect x="156" y="896" width="3" height="34"/>
  </g>
  <text x="64" y="968" class="mono" fill="${p.text}" fill-opacity=".68">${l.site}</text>
  <text x="1376" y="968" class="mono end" fill="${p.gold}" fill-opacity=".82">KIM / 2026</text>
  <text x="1376" y="934" text-anchor="end" class="watermark">会いたい</text>
  <rect width="1440" height="1024" rx="44" filter="url(#grain)" opacity=".045" fill="${p.text}"/>
</svg>`;

  return svgUrl(front);
}
