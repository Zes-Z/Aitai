
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// 自动识别部署平台
const isCloudflarePages = process.env.CF_PAGES === '1';

const isGitHubPages =
  process.env.GITHUB_ACTIONS === 'true' &&
  !isCloudflarePages;

// GitHub Pages 项目页需要 /Aitai/
// Cloudflare Pages 和本地开发使用 /
const base = process.env.ASTRO_BASE ??
  (isGitHubPages ? '/Aitai/' : '/');

// 分别配置正式网站 URL
const site = isGitHubPages
  ? 'https://zes-z.github.io'
  : 'https://zes4u2.pages.dev';

export default defineConfig({
  site,
  base,

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

