# Aitai · 会いたい

一个可以在「星空 / 海月 / 朝凪」三个世界之间下潜、浮起、等待天亮的三语个人博客。

当前是 **M3 可运行切片**：Astro 7 + Tailwind 4 + Lenis，首页为「潮汐线 / 内容流 / 归港」三段、三主题切换、头像快捷菜单、三语路由、内容集合与站内 Sheet 渲染已经跑通。顶部导航已移除，右上角的球单击切语言、长按切主题。

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

- **三段首页**：潮汐线 / 内容流 / 归港；内容流把项目、影像、随想合并成一条 justified 图片墙，没有标题、eyebrow、说明或计数。
- **三主题**：星空 / 海月（海上明月，不是水母）/ 朝凪；默认朝凪（`SiteConfig.theme.default` 可改）；长按主题球直接循环切换、全屏换界、localStorage 持久化、无闪首帧。
- **头像菜单**：读取 `SiteConfig.identity.socials`，点击在右下方 90° 区域内等角度展开，基础半径 80px；长按 460ms 回到当前页面顶部，Space / Home 回顶，↓ 打开链接，Escape 关闭。GitHub / 邮件 / CV 图标沿用 funiki 的 SVG 风格。自定义图标用 `iconSrc`，空链接显示为不可点击的占位；CV 使用 `{ label: 'CV', href: '/kim cv.pdf', icon: 'cv' }`，头像、首屏、漂流物和尾幅的下载入口共用这条配置。
- **对称边界**：头像按钮与主题球都是 46px，顶部与左右边缘使用相等的安全区边距。所有页面的内容留白由按钮内侧边界推导；窄屏标题、列表和相册随内容宽度排版。
- **三语**：`/[lang]/`，zh / en / ja；一个键 × 三语的 `messages`；`hreflang` 与三语路由。
- **内容集合**：完整采用 Zes4U 结构：`src/content/posts/<slug>/{zh,en,ja}.md` 为顶层文章，`<slug>/<chapter>/{zh,en,ja}.md` 为子章节；`zestLoader` 自动标记 `isSubpage`，同时复制 `welcome-site`、`friends.json`。
- **相册**：`src/content/album` 整体复制，`utils/album.ts` 直接读取 `photo-video.json`、`portfolio.md` 和文件夹资源；相册条目不进 content collection，与 Zes4U 的 gallery 管线一致。
- **页面转场**：Tide / Constellate / Develop / Veil 四种；ClientRouter 负责导航，自研 overlay + Web Animations API 负责「封面 + 揭示」；支持返回、中断、reduced-motion；Astro 默认转场已关闭。
- **语言切换**：朝凪用暖杏色 `Frame`，外框先展开、新页面随后显露；海月用深青色双层 `Curtain`，幕布升起覆盖旧页、再收起揭示新页；星空用蓝紫色 `Slices`，桌面五列、手机三列错峰推进新旧页面。Frame / Slices 使用隔离的静态页面快照，包含当时的背景画布；语言切换保留滚动位置，目标页较短时限制在可滚动范围内，返回时恢复各页保存的位置并反向播放。切换期间锁定输入，结束后恢复语言按钮焦点。支持中断恢复、慢速加载及减少动态效果。
- **页面范围**：只生成三语首页、根跳转与 404，共 5 页；项目/相册/随想的归档页和详情页已移除。
- **交互**：Lenis 平滑滚动、自定义光标、滚动揭示、数字滚动、轨道拖拽、复制邮箱 Toast；浏览器页面滚动条隐藏。
- **角落长按**：控制球与左上角头像不再依赖 `setPointerCapture`，改用窗口级 `pointerup/pointercancel` + 420ms 指针抬起兜底；鼠标允许 36px 抖动、触控 18px，避免轻微移动取消长按；按钮 `touch-action: none`。
- **首页 Lanyard**：ReactBits Lanyard 原始源码直接挂在 hero 的全屏透明画布上；landscape、`anchor=right`、`elasticity=.1`、`damping=.3`、`gravity=.25`、`breeze=0`、`intro=false`、`strapLength=.6`（视觉上带子更长、卡片上下居中）、plain strap。正面**只有三行**：名字·年龄·居住地 / 座右铭 / 职业内容；没有 header、标签、编号、分割线、条码、页脚或水印。背面使用 `SiteConfig.identity.lanyard.backImage` 指向的图片（默认 ReactBits 原始封底图）；图片放在 `public/lanyard/`，推荐 1440×1024，其他比例会按 `cover` 裁切。年龄和职业在 `SiteConfig.identity` 中修改。≤1400px 收窄文案列，≤1100px 隐藏卡片。
- **内容流**：移植 funiki 02 Life in Frames 的 **depth field**——图片按深度散落、滚动穿越、鼠标磁性倾斜、可拖拽；reduced-motion / 无 JS 时回退到 justified 图片墙。Zes4U posts 与 album 按日期混合，无任何标题与提示。album 单图 / 视频点击打开 funiki lightbox 风格查看器；post 点击后用全屏 Sheet 原地渲染主 md + 所有子章节，不跳转页面。缩略图统一生成 **AVIF 质量 90 / 900px**，点击查看器再加载原始 JPG。
- **主题球**：46px 控制球；单击切换语言（按主题选择 Frame / Curtain / Slices），长按 460ms 按「朝凪 → 海月 → 星空」循环主题；键盘 Space / ↓ 切主题，Enter 切语言。朝凪恢复 CSS 太阳（从 12px 放大到 20px），去掉球内轨道圆圈，太阳沿 7 个关键点的闭合路径绕球心游走；海月直接使用 ReactBits Crystalized Ball（`eclipse` / `#DDEBFA` / 3 strands / 500 particles，按 46px 容器把 size 调到 0.9）；星空是 WebGL 三维光线追踪的黑洞与吸积盘。朝凪是轻量 CSS，海月是 ogl，星空是持久化 WebGL。
- **Markdown**：`utils/markdown.ts` 从 Zes4U 移植 unified 管线，支持 GFM、KaTeX、directive 特殊块、defList、GitHub alert、Shiki 高亮、代码复制；相关 prose / directive / code-block 样式逐条移植，已移除首字下沉。
- **统一背景画布**：三个主题的背景都是固定全屏层，hero 不再有独立渐变遮罩；内容流与归港全部透明，三段共用同一张背景资源。
- **星空背景**：直接使用 ReactBits Galaxy 源码（WebGL2 星场、星云、闪烁、层深），只在星空主题挂载。
- **朝凪背景**：直接使用 ReactBits Side Rays 源码，**默认配色和参数**（origin top-right / sunbeam 默认值），只在朝凪挂载；`followMouse=false` 去掉跟随鼠标，点击空白处保留一次短暂强度脉冲。
- **海月月亮**：Crystalized Ball 改为月光银 `#DDEBFA`，haze 0.22 / glow 0.85，不再是偏黑的色。
- **海月背景**：直接使用 ReactBits Gradient Waves 源码，按 ocean URL 参数：`horizonColor=#2563eb`、`waveColor=#38bdf8`、`crestColor=#e0f2fe`、`speed=0.5`、`amplitude=1.8`、`waveScale=0.9`、`swell=25`、`turbulence=28`、`lightAngle=150`；只在海月挂载。`mouseInteraction=false` 去掉跟随鼠标，`swellOnClick` 保留点击涌浪。

## 结构

```
src/
  components/      AvatarDock, ThemeOrb, Hero, ContentFlow, Harbor, PageTransition..., lanyard/ (React + Three), backgrounds/Galaxy + SideRays + GradientWaves, orb/CrystalizedBall (React + ogl)
  content/posts/          Zes4U posts/<slug>/{zh,en,ja}.md + 子章节
  content/welcome-site/  Zes4U welcome markdown
  content/album/         photo-video.json + portfolio.md + 相册媒体
  content/friends.json   友链数据
  loaders/               zest.ts（Zes4U 兼容 loader）
  utils/                 markdown.ts（LaTeX/directive/Shiki）、album.ts
  data/sample.ts         技能示例数据
  i18n/                  一个键 × 三语
  pages/[lang]/          三语首页（内容归档/详情路由已删除）
  scripts/               theme, orb-art, avatar-dock, shell, page-transitions, contentDepth/contentSheet
  theme/                 palettes, orb-shaders (star black hole), orb-fallback
  transitions/           language.ts（语言切换已停用）、snapshot.ts（隔离页面快照）
  styles/page-transitions.css
  styles/global.css
SiteConfig.ts            身份、站点、主题
```

## 下一步

1. 继续完善 Zes4U 内容：相册 EXIF/portfolio 分组、文章内图片 lazy/AVIF、搜索与 RSS。
2. 把主题切换从单层圆环升级为 6 条分镜（坠星 / 升星 / 浮月 / 沉日 / 暮落 / 破晓），接入 Three.js / TSL。
3. 补 Peel / 共享元素 / 组件 ↔ 页面转场。
4. Giscus 留言、命令面板、环境音。
5. 性能与 a11y 收尾：图片资源、Lighthouse、键盘全链路。

## 说明

- 朝凪球使用 CSS；海月与星空由原生 WebGL 实时渲染，全部材质程序化生成，不使用图片纹理、视频或外部模型文件。无 WebGL 时降级为 Canvas 绘制的动态海水与三维投影吸积盘。黑洞造型参考 [NASA 黑洞可视化](https://svs.gsfc.nasa.gov/14619)。
- 语言转场的 Frame / Curtain / Slices 编排参考并改写自 [Codrops Interlude](https://github.com/codrops/interlude)，以原生 Web Animations API 接入；保留 [MIT 许可证](third-party/interlude-LICENSE.txt)。全部颜色读取当前主题变量。
- 头像是 `public/avatar.svg` 占位，CV 是 `public/kim cv.pdf`，发布前替换。
- 相册目前用 `palette` 渐变和 `cover.svg` 占位；`photo-video.json` 的 `src` 指向尚未放入的真实照片。
- 三主题、头像快捷菜单、三语路由、内容集合、页面转场、媒体查看器与内容 Sheet 已可交互。
- 顶部导航与移动端 Dock 已移除；全站导航靠滚动和右上角的主题球。
- 主题切换目前是单层圆环 `Bloom`；6 条完整分镜与 Three.js 世界还在下一步。
