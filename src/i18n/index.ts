import type { Lang, L10n } from '../types';
import { LANGS } from '../types';
import { messages, type MessageKey } from './messages';

export function t(key: MessageKey, lang: Lang): string {
  return messages[key]?.[lang] ?? messages[key]?.zh ?? key;
}

export function l10n(value: L10n | string | undefined, lang: Lang): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.zh || value.en || value.ja || '';
}

export function isLang(value: string | undefined): value is Lang {
  return !!value && (LANGS as readonly string[]).includes(value);
}

export function getLangFromUrl(url: URL): Lang {
  const [, maybeLang] = url.pathname.split('/').filter(Boolean);
  return isLang(maybeLang) ? maybeLang : 'zh';
}
