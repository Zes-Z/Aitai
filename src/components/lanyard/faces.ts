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

const PALETTES: Record<LanyardTheme, { bg: string; text: string }> = {
  dawn: { bg: '#f6e3cf', text: '#2a2022' },
  sea: { bg: '#062b33', text: '#eaf7f5' },
  star: { bg: '#0b1020', text: '#f7f0e8' },
};

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const svgUrl = (svg: string) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

/**
 * Front face only: three rows, no labels, header, barcode, watermark or footer.
 */
export function makeLanyardFront(data: LanyardFaceData, theme: LanyardTheme = 'star'): string {
  const p = PALETTES[theme] ?? PALETTES.star;
  const name = escapeXml(data.name);
  const location = escapeXml(data.location);
  const motto = escapeXml(data.motto);
  const occupation = escapeXml(data.occupation);

  const front = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1024" viewBox="0 0 1440 1024">
  <rect width="1440" height="1024" fill="${p.bg}"/>
  <g text-anchor="middle" dominant-baseline="middle">
    <text x="720" y="310" class="name" fill="${p.text}">${name} <tspan class="sub" fill-opacity=".68">· ${data.age} · ${location}</tspan></text>
    <text x="720" y="512" class="motto" fill="${p.text}">${motto}</text>
    <text x="720" y="714" class="value" fill="${p.text}">${occupation}</text>
  </g>
  <style>
    .name { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 162px; letter-spacing: -5px; }
    .sub { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 44px; letter-spacing: 0; }
    .motto { font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif; font-size: 58px; letter-spacing: -1px; }
    .value { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 44px; letter-spacing: .4px; }
  </style>
</svg>`;

  return svgUrl(front);
}
