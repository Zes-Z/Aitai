# Aitai · 会いたい

一个可以在「星空 / 海月 / 朝凪」三个世界之间下潜、浮起、等待天亮的三语个人博客。

当前是 **M3 可运行切片**：Astro 7 + Tailwind 4 + Lenis，单页四幅、三主题切换、头像快捷菜单、三语路由、内容集合、页面转场、项目 / 相册 / 随想详情页已经跑通。顶部导航已移除，右上角的球单击切语言、长按切主题。

截图：[星空](docs/screenshots/hero.png) · [海月](docs/screenshots/sea.png) · [朝凪](docs/screenshots/dawn.png) · [漂流物](docs/screenshots/drift.png) · [头像菜单](docs/screenshots/avatar-actions.png) · [三种主题球](docs/screenshots/theme-orbs.png) · [移动端菜单](docs/screenshots/avatar-actions-mobile.png) · [相册](docs/screenshots/album.png) · [正文](docs/screenshots/thought.png) · [Tide](docs/screenshots/transition-tide.png) · [Ink 海月](docs/screenshots/ink-sea.png) · [Ink 朝凪](docs/screenshots/ink-dawn.png)

## 启动

```sh
pnpm install
pnpm dev
```

打开 <http://localhost:4321/Aitai/zh/>。根路径 `/Aitai/` 会跳到 `/Aitai/zh/`。

```sh
pnpm build    # astro check + astro build
pnpm preview  # 预览 dist
pnpm test:theme-orb  # Edge 无头浏览器：桌面 / 触屏 / 键盘交互及球标截图
pnpm test:avatar-dock # 头像菜单、回到顶部、三语全路由及响应式内容边界
```

GitHub Pages 地址为 <https://zes-z.github.io/Aitai/>。`astro.config.mjs` 中的 `base: '/Aitai/'` 必须与仓库名的大小写一致；站内链接与资源路径通过此配置生成。推送到 `main` 后，现有 GitHub Actions 工作流会自动构建并部署。

## 已实现

- **四幅首页**：潮汐线 / 漂流物 / 三域 / 归港。
- **三主题**：星空 / 海月（海上明月，不是水母）/ 朝凪；默认朝凪（`SiteConfig.theme.default` 可改）；长按主题球直接循环切换、全屏换界、localStorage 持久化、无闪首帧。
- **头像菜单**：读取 `SiteConfig.identity.socials`，点击在右下方 90° 区域内等角度展开，基础半径 80px；长按 460ms 回到当前页面顶部，Space / Home 回顶，↓ 打开链接，Escape 关闭。GitHub / 邮件 / CV 图标沿用 funiki 的 SVG 风格。自定义图标用 `iconSrc`，空链接显示为不可点击的占位；CV 使用 `{ label: 'CV', href: '/kim cv.pdf', icon: 'cv' }`，头像、首屏、漂流物和尾幅的下载入口共用这条配置。
- **对称边界**：两个角落按钮固定为 46px，顶部与左右边缘使用相等的安全区边距。所有页面的内容留白由按钮内侧边界推导；窄屏标题、列表和相册随内容宽度排版。
- **三语**：`/[lang]/`，zh / en / ja；一个键 × 三语的 `messages`；`hreflang` 与三语路由。
- **内容集合**：`src/content/post/<slug>/{zh,en,ja}.md`、`src/content/project/<slug>/{zh,en,ja}.md`，共 21 个 markdown；页面通过 `getCollection` / `render()` 读取，正文由 Astro 渲染。
- **相册集合**：`src/content/album/photo-video.json` 保留 Zes4U 字段（title / text 为 `[zh,en,ja]` 三语数组），`src/loaders/album.ts` 把每条记录变成独立 entry；相册页与首页影像域都从集合读取。
- **页面转场**：Tide / Constellate / Develop / Veil 四种；ClientRouter 负责导航，自研 overlay + Web Animations API 负责「封面 + 揭示」；支持返回、中断、reduced-motion；Astro 默认转场已关闭。
- **语言切换 Ink**：按当前主题分三种——星空是右上角星图圆环、海月是潮水从海面升起、朝凪是暖光从左向右扫过；不再是三套主题共用一块自上而下的幕布。
- **内容页**：项目列表 / 详情、相册、随想列表 / 正文，全部静态生成（35 页）。
- **交互**：Lenis 平滑滚动、自定义光标、滚动揭示、数字滚动、轨道拖拽、复制邮箱 Toast。
- **第二幅「漂流物」**：改成可拖拽的漂浮场——4 张卡可以拖动、惯性、边界回弹、hover 光斑、复位；数字滚动、实时时间、技能 marquee 都在同一块场里。
- **主题球**：单击切换语言（`Ink` 转场），长按 460ms 按「朝凪 → 海月 → 星空」循环主题；键盘 Space / ↓ 切主题，Enter 切语言。朝凪是沿原轨迹浮动的明亮太阳；海月每 10 秒涨潮吞月、退潮复明；星空是带光子环和流动吸积盘的黑洞。拖动、取消触摸或切走页面会取消长按；支持减少动态效果。
- **世界引擎**：Canvas 2D 星空 / 明月与海面 / 晨雾，跟随主题切换，支持 reduced-motion 静态帧。

## 结构

```
src/
  components/      AvatarDock, ThemeOrb, Hero, Driftage, Realms, Harbor, PageTransition...
  content/post/    随想 markdown（zh / en / ja）
  content/project/ 项目 markdown（zh / en / ja）
  content/album/   photo-video.json + 相册媒体
  loaders/         album.ts（JSON → content entries）
  data/sample.ts   技能示例数据
  i18n/            一个键 × 三语
  pages/[lang]/    首页与详情页
  scripts/         world, theme, avatar-dock, shell, page-transitions
  styles/global.css
SiteConfig.ts      身份、站点、导航、主题、动效开关
```

## 下一步

1. 给相册接入真实照片、响应式图片与 EXIF 面板；目前 `photo-video.json` 里的 `src` 还是占位文件名。
2. 把主题切换从单层圆环升级为 6 条分镜（坠星 / 升星 / 浮月 / 沉日 / 暮落 / 破晓），接入 Three.js / TSL。
3. 补 Peel / 共享元素 / 组件 ↔ 页面转场，接入 Interlude 的旧页快照。
4. Giscus 留言、命令面板、环境音。
5. 性能与 a11y 收尾：图片资源、Lighthouse、键盘全链路。

## 说明

- 球标以原生 SVG / CSS 复现，视觉参考 [React Bits Orb](https://reactbits.dev/backgrounds/orb) 与 [Black Hole](https://pro.reactbits.dev/docs/components/black-hole)。
- 头像是 `public/avatar.svg` 占位，CV 是 `public/kim cv.pdf`，发布前替换。
- 相册目前用 `palette` 渐变和 `cover.svg` 占位；`photo-video.json` 的 `src` 指向尚未放入的真实照片。
- 三主题、头像快捷菜单、三语路由、内容集合、四种页面转场与详情页已可交互。
- 顶部导航与移动端 Dock 已移除；全站导航靠滚动和右上角的主题球。
- 主题切换目前是单层圆环 `Bloom`；6 条完整分镜与 Three.js 世界还在下一步。
