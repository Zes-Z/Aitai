import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://zes-z.github.io',
  // GitHub Pages 路径必须与仓库名 Aitai 的大小写一致。
  base: '/Aitai',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en', 'ja'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
