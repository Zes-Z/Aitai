import type { L10n } from '../types';

/** 技能与时间线示例；随想、项目、相册都已迁移到 src/content。 */
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
