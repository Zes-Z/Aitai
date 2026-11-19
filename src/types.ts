export const LANGS = ['zh', 'en', 'ja'] as const;
export type Lang = (typeof LANGS)[number];
export type L10n = Record<Lang, string>;

export type ThemeId = 'star' | 'sea' | 'dawn';

export type SocialIcon = 'github' | 'mail' | 'xhs' | 'rss';

export type SocialLink = {
  label: string;
  href: string;
  icon: SocialIcon;
};

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}
