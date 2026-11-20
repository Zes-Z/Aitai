# 项目定位
* 组件丰富
* 组件动画多样且和谐
* 转场动画新奇且优雅
* 超高交互
* 页面内容、结构整体和谐
* 多语言
* 动态单页式三主题（星空/海月/待定）astro博客

## 参考资源
### 博客整体页面框架参考资源
* https://astro.build/themes/1/
* https://japan.2-wg.com/category/taste/minimal/?utm_source=chatgpt.com
* https://onepagelove.com/inspiration
* https://ui.aceternity.com/components


### 转场动画资源
* https://save.design/elements/page-transitions?utm_source=chatgpt.com
* https://interlude.crnacura.workers.dev/
* https://www.landing.love/effect/page-transition/?utm_source=chatgpt.com
* https://webflow.com/made-in-webflow/page-transitions?utm_source=chatgpt.com



### 组件资源
* https://reactbits.dev/get-started/inde
* https://motion-primitives.com/docs/accordion
* https://animate-ui.com/docs/primitives/animate-ui/avatar-group
* https://www.cult-ui.com/docs/components/dynamic-island
* https://tympanus.net/codrops/hub/
* https://magicui.design/docs/components
* https://ui.aceternity.com/components



## SOP
1. 仔细寻找，阅读，浏览可参考的资源中的页面布局、组件动画效果
2. 根据项目的页面显示需求和动画实现要求，优先寻找参考资源中相同或相近的显示效果，构建大致页面架构
3. 复制参考资源的对应实现的代码，优化并使用，如果没有找到实现代码，你需要从零复刻，务必一模一样的动画！


## 页面布局、转场及交互组件
### 本项目的页面幅及对应内容
1. 本博客只有三种内容对象，它们分别出现在不同的页面幅。
   1. `文字对象`，主要出现在博客的需要文字说明的位置；
   2. `图片/视频或带封面的作品集文件夹对象`，作品集对象中是多个图片、视频，还有一个需要渲染的.md文件；
   3. 带图片封面的复杂`多层级多语言post文件夹对象`。
2. 首页第一幅为开场，展示内容主要是一张封面图或一段视频（这个可能不使用）、文字、图标对象。
3. 第二幅为项目展示区，内容对象为：带封面的项目文件夹（结构同作品集）。
4. 第三幅用于展示图片、视频、作品集、post。
5. 末尾为博客收尾区


### 页面转场的动画实现
#### 页面与页面之间的转场



#### 交互组件向页面的转场




#### 页面向交互组件的转场



### 交互组件的布局






## 本项目的文件结构框架
1. 整体文件结构`扁平化`。首页个人头像、封面图片和kim cv.pdf等公共文件存放在public中。
2. src/content为内容存放区，主要有以下三大子类：
   1. src/content/post文件夹存放第三幅中的`复杂多层级post对象`，例如src/content/post/电路学笔记/zh.md、en.md、ja.md、封面.jpg、第一章、第二章、第三章/zh.md、en.md、ja.md；
   2. src/content/album用于存放博客中的`图片、视频、作品集`（公共媒体对象放在public中），即第三幅中展示的内容，具体结构参考存Zes4U/src/content/album；注意：图片的这个存储图片的文件中的具体字段你可以参照Zes4U/src/content/album/photo-video.json，Zes4U/cli/sync-gallery.mjs这个是自动爬取的。
   3. src/content/project存放内容种类多样的`实践项目文件夹`，例如src/content/project/dailyup/xx.jpg、xxx.md、xx.mp4。
3. src/components用于存放各种`岛屿组件`。
4. 其他文件结构你可以按照普遍的astro项目实现来做。
5. 各种可自定义的设置优先集成到SiteConfig.ts中。



## 技术路径
你可以使用任何稳定且普遍的react、vue、npm、astro包以及各种语言，优先保证项目的`整体完成度`以及`动画实现和质量`，这是最重要的。



## 主题、语言切换
1. 与大部分的明暗切换主题的博客不同，本博客主题是在星空/海月/待定三套主题之间切换。你需要先设计三套主题对应的页面转场动画，适用特色组件。然后为每个主题分别创造一个由本主题“切出”到“切入”下一个主题的切换动画。
2. 本博客定位为多语博客，目前暂定中/英/日，但不排除以后继续扩展。在设定键值对时，优先将一个键的不同语言的值组合在一起，而不是优先组合一个语言键的所有参数值。



## 博客之禅
1. 化繁为简，简中现繁
2. 博采众长，融会贯通，化为己用
3. 随心所欲



## 细节要求
