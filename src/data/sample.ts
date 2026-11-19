import type { L10n } from '../types';

export type Palette = [string, string, string];

export type Project = {
  slug: string;
  index: string;
  year: string;
  title: L10n;
  role: L10n;
  summary: L10n;
  tags: string[];
  palette: Palette;
};

export type Photo = {
  id: string;
  title: L10n;
  place: L10n;
  date: string;
  ratio: 'portrait' | 'square' | 'landscape';
  palette: Palette;
};

export type Thought = {
  slug: string;
  title: L10n;
  excerpt: L10n;
  date: string;
  reading: number;
  palette: Palette;
  body: L10n;
};

export const projects: Project[] = [
  {
    slug: 'dailyup',
    index: '01',
    year: '2026',
    title: { zh: 'Daily Up', en: 'Daily Up', ja: 'Daily Up' },
    role: { zh: '设计 + 前端', en: 'Design + Front-end', ja: 'デザイン + フロントエンド' },
    summary: {
      zh: '一个每天推你一把的小工具。把“明天再说”变成“现在做一点”。',
      en: 'A small tool that nudges you once a day, turning “later” into “a little now”.',
      ja: '一日一回、背中を押す小さな道具。「あとで」を「少しだけ今」に。',
    },
    tags: ['Astro', 'GSAP', 'Supabase'],
    palette: ['#0b1026', '#243a8f', '#8fb3ff'],
  },
  {
    slug: 'sea-moon',
    index: '02',
    year: '2025',
    title: { zh: '海月', en: 'Sea Moon', ja: '海月' },
    role: { zh: '摄影 + 编辑', en: 'Photography + Edit', ja: '写真 + 編集' },
    summary: {
      zh: '一组关于水母、月光和深夜水族馆的照片。',
      en: 'A photo series about jellyfish, moonlight and an aquarium after dark.',
      ja: 'クラゲと月明かりと、夜の水族館の写真。',
    },
    tags: ['Photography', 'Riso', 'Book'],
    palette: ['#031018', '#0b4a52', '#6fe7de'],
  },
  {
    slug: 'paper-planes',
    index: '03',
    year: '2025',
    title: { zh: '纸飞机', en: 'Paper Planes', ja: '紙飛行機' },
    role: { zh: '交互 + WebGL', en: 'Interaction + WebGL', ja: 'インタラクション + WebGL' },
    summary: {
      zh: '一个会跟着鼠标收集纸飞机的页脚。纸张、阴影和一点点风。',
      en: 'A footer where paper planes gather around your cursor. Paper, shadow and a little wind.',
      ja: 'カーソルを追って紙飛行機が集まるフッター。紙と影と、少しの風。',
    },
    tags: ['Three.js', 'TSL', 'GSAP'],
    palette: ['#f7f0e8', '#efc9ad', '#e98b6a'],
  },
  {
    slug: 'aitai',
    index: '04',
    year: '2026',
    title: { zh: 'Aitai', en: 'Aitai', ja: 'Aitai' },
    role: { zh: '正在做', en: 'In progress', ja: '制作中' },
    summary: {
      zh: '你正在看的这个站。三界、四幅、一个头像。',
      en: 'The site you are reading. Three worlds, four acts, one avatar.',
      ja: 'いま読んでいるこのサイト。三つの世界、四つの章、ひとつのアイコン。',
    },
    tags: ['Astro', 'GSAP', 'Canvas'],
    palette: ['#120a20', '#4d2a63', '#ffd9a0'],
  },
];

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

export const thoughts: Thought[] = [
  {
    slug: 'tomorrow-weather',
    title: { zh: '明天大概是个好天气', en: 'Tomorrow will probably be fine', ja: '明日はいい天気だろう' },
    excerpt: {
      zh: '把窗户开了一条缝，风把桌上的纸吹到了地上。我没有去捡。',
      en: 'I opened the window a crack. The wind pushed the papers off the desk. I left them there.',
      ja: '窓を少しだけ開けた。風が机の紙を床に落とした。拾わなかった。',
    },
    date: '2026.11.12',
    reading: 4,
    palette: ['#0a1420', '#274b63', '#a8d8ff'],
    body: {
      zh: '把窗户开了一条缝，风把桌上的纸吹到了地上。我没有去捡。\n\n有些东西掉下去，是为了让你看见它原本的位置。比如一张写了半句话的纸，比如一段没有结尾的关系。明天大概是个好天气，我打算把窗开得更大一点。',
      en: 'I opened the window a crack. The wind pushed the papers off the desk. I left them there.\n\nSome things fall so you can see where they used to be. A page with half a sentence. A relationship with no ending. Tomorrow will probably be fine. I think I will open the window a little wider.',
      ja: '窓を少しだけ開けた。風が机の紙を床に落とした。拾わなかった。\n\n落ちたものは、もともとあった場所を教えてくれる。半分だけ書いた紙。終わらなかった関係。明日はいい天気だろう。もう少しだけ、窓を開けてみよう。',
    },
  },
  {
    slug: 'night-bus',
    title: { zh: '夜行巴士', en: 'Night bus', ja: '夜行バス' },
    excerpt: {
      zh: '车窗像一块很慢的屏幕，播放着别人家的灯。',
      en: 'The window was a very slow screen, playing other people’s lights.',
      ja: '窓はとても遅いスクリーンで、他人の家の明かりを映していた。',
    },
    date: '2026.10.03',
    reading: 3,
    palette: ['#060a16', '#2b2350', '#c9b6ff'],
    body: {
      zh: '夜行巴士的好处是，你不需要和任何人解释你为什么在夜里移动。\n\n车窗像一块很慢的屏幕，播放着别人家的灯。每一盏都像在说：这里也有人醒着。到站的时候，天还没有亮，便利店的灯是唯一的港口。',
      en: 'The good thing about a night bus is that you do not have to explain to anyone why you are moving at night.\n\nThe window was a very slow screen, playing other people’s lights. Each one seemed to say: someone here is awake too. When we arrived, it was still dark. The convenience store light was the only harbor.',
      ja: '夜行バスのいいところは、なぜ夜に動いているのか、誰にも説明しなくていいことだ。\n\n窓はとても遅いスクリーンで、他人の家の明かりを映していた。どの明かりも「ここにも起きている人がいる」と言っているようだった。着いたとき、まだ暗かった。コンビニの明かりだけが港だった。',
    },
  },
  {
    slug: 'a-place-for-words',
    title: { zh: '给话一个地方', en: 'A place for words', ja: '言葉の置き場所' },
    excerpt: {
      zh: '有些话不适合说出口，适合放在一个慢慢加载的页面里。',
      en: 'Some words are not for saying. They belong on a page that loads slowly.',
      ja: '口にしないほうがいい言葉がある。ゆっくり読み込まれるページに置くのがいい。',
    },
    date: '2026.09.18',
    reading: 5,
    palette: ['#031018', '#0b4a52', '#6fe7de'],
    body: {
      zh: '有些话不适合说出口，适合放在一个慢慢加载的页面里。\n\n这个站就是那个页面。它不催你读完，也不问你为什么来。你可以只待三十秒，看一颗星从左边走到右边，然后关掉它。想念不需要被回复。',
      en: 'Some words are not for saying. They belong on a page that loads slowly.\n\nThis site is that page. It does not rush you to finish, or ask why you came. You can stay for thirty seconds, watch a star move from left to right, and close it. Longing does not need a reply.',
      ja: '口にしないほうがいい言葉がある。ゆっくり読み込まれるページに置くのがいい。\n\nこのサイトがそのページだ。読み終わることを急がせないし、なぜ来たのかも聞かない。三十秒だけいて、星が左から右へ動くのを見て、閉じてもいい。想いは、返事を必要としない。',
    },
  },
];

export const stats = [
  { value: 3, label: { zh: '语言', en: 'Languages', ja: '言語' } satisfies L10n, suffix: '' },
  { value: 24, label: { zh: '随想', en: 'Notes', ja: '随想' } satisfies L10n, suffix: '' },
  { value: 365, label: { zh: '照片', en: 'Photos', ja: '写真' } satisfies L10n, suffix: '' },
  { value: 6, label: { zh: '项目', en: 'Projects', ja: 'プロジェクト' } satisfies L10n, suffix: '' },
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
