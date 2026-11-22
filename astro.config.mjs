
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// 判断是否通过 GitHub Actions 构建
const isGitHub = process.env.GITHUB_ACTIONS === 'true';

// 自动获取 GitHub 仓库信息
const [owner = '', repoName = ''] =
  (process.env.GITHUB_REPOSITORY ?? '').split('/');

// 判断是否为 GitHub 用户主页仓库
const isUserPageRepo =
  repoName.toLowerCase() === `${owner.toLowerCase()}.github.io`;

// GitHub Pages 的基础路径
const githubBase =
  repoName && !isUserPageRepo ? `/${repoName}/` : '/';

// 根据部署环境自动选择
const site = process.env.ASTRO_SITE ||
  (isGitHub
    ? 'https://zes-z.github.io'
    : 'https://aitai-ehc.pages.dev');

const base = process.env.ASTRO_BASE ||
  (isGitHub ? githubBase : '/');

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
