import type { L10n } from '../types';

export type Palette = [string, string, string];

/** 相册、技能、时间线的示例数据；随想与项目已经迁移到 src/content。 */
export type Photo = {
  id: string;
  title: L10n;
  place: L10n;
  date: string;
  ratio: 'portrait' | 'square' | 'landscape';
  palette: Palette;
};

export const photos: Photo[] = [
  {
    id: 'enoden',
    title: { zh: '海边的最后一班电车', en: 'The last train by the sea', ja: '海辺の最終電車' },
    place: { zh: '镰仓', en: 'Kamakura', ja: '鎌倉' },
    date: '2026.10.26',
    ratio: 'landscape',
    palette: ['#1a2030', '#6f7f92', '#f0c9a8'],
  },
  {
    id: 'konbini',
    title: { zh: '凌晨四点的便利店', en: 'Konbini at 4 a.m.', ja: '午前四時のコンビニ' },
    place: { zh: '东京', en: 'Tokyo', ja: '東京' },
    date: '2026.09.08',
    ratio: 'portrait',
    palette: ['#0a1420', '#2c5f6e', '#9fe8d8'],
  },
  {
    id: 'bridge',
    title: { zh: '雨后的天桥', en: 'Footbridge after rain', ja: '雨上がりの歩道橋' },
    place: { zh: '京都', en: 'Kyoto', ja: '京都' },
    date: '2026.07.19',
    ratio: 'square',
    palette: ['#161020', '#5b3b5e', '#ffb199'],
  },
  {
    id: 'moon',
    title: { zh: '窗边的月亮', en: 'Moon by the window', ja: '窓辺の月' },
    place: { zh: '札幌', en: 'Sapporo', ja: '札幌' },
    date: '2026.02.11',
    ratio: 'portrait',
    palette: ['#050a18', '#172a5c', '#dcebff'],
  },
  {
    id: 'pool',
    title: { zh: '夏天的泳池', en: 'Summer pool', ja: '夏のプール' },
    place: { zh: '冲绳', en: 'Okinawa', ja: '沖縄' },
    date: '2025.08.03',
    ratio: 'landscape',
    palette: ['#04222a', '#0d7a86', '#8ff5e6'],
  },
  {
    id: 'vending',
    title: { zh: '雪里的自动贩卖机', en: 'Vending machine in snow', ja: '雪の自動販売機' },
    place: { zh: '北海道', en: 'Hokkaido', ja: '北海道' },
    date: '2025.01.22',
    ratio: 'square',
    palette: ['#101826', '#49627a', '#ffe3b0'],
  },
  {
    id: 'stairs',
    title: { zh: '没有人的楼梯', en: 'Stairs with no one', ja: '誰もいない階段' },
    place: { zh: '东京', en: 'Tokyo', ja: '東京' },
    date: '2026.11.02',
    ratio: 'portrait',
    palette: ['#0d1018', '#3b2f3f', '#c9b6ff'],
  },
  {
    id: 'sunrise',
    title: { zh: '第一班电车之前', en: 'Before the first train', ja: '始発の前' },
    place: { zh: '东京', en: 'Tokyo', ja: '東京' },
    date: '2026.11.15',
    ratio: 'landscape',
    palette: ['#1b1420', '#8c4a4a', '#ffd0a8'],
  },
];

export const skills = [
  'Astro', 'TypeScript', 'GSAP', 'Three.js', 'Figma', 'Photography',
  '日本語', '中文', 'English', 'Riso', 'Motion', 'Writing',
];

export const timeline = [
  { year: '2022', title: { zh: '开始写博客', en: 'Started a blog', ja: 'ブログを始めた' } satisfies L10n, place: { zh: '杭州', en: 'Hangzhou', ja: '杭州' } satisfies L10n },
  { year: '2023', title: { zh: '搬去东京', en: 'Moved to Tokyo', ja: '東京へ' } satisfies L10n, place: { zh: '东京', en: 'Tokyo', ja: '東京' } satisfies L10n },
  { year: '2024', title: { zh: '开始认真拍照', en: 'Started taking photos seriously', ja: '写真を本気で始めた' } satisfies L10n, place: { zh: '镰仓', en: 'Kamakura', ja: '鎌倉' } satisfies L10n },
  { year: '2025', title: { zh: '做 Daily Up', en: 'Built Daily Up', ja: 'Daily Up をつくった' } satisfies L10n, place: { zh: '远程', en: 'Remote', ja: 'リモート' } satisfies L10n },
  { year: '2026', title: { zh: '做 Aitai', en: 'Building Aitai', ja: 'Aitai をつくっている' } satisfies L10n, place: { zh: '东京', en: 'Tokyo', ja: '東京' } satisfies L10n },
];
