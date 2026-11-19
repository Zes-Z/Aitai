const rawBase = import.meta.env.BASE_URL || '/';
export const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

/** Prefix a site-absolute path with the deploy base ('/Aitai'). */
export function withBase(path = '/'): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}` || '/';
}

export function homePath(lang: string): string {
  return withBase(`/${lang}/`);
}

export function sectionHref(lang: string, id: string): string {
  return `${homePath(lang)}#${id}`;
}
