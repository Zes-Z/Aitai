# Aitai · 会いたい

一个可以在「星空 / 海月 / 朝凪」三个世界之间下潜、浮起、等待天亮的三语个人博客。

当前是 **M3 可运行切片**：Astro 7 + Tailwind 4 + Lenis，单页四幅、三主题切换、头像快捷菜单、三语路由、内容集合、页面转场、项目 / 相册 / 随想详情页已经跑通。顶部导航已移除，右上角的球单击切语言、长按切主题。

## 启动

```sh
pnpm install
pnpm dev
```

本地默认打开 <http://localhost:4321/zh/>；GitHub Pages 构建会自动加 `/Aitai/` 前缀。

```sh
pnpm build    # astro check + astro build
pnpm preview  # 预览 dist
```

临时验证脚本、截图和录屏统一放在系统临时目录，不写入项目。

GitHub Pages 地址为 <https://zes-z.github.io/Aitai/>。`astro.config.mjs` 会按 `GITHUB_ACTIONS / CF_PAGES / ASTRO_BASE` 自动选择 `/Aitai/` 或 `/`；站内链接与资源路径都通过 `withBase` 生成。推送到 `main` 后，现有 GitHub Actions 工作流会自动构建并部署。

## 已实现

- **四幅首页**：潮汐线 / 漂流物 / 三域 / 归港。
- **三主题**：星空 / 海月（海上明月，不是水母）/ 朝凪；默认朝凪（`SiteConfig.theme.default` 可改）；长按主题球直接循环切换、全屏换界、localStorage 持久化、无闪首帧。
- **头像菜单**：读取 `SiteConfig.identity.socials`，点击在右下方 90° 区域内等角度展开，基础半径 80px；长按 460ms 回到当前页面顶部，Space / Home 回顶，↓ 打开链接，Escape 关闭。GitHub / 邮件 / CV 图标沿用 funiki 的 SVG 风格。自定义图标用 `iconSrc`，空链接显示为不可点击的占位；CV 使用 `{ label: 'CV', href: '/kim cv.pdf', icon: 'cv' }`，头像、首屏、漂流物和尾幅的下载入口共用这条配置。
- **对称边界**：头像按钮与主题球都是 46px，顶部与左右边缘使用相等的安全区边距。所有页面的内容留白由按钮内侧边界推导；窄屏标题、列表和相册随内容宽度排版。
- **三语**：`/[lang]/`，zh / en / ja；一个键 × 三语的 `messages`；`hreflang` 与三语路由。
- **内容集合**：`src/content/post/<slug>/{zh,en,ja}.md`、`src/content/project/<slug>/{zh,en,ja}.md`，共 21 个 markdown；页面通过 `getCollection` / `render()` 读取，正文由 Astro 渲染。
- **相册集合**：`src/content/album/photo-video.json` 保留 Zes4U 字段（title / text 为 `[zh,en,ja]` 三语数组），`src/loaders/album.ts` 把每条记录变成独立 entry；相册页与首页影像域都从集合读取。
- **页面转场**：Tide / Constellate / Develop / Veil 四种；ClientRouter 负责导航，自研 overlay + Web Animations API 负责「封面 + 揭示」；支持返回、中断、reduced-motion；Astro 默认转场已关闭。
- **语言切换**：朝凪用暖杏色 `Frame`，外框先展开、新页面随后显露；海月用深青色双层 `Curtain`，幕布升起覆盖旧页、再收起揭示新页；星空用蓝紫色 `Slices`，桌面五列、手机三列错峰推进新旧页面。Frame / Slices 使用隔离的静态页面快照，包含当时的背景画布；语言切换保留滚动位置，目标页较短时限制在可滚动范围内，返回时恢复各页保存的位置并反向播放。切换期间锁定输入，结束后恢复语言按钮焦点。支持中断恢复、慢速加载及减少动态效果。
- **内容页**：项目列表 / 详情、相册、随想列表 / 正文，全部静态生成（35 页）。
- **交互**：Lenis 平滑滚动、自定义光标、滚动揭示、数字滚动、轨道拖拽、复制邮箱 Toast。
- **第二幅「漂流物」**：改成可拖拽的漂浮场——4 张卡可以拖动、惯性、边界回弹、hover 光斑、复位；数字滚动、实时时间、技能 marquee 都在同一块场里。
- **主题球**：46px 控制球；单击切换语言（按主题选择 Frame / Curtain / Slices），长按 460ms 按「朝凪 → 海月 → 星空」循环主题；键盘 Space / ↓ 切主题，Enter 切语言。朝凪恢复 CSS 太阳（从 12px 放大到 20px），去掉球内轨道圆圈，太阳沿 7 个关键点的闭合路径绕球心游走；海月直接使用 ReactBits Crystalized Ball（`eclipse` / `#BABABA` / 3 strands / 500 particles，按 46px 容器把 size 调到 0.9）；星空是 WebGL 三维光线追踪的黑洞与吸积盘。朝凪是轻量 CSS，海月是 ogl，星空是持久化 WebGL。
- **首页身份卡**：ReactBits Lanyard 3D 吊牌，绳子直接挂在页面顶部，不再使用大头像；正面是身份卡，背面通过 Lanyard 的 `backContent` 叠加 **ReactBits SpotlightCard 源码**（真实 DOM、跟随指针的聚光与边缘光），不是静态背图。可拖动、甩动、点击翻面；卡片正面仍是 CanvasTexture，背面 DOM 通过投影矩阵跟随 3D 卡片。
- **内容模型**：只认 Text / Media / Complex Post 三种对象；Zes4U 的封面 + 章节 + 三语 md 结构、loader 规则与目录树见 [REQUIREMENTS §9.0](REQUIREMENTS.md#90-三种内容对象m4-定稿)。
- **星空背景**：直接使用 ReactBits Galaxy 源码（WebGL2 星场、星云、闪烁、层深），只在星空主题挂载；海月/朝凪仍用原 Canvas 2D 世界。
- **世界引擎**：Canvas 2D 明月与海面 / 晨雾，跟随主题切换；星空由 Galaxy 接管；支持 reduced-motion。

## 结构

```
src/
  components/      AvatarDock, ThemeOrb, Hero, Driftage, Realms, Harbor, PageTransition..., lanyard/ (React + Three), orb/CrystalizedBall (React + ogl)
  content/post/    随想 markdown（zh / en / ja）
  content/project/ 项目 markdown（zh / en / ja）
  content/album/   photo-video.json + 相册媒体
  loaders/         album.ts（JSON → content entries）
  data/sample.ts   技能示例数据
  i18n/            一个键 × 三语
  pages/[lang]/    首页与详情页
  scripts/         world, theme, orb-art, avatar-dock, shell, page-transitions
  theme/           palettes, orb-shaders (star black hole), orb-fallback
  transitions/     language.ts（三种编排）、snapshot.ts（隔离页面快照）
  styles/page-transitions.css
  styles/global.css
SiteConfig.ts      身份、站点、导航、主题、动效开关
```

## 下一步

1. 按 [REQUIREMENTS §9.0](REQUIREMENTS.md#90-三种内容对象m4-定稿) 把内容迁移为 `text / media / posts` 三种对象；先给相册接入真实照片、响应式图片与 EXIF 面板。
2. 把主题切换从单层圆环升级为 6 条分镜（坠星 / 升星 / 浮月 / 沉日 / 暮落 / 破晓），接入 Three.js / TSL。
3. 补 Peel / 共享元素 / 组件 ↔ 页面转场。
4. Giscus 留言、命令面板、环境音。
5. 性能与 a11y 收尾：图片资源、Lighthouse、键盘全链路。

## 说明

- 朝凪球使用 CSS；海月与星空由原生 WebGL 实时渲染，全部材质程序化生成，不使用图片纹理、视频或外部模型文件。无 WebGL 时降级为 Canvas 绘制的动态海水与三维投影吸积盘。黑洞造型参考 [NASA 黑洞可视化](https://svs.gsfc.nasa.gov/14619)。
- 语言转场的 Frame / Curtain / Slices 编排参考并改写自 [Codrops Interlude](https://github.com/codrops/interlude)，以原生 Web Animations API 接入；保留 [MIT 许可证](third-party/interlude-LICENSE.txt)。全部颜色读取当前主题变量。
- 头像是 `public/avatar.svg` 占位，CV 是 `public/kim cv.pdf`，发布前替换。
- 相册目前用 `palette` 渐变和 `cover.svg` 占位；`photo-video.json` 的 `src` 指向尚未放入的真实照片。
- 三主题、头像快捷菜单、三语路由、内容集合、四种页面转场与详情页已可交互。
- 顶部导航与移动端 Dock 已移除；全站导航靠滚动和右上角的主题球。
- 主题切换目前是单层圆环 `Bloom`；6 条完整分镜与 Three.js 世界还在下一步。
