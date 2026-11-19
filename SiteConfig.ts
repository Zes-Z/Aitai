import type { AvatarLink, L10n, Lang, SocialLink, ThemeId } from './src/types';

/**
 * AITAI · 全站自定义中心
 * 只放「用户会想改」的项；组件内部的样式参数留在组件里。
 */
export const siteConfig = {
  identity: {
    name: 'KIM',
    nameJa: 'キム',
    avatar: '/avatar.svg',
    resume: '/kim cv.pdf',
    email: 'zes234@proton.me',
    location: { zh: '东京', en: 'Tokyo', ja: '東京' } satisfies L10n,
    timezone: 'Asia/Tokyo',
    status: {
      zh: '正在做 Aitai',
      en: 'Building Aitai',
      ja: 'Aitai をつくっています',
    } satisfies L10n,
    socials: [
      { label: 'GitHub', href: 'https://github.com/', icon: 'github' },
      { label: 'Email', href: 'mailto:zes234@proton.me', icon: 'mail' },
      { label: '小红书', href: 'https://www.xiaohongshu.com/', icon: 'xhs' },
    ] satisfies SocialLink[],
  },

  site: {
    title: 'AITAI',
    titleJa: '会いたい',
    tagline: {
      zh: '一些没能说出口的想念。',
      en: 'A place for the almost-said.',
      ja: '言えなかった言葉の置き場所。',
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
    cover: '/cover.svg',
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
    scrollCue: { zh: '向下，潜入夜里', en: 'Scroll to dive', ja: '下へ、夜へ潜る' } satisfies L10n,
  },

  nav: {
    sections: [
      { id: 'tide', label: { zh: '潮汐线', en: 'Tide', ja: '潮汐線' } satisfies L10n },
      { id: 'drift', label: { zh: '漂流物', en: 'Driftage', ja: '漂流物' } satisfies L10n },
      { id: 'realms', label: { zh: '三域', en: 'Realms', ja: '三つ領域' } satisfies L10n },
      { id: 'harbor', label: { zh: '归港', en: 'Harbor', ja: '帰港' } satisfies L10n },
    ],
    /** 头像菜单：GitHub / 邮箱 / 自定义入口 / CV */
    avatarDock: {
      customLinks: [
        {
          label: { zh: '阿里云盘', en: 'Cloud Drive', ja: 'クラウド' },
          icon: 'cloud',
          iconSrc: '', // 填入 public/ 图标路径或 HTTPS 图片地址即可替换图标
          href: '', // 自定义链接待定；留空时显示不可点击的占位图标
        },
      ] satisfies AvatarLink[],
    },
  },

  theme: {
    order: ['dawn', 'sea', 'star'] as const satisfies readonly ThemeId[],
    default: 'dawn' as ThemeId,
    autoByTime: false,
    intensity: 1,
    world: 'canvas' as 'canvas' | 'webgl',
  },

  motion: {
    level: 'full' as 'full' | 'lite' | 'off',
    cursor: true,
    smoothScroll: true,
    pageTransitions: true,
  },

  features: {
    sound: false,
    guestbook: false,
    commandPalette: false,
    viewTransitions: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
