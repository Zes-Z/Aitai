import type { L10n, Lang, SocialLink, ThemeId } from './src/types';

/**
 * AITAI · 全站自定义中心
 * 只放「用户会想改」的项；组件内部的样式参数留在组件里。
 */
export const siteConfig = {
  identity: {
    name: 'KIM',
    nameJa: 'キム',
    avatar: '/avatar.jpg',
    email: 'zes234@proton.me',
    location: { zh: '京都', en: 'KyoTo', ja: '京都' } satisfies L10n,
    timezone: 'Asia/Tokyo',
    age: 24,
    lanyard: {
      /** public 下的路径；换成自己的封底图后只改这里 */
      backImage: '/lanyard/card-back.webp',
    },
    occupation: {
      zh: '设计 / 开发',
      en: 'Design / Development',
      ja: 'デザイン / 開発',
    } satisfies L10n,
    status: {
      zh: '正在做 Aitai',
      en: 'Building Aitai',
      ja: 'Aitai をつくっています',
    } satisfies L10n,
    socials: [
      { label: 'GitHub', href: 'https://github.com/', icon: 'github' },
      { label: 'Email', href: 'mailto:zes234@proton.me', icon: 'mail' },
      { label: 'CV', href: '/kim cv.pdf', icon: 'cv' },
    ] satisfies SocialLink[],
  },

  site: {
    title: 'AITAI',
    titleJa: '会いたい',
    tagline: {
      zh: '一些没能说出口的想念。',
      en: 'The almost-said.',
      ja: '言えなかった言葉。',
    } satisfies L10n,
    description: {
      zh: '一个关于星空、海月与黎明的三语个人博客。',
      en: 'A trilingual blog about stars, sea moons and dawn.',
      ja: '星と海月と夜明けの、三言語ブログ。',
    } satisfies L10n,
    siteUrl: 'https://zes-z.github.io',
    defaultLang: 'zh' as Lang,
    langs: ['zh', 'en', 'ja'] as const,
  },

  hero: {
    motto: [
      {
        zh: '把日常，过成值得记下的片段。',
        en: 'Collect moments. Make meaning.',
        ja: '何気ない日々を、記す価値のある瞬間に。',
      },
      {
        zh: '在好奇与秩序之间，慢慢生长。',
        en: 'Grow slowly, between curiosity and order.',
        ja: '好奇心と秩序のあいだで、ゆっくり育つ。',
      },
      {
        zh: '三界在换，头像一直在。',
        en: 'Worlds change. The person stays.',
        ja: '世界は変わる。わたしはここに。',
      },
    ] satisfies L10n[],
    scrollCue: {
      dawn: { zh: '向下，迎接清晨', en: 'Scroll down to greet the morning', ja: '下へ、朝を迎える' },
      sea: { zh: '向下，沉入海水', en: 'Scroll down to dive into the sea', ja: '下へ、海に潜る' },
      star: { zh: '向下，飞入星空', en: 'Scroll down to soar into the stars', ja: '下へ、星空へ飛び立つ' },
    } satisfies Record<ThemeId, L10n>,
  },

  theme: {
    order: ['dawn', 'sea', 'star'] as const satisfies readonly ThemeId[],
    default: 'dawn' as ThemeId,
  },
} as const;

export type SiteConfig = typeof siteConfig;
