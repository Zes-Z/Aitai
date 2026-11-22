import type { Lang } from '../../types';

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

export function makeLanyardFaces(data: LanyardFaceData): { front: string; back: string } {
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
  .name { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 112px; letter-spacing: -4px; fill: #f7f0e8; }
  .value { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 28px; letter-spacing: .3px; fill: #f7f0e8; }
  .watermark { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 112px; letter-spacing: -4px; fill: #ffffff; fill-opacity: .055; }
  .quote { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 42px; letter-spacing: -1px; fill: #f7f0e8; }
  .stat { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 72px; fill: #ffd9a0; }
</style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#070811"/><stop offset=".55" stop-color="#0b1020"/><stop offset="1" stop-color="#131327"/>
    </linearGradient>
    <radialGradient id="halo" cx=".76" cy=".16" r=".62">
      <stop offset="0" stop-color="#6fe7de" stop-opacity=".26"/><stop offset=".45" stop-color="#8fb3ff" stop-opacity=".08"/><stop offset="1" stop-color="#8fb3ff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="52" height="52" patternUnits="userSpaceOnUse"><path d="M52 0H0V52" fill="none" stroke="#ffffff" stroke-opacity=".045"/></pattern>
    <clipPath id="avatar"><circle cx="126" cy="222" r="58"/></clipPath>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="720" height="1020" rx="48" fill="url(#bg)"/>
  <rect width="720" height="1020" rx="48" fill="url(#halo)"/>
  <rect width="720" height="1020" rx="48" fill="url(#grid)" opacity=".65"/>
  <rect x="30" y="30" width="660" height="960" rx="38" fill="none" stroke="#ffffff" stroke-opacity=".14"/>
  <text x="64" y="102" class="mono" fill="#f7f0e8" fill-opacity=".8">AITAI / 会いたい</text>
  <text x="656" y="102" class="mono end" fill="#f7f0e8" fill-opacity=".5">ID / 2026</text>
  <text x="64" y="148" class="mono tiny" fill="#f7f0e8" fill-opacity=".38">${l.identity}</text>

  <circle cx="126" cy="222" r="65" fill="#f7f0e8" fill-opacity=".07"/>
  <image href="${data.avatar}" x="68" y="164" width="116" height="116" clip-path="url(#avatar)" preserveAspectRatio="xMidYMid slice"/>
  <circle cx="126" cy="222" r="58" fill="none" stroke="#6fe7de" stroke-opacity=".55"/>
  <text x="212" y="252" class="name">${name}</text>
  <text x="216" y="294" class="mono" fill="#f7f0e8" fill-opacity=".55">${nameJa} / ${name}</text>

  <rect x="64" y="338" width="368" height="54" rx="27" fill="#6fe7de" fill-opacity=".09" stroke="#6fe7de" stroke-opacity=".42"/>
  <circle cx="92" cy="365" r="4" fill="#6fe7de"/>
  <text x="108" y="372" class="mono" fill="#d9fffa">${available}</text>

  <text x="64" y="446" class="mono tiny" fill="#f7f0e8" fill-opacity=".38">${l.now}</text>
  <text x="64" y="488" class="value">${status}</text>
  <text x="64" y="556" class="mono tiny" fill="#f7f0e8" fill-opacity=".38">${l.location}</text>
  <text x="64" y="598" class="value">${location}</text>
  <text x="64" y="666" class="mono tiny" fill="#f7f0e8" fill-opacity=".38">${l.trilingual}</text>
  <text x="64" y="708" class="value">ZH / EN / JA</text>

  <g fill="#f7f0e8" fill-opacity=".68">
    <rect x="64" y="786" width="3" height="46"/><rect x="73" y="786" width="7" height="46"/><rect x="86" y="786" width="2" height="46"/><rect x="95" y="786" width="10" height="46"/><rect x="111" y="786" width="3" height="46"/><rect x="120" y="786" width="6" height="46"/><rect x="132" y="786" width="2" height="46"/><rect x="141" y="786" width="9" height="46"/><rect x="156" y="786" width="3" height="46"/><rect x="165" y="786" width="5" height="46"/>
  </g>
  <text x="64" y="884" class="mono" fill="#f7f0e8" fill-opacity=".72">AITAI.SITE</text>
  <text x="656" y="884" class="mono end" fill="#f7f0e8" fill-opacity=".42">KIM / 2026</text>
  <text x="656" y="952" text-anchor="end" class="watermark">会いたい</text>
  <rect width="720" height="1020" rx="48" filter="url(#grain)" opacity=".05" fill="#ffffff"/>
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
    return `<text x="${x}" y="${y}" class="stat">${stat.value}</text><text x="${x}" y="${y + 34}" class="mono tiny" fill="#f7f0e8" fill-opacity=".44">${escapeXml(stat.label)}</text>`;
  }).join('');

  const back = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1020" viewBox="0 0 720 1020">
  <style>
  .mono { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 21px; letter-spacing: 2.6px; text-transform: uppercase; }
  .tiny { font-size: 16px; letter-spacing: 3px; }
  .end { text-anchor: end; }
  .name { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 112px; letter-spacing: -4px; fill: #f7f0e8; }
  .value { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 28px; letter-spacing: .3px; fill: #f7f0e8; }
  .watermark { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 112px; letter-spacing: -4px; fill: #ffffff; fill-opacity: .055; }
  .quote { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 42px; letter-spacing: -1px; fill: #f7f0e8; }
  .stat { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 72px; fill: #ffd9a0; }
</style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#090a10"/><stop offset=".58" stop-color="#101021"/><stop offset="1" stop-color="#171126"/>
    </linearGradient>
    <radialGradient id="spot" cx=".72" cy=".24" r=".62">
      <stop offset="0" stop-color="#ffd9a0" stop-opacity=".38"/><stop offset=".26" stop-color="#f3a66d" stop-opacity=".16"/><stop offset=".58" stop-color="#6fe7de" stop-opacity=".1"/><stop offset="1" stop-color="#6fe7de" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="border" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffd9a0" stop-opacity=".7"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".1"/><stop offset="1" stop-color="#6fe7de" stop-opacity=".55"/>
    </linearGradient>
    <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="#ffffff" stroke-opacity=".055"/></pattern>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="720" height="1020" rx="48" fill="url(#bg)"/>
  <rect width="720" height="1020" rx="48" fill="url(#spot)"/>
  <rect width="720" height="1020" rx="48" fill="url(#grid)" opacity=".8"/>
  <rect x="30" y="30" width="660" height="960" rx="38" fill="none" stroke="url(#border)" stroke-width="1.5"/>
  <text x="64" y="100" class="mono" fill="#ffd9a0" fill-opacity=".9">${l.back}</text>
  <text x="656" y="100" class="mono end" fill="#f7f0e8" fill-opacity=".45">${l.side} / 02</text>
  <circle cx="628" cy="178" r="52" fill="#ffd9a0" fill-opacity=".09"/>
  <circle cx="628" cy="178" r="34" fill="none" stroke="#ffd9a0" stroke-opacity=".4"/>
  <circle cx="628" cy="178" r="4" fill="#ffd9a0"/>

  <text x="64" y="238" class="mono tiny" fill="#f7f0e8" fill-opacity=".4">A NOTE FROM THE OTHER SIDE</text>
  ${quoteText}

  ${statsSvg}
  <line x1="64" y1="900" x2="656" y2="900" stroke="#ffffff" stroke-opacity=".12"/>
  <text x="64" y="944" class="mono" fill="#f7f0e8" fill-opacity=".66">AITAI / KIM / 2026</text>
  <text x="656" y="944" class="mono end" fill="#ffd9a0" fill-opacity=".8">${l.flip}</text>
  <rect width="720" height="1020" rx="48" filter="url(#grain)" opacity=".06" fill="#ffffff"/>
</svg>`;

  return { front: svgUrl(front), back: svgUrl(back) };
}
