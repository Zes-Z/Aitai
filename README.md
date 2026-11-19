# Aitai · 会いたい

一个可以在「星空 / 海月 / 朝凪」三个世界之间下潜、浮起、等待天亮的三语个人博客。

当前是 **M1 可运行切片**：Astro 7 + Tailwind 4 + GSAP + Lenis，首页四幅、三主题切换、头像下潜、三语路由、项目 / 相册 / 随想详情页已经跑通。

截图：[星空](docs/screenshots/hero.png) · [海月](docs/screenshots/sea.png) · [朝凪](docs/screenshots/dawn.png) · [头像下潜中途](docs/screenshots/avatar-dock.png) · [移动端](docs/screenshots/mobile.png)

## 启动

```sh
pnpm install
pnpm dev
```

打开 <http://localhost:4321/aitai/zh/>。根路径 `/aitai/` 会跳到 `/aitai/zh/`。

```sh
pnpm build    # astro check + astro build
pnpm preview  # 预览 dist
```

## 已实现

- **四幅首页**：潮汐线 / 漂流物 / 三域 / 归港。
- **三主题**：星空 / 海月 / 朝凪；主题球、方向菜单、全屏换界、localStorage 持久化、无闪首帧。
- **头像下潜**：首屏 120px → 下滑吸附左上角 40px（移动端 84 → 32）；Header 玻璃、字标位移、导航显隐共享同一滚动进度；头像跨页持续；详情页直接 docked。
- **三语**：`/[lang]/`，zh / en / ja；一个键 × 三语的 `messages`；`hreflang` 与三语路由。
- **内容页**：项目列表 / 详情、相册、随想列表 / 正文，全部静态生成（35 页）。
- **交互**：Lenis 平滑滚动、自定义光标、滚动揭示、数字滚动、卡片倾斜、轨道拖拽、主题球、移动菜单、复制邮箱 Toast。
- **世界引擎**：Canvas 2D 星空 / 水母 / 晨雾，跟随主题切换，支持 reduced-motion 静态帧。

## 结构

```
src/
  components/      Header, AvatarDock, ThemeOrb, Hero, Driftage, Realms, Harbor...
  data/sample.ts   示例项目 / 照片 / 随想（下一步会换成 content collections）
  i18n/            一个键 × 三语
  pages/[lang]/    首页与详情页
  scripts/         world, theme, avatar-dock, shell
  styles/global.css
SiteConfig.ts      身份、站点、导航、主题、动效开关
```

## 下一步

1. 把 `src/data/sample.ts` 换成 `src/content/post|project|album` 内容集合 + 自定义 loader。
2. 接入 Interlude 式转场引擎：Tide / Constellate / Develop / Peel / Veil。
3. 把 Canvas 世界升级为 Three.js / TSL，做 6 条主题切换分镜。
4. Giscus 留言、命令面板、环境音。
5. 性能与 a11y 收尾：图片资源、Lighthouse、键盘全链路。

## 说明

- 头像是 `public/avatar.svg` 占位，CV 是 `public/kim cv.pdf`，发布前替换。
- 图片目前用渐变 / `cover.svg` 占位；内容接入后替换为真实照片。
- 主题切换、头像下潜、三语路由与详情页已可交互；页面转场目前是 Astro ClientRouter 默认淡入。
