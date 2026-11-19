# Aitai · 会いたい

一个可以在「星空 / 海月 / 朝凪」三个世界之间下潜、浮起、等待天亮的三语个人博客。

当前是 **M2 可运行切片**：Astro 7 + Tailwind 4 + Lenis，首页四幅、三主题切换、头像下潜、三语路由、内容集合、页面转场、项目 / 相册 / 随想详情页已经跑通。

截图：[星空](docs/screenshots/hero.png) · [海月](docs/screenshots/sea.png) · [朝凪](docs/screenshots/dawn.png) · [头像下潜中途](docs/screenshots/avatar-dock.png) · [移动端](docs/screenshots/mobile.png) · [正文](docs/screenshots/thought.png) · [Tide](docs/screenshots/transition-tide.png) · [Constellate](docs/screenshots/transition-constellate.png) · [Develop](docs/screenshots/transition-develop.png)

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
- **内容集合**：`src/content/post/<slug>/{zh,en,ja}.md` 与 `src/content/project/<slug>/{zh,en,ja}.md`，共 21 个 markdown；页面通过 `getCollection` / `render()` 读取，正文由 Astro 渲染。
- **页面转场**：Tide / Constellate / Develop / Veil 四种；ClientRouter 负责导航，自研 overlay + Web Animations API 负责「封面 + 揭示」；支持返回、中断、reduced-motion；Astro 默认转场已关闭。
- **内容页**：项目列表 / 详情、相册、随想列表 / 正文，全部静态生成（35 页）。
- **交互**：Lenis 平滑滚动、自定义光标、滚动揭示、数字滚动、卡片倾斜、轨道拖拽、主题球、移动菜单、复制邮箱 Toast。
- **世界引擎**：Canvas 2D 星空 / 水母 / 晨雾，跟随主题切换，支持 reduced-motion 静态帧。

## 结构

```
src/
  components/      Header, AvatarDock, ThemeOrb, Hero, Driftage, Realms, Harbor...
  content/post/    随想 markdown（zh / en / ja）
  content/project/ 项目 markdown（zh / en / ja）
  data/sample.ts   相册、技能、时间线的示例数据
  i18n/            一个键 × 三语
  pages/[lang]/    首页与详情页
  scripts/         world, theme, avatar-dock, shell, page-transitions
  styles/global.css
SiteConfig.ts      身份、站点、导航、主题、动效开关
```

## 下一步

1. 把相册从 `src/data/sample.ts` 迁到 `src/content/album` + `photo-video.json` 自定义 loader，接入真实照片与 EXIF。
2. 把主题切换从单层圆环升级为 6 条分镜（坠星 / 升星 / 浮月 / 沉日 / 暮落 / 破晓），接入 Three.js / TSL。
3. 补 Peel / 共享元素 / 组件 ↔ 页面转场，接入 Interlude 的旧页快照。
4. Giscus 留言、命令面板、环境音。
5. 性能与 a11y 收尾：图片资源、Lighthouse、键盘全链路。

## 说明

- 头像是 `public/avatar.svg` 占位，CV 是 `public/kim cv.pdf`，发布前替换。
- 图片目前用渐变 / `cover.svg` 占位；内容接入后替换为真实照片。
- 三主题、头像下潜、三语路由、内容集合、四种页面转场与详情页已可交互。
- 主题切换目前是单层圆环 `Bloom`；6 条完整分镜与 Three.js 世界还在下一步。
