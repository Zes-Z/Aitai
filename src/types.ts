export const LANGS = ['zh', 'en', 'ja'] as const;
export type Lang = (typeof LANGS)[number];
export type L10n = Record<Lang, string>;

export type ThemeId = 'star' | 'sea' | 'dawn';

export type SocialIcon = 'github' | 'mail' | 'xhs' | 'rss' | 'cloud' | 'cv';

export type SocialLink = {
  label: L10n | string;
  icon: SocialIcon;
  /** A public/ path or HTTPS URL overrides the built-in icon. */
  iconSrc?: string;
  /** An empty URL leaves a disabled placeholder until configured. */
  href: string;
  download?: boolean;
};

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}
