import type { L10n } from '../types';

/**
 * 一个键 × 三语。新增语言时只改这里和 Lang 类型。
 */
export const messages = {
  'nav.home': { zh: '首页', en: 'Home', ja: 'ホーム' },
  'nav.about': { zh: '关于', en: 'About', ja: 'アバウト' },
  'nav.projects': { zh: '项目', en: 'Projects', ja: 'プロジェクト' },
  'nav.album': { zh: '影像', en: 'Album', ja: '写真' },
  'nav.thoughts': { zh: '随想', en: 'Thoughts', ja: '随想' },
  'nav.contact': { zh: '联系', en: 'Contact', ja: 'コンタクト' },
  'nav.menu': { zh: '菜单', en: 'Menu', ja: 'メニュー' },
  'nav.close': { zh: '关闭', en: 'Close', ja: '閉じる' },

  'act.tide': { zh: '潮汐线', en: 'Tide Line', ja: '潮汐線' },
  'act.drift': { zh: '漂流物', en: 'Driftage', ja: '漂流物' },
  'act.realms': { zh: '三域', en: 'Three Realms', ja: '三つの領域' },
  'act.harbor': { zh: '归港', en: 'Harbor', ja: '帰港' },

  'hero.greeting': { zh: '你好，我是 KIM。', en: "Hi, I'm KIM.", ja: 'こんにちは、KIM です。' },
  'hero.role': { zh: '设计、前端，以及一些没做完的事', en: 'Design, front-end, and a few unfinished things', ja: 'デザインとフロントエンド、あと未完のこと' },
  'hero.scroll': { zh: '向下，潜入夜里', en: 'Scroll to dive', ja: '下へ、夜へ潜る' },
  'hero.now': { zh: '现在', en: 'Now', ja: 'いま' },
  'hero.location': { zh: '位置', en: 'Location', ja: '場所' },
  'hero.downloadCv': { zh: '下载简历', en: 'Download CV', ja: '履歴書をダウンロード' },
  'hero.email': { zh: '写信', en: 'Email me', ja: 'メールする' },
  'hero.github': { zh: 'GitHub', en: 'GitHub', ja: 'GitHub' },
  'hero.available': { zh: '可接新项目', en: 'Open to work', ja: '新しい仕事、受付中' },

  'drift.eyebrow': { zh: '02 / 漂流物', en: '02 / Driftage', ja: '02 / 漂流物' },
  'drift.title': { zh: '漂在海上的东西。', en: 'Things adrift.', ja: '海に漂うもの。' },
  'drift.intro': { zh: '拖动它们，或者只是看看。', en: 'Drag them, or just watch.', ja: 'ドラッグしても、ただ眺めても。' },
  'drift.drag': { zh: '拖动', en: 'Drag', ja: 'ドラッグ' },
  'drift.reset': { zh: '复位', en: 'Reset', ja: 'リセット' },
  'drift.nowTitle': { zh: '现在', en: 'Now', ja: 'いま' },
  'drift.nowBody': { zh: '在做 Aitai；在听坂本龍一；在学把话说短。', en: 'Building Aitai; listening to Ryuichi Sakamoto; learning to say less.', ja: 'Aitai をつくっている。坂本龍一を聴いている。短く話すことを学んでいる。' },
  'drift.cv': { zh: '看简历', en: 'Read my CV', ja: '履歴書を読む' },
  'drift.statsNote': { zh: '从内容集合自动统计', en: 'Counted from the content collections', ja: 'コンテンツから自動集計' },
  'drift.skills': { zh: '设计 / 前端 / 摄影 / 日语 / 写作 / 一点点 3D', en: 'Design / Front-end / Photography / Japanese / Writing / A little 3D', ja: 'デザイン / フロントエンド / 写真 / 日本語 / 文章 / 少しの 3D' },
  'drift.timeline': { zh: '漂流轨迹', en: 'Drift log', ja: '漂流の記録' },
  'drift.quote': { zh: '“把好奇心做成日常。”', en: '“Make curiosity a daily habit.”', ja: '「好奇心を、日常に。」' },

  'realms.eyebrow': { zh: '03 / 三域', en: '03 / Three Realms', ja: '03 / 三つの領域' },
  'realms.title': { zh: '三个可以漂进去的地方。', en: 'Three places to drift into.', ja: '漂っていける、三つの場所。' },
  'realms.intro': { zh: '项目、影像、随想。选中一片海，横向拖动。', en: 'Projects, images, thoughts. Pick a sea and drag sideways.', ja: 'プロジェクト、写真、随想。海を選んで、横にドラッグ。' },
  'realms.projects': { zh: '项目', en: 'Projects', ja: 'プロジェクト' },
  'realms.album': { zh: '影像', en: 'Album', ja: '写真' },
  'realms.thoughts': { zh: '随想', en: 'Thoughts', ja: '随想' },
  'realms.viewAll': { zh: '查看全部', en: 'View all', ja: 'すべて見る' },
  'realms.drag': { zh: '拖动查看', en: 'Drag to explore', ja: 'ドラッグして見る' },
  'realms.count': { zh: '件', en: 'items', ja: '件' },

  'harbor.eyebrow': { zh: '04 / 归港', en: '04 / Harbor', ja: '04 / 帰港' },
  'harbor.title': { zh: '又见面了。', en: 'See you again.', ja: 'またね。' },
  'harbor.intro': { zh: '如果你也刚好路过，留一句话，或者写一封邮件。', en: 'If you happen to pass by, leave a word, or write me an email.', ja: 'もし通りかかったなら、ひとこと、あるいはメールを。' },
  'harbor.contact': { zh: '漂流瓶', en: 'Message in a bottle', ja: '漂流瓶' },
  'harbor.email': { zh: '复制邮箱', en: 'Copy email', ja: 'メールをコピー' },
  'harbor.social': { zh: '在别处', en: 'Elsewhere', ja: 'よそで' },
  'harbor.backToTop': { zh: '回到水面', en: 'Back to surface', ja: '水面へ戻る' },

  'footer.rights': { zh: '保留所有想念', en: 'All longing reserved', ja: '想いは、すべて保留' },
  'footer.built': { zh: '用 Astro 和一点点夜色做成', en: 'Made with Astro and a little night', ja: 'Astro と少しの夜でできています' },
  'footer.time': { zh: '本地时间', en: 'Local time', ja: '現地時間' },

  'theme.star': { zh: '星空', en: 'Starfield', ja: '星空' },
  'theme.sea': { zh: '海月', en: 'Sea Moon', ja: '海月' },
  'theme.dawn': { zh: '朝凪', en: 'Morning Calm', ja: '朝凪' },
  'theme.switch': { zh: '切换世界', en: 'Switch world', ja: '世界を変える' },
  'lang.switch': { zh: '语言', en: 'Language', ja: '言語' },
  'orb.label': { zh: '单击切换语言，长按切换主题；空格或向下键切换主题', en: 'Click to change language. Hold, press Space or Arrow Down to change theme.', ja: 'クリックで言語、長押し・スペース・下矢印でテーマを切り替え' },
  'orb.hint': { zh: '单击 / 长按', en: 'Tap / Hold', ja: 'タップ / 長押し' },
  'avatar.label': { zh: '单击展开个人链接，长按回到顶部；空格或 Home 键回到顶部', en: 'Click for personal links. Hold, press Space or Home to return to the top.', ja: 'クリックでリンク、長押し・スペース・Homeでページ先頭へ' },
  'avatar.links': { zh: '个人链接', en: 'Personal links', ja: '個人リンク' },
  'avatar.pending': { zh: '待配置', en: 'Not configured', ja: '未設定' },

  'aria.theme': { zh: '切换主题世界', en: 'Switch theme world', ja: 'テーマの世界を切り替える' },
  'aria.menu': { zh: '打开菜单', en: 'Open menu', ja: 'メニューを開く' },
  'aria.close': { zh: '关闭', en: 'Close', ja: '閉じる' },
  'aria.scrollTop': { zh: '回到顶部', en: 'Back to top', ja: 'トップへ戻る' },
  'aria.about': { zh: '关于我', en: 'About me', ja: 'わたしについて' },
  'aria.previous': { zh: '上一个', en: 'Previous', ja: '前へ' },
  'aria.next': { zh: '下一个', en: 'Next', ja: '次へ' },

  'toast.copied': { zh: '已复制，等你来信。', en: 'Copied. I will wait for your letter.', ja: 'コピーしました。手紙、待っています。' },
  'toast.soon': { zh: '这页还在路上。', en: 'This page is still on its way.', ja: 'このページはまだ途中です。' },
  'misc.now': { zh: '现在', en: 'Now', ja: 'いま' },
  'misc.drag': { zh: '拖动', en: 'Drag', ja: 'ドラッグ' },
  'misc.open': { zh: '打开', en: 'Open', ja: '開く' },

  'project.note': {
    zh: '过程记录还在整理。先看看它现在的样子，以及它是怎么被做出来的。',
    en: 'Process notes are still being sorted. For now, here is how it looks, and how it was made.',
    ja: '制作過程はまだ整理中。まずは今の姿と、つくり方を。',
  },
  'album.note': {
    zh: '这些是占位影像，之后会换成真实照片。',
    en: 'These are placeholder images. Real photographs will replace them.',
    ja: 'いまは仮のイメージ。あとで本当の写真に差し替えます。',
  },
  'thoughts.note': {
    zh: '一些没头没尾的念头，被装进不同的相框里。',
    en: 'Some thoughts without beginnings or ends, kept in different frames.',
    ja: '始まりも終わりもない考えを、ちがう額に入れて。',
  },
  '404.title': { zh: '这里什么都没有。', en: 'Nothing here.', ja: 'ここには何もない。' },
  '404.desc': {
    zh: '你可能漂到了地图之外。',
    en: 'You may have drifted off the map.',
    ja: '地図の外に流れ着いたようです。',
  },
  '404.home': { zh: '回到岸边', en: 'Back to shore', ja: '岸へ戻る' },
} satisfies Record<string, L10n>;

export type MessageKey = keyof typeof messages;
