import type { ThemeId } from '../types';

export const themeBg: Record<ThemeId, string> = {
  star: '#05060f',
  sea: '#031018',
  dawn: '#f7f0e8',
};

export const themeColor: Record<ThemeId, string> = {
  star: '#05060f',
  sea: '#031018',
  dawn: '#f7f0e8',
};

export const themeOrder: ThemeId[] = ['dawn', 'sea', 'star'];

export function isTheme(value: string | null | undefined): value is ThemeId {
  return value === 'star' || value === 'sea' || value === 'dawn';
}
