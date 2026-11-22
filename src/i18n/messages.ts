import type { L10n } from '../types';
import { siteConfig } from '../../SiteConfig';

/**
 * 一个键 × 三语。新增语言时只改这里和 Lang 类型。
 */
export const messages = {
  'nav.home': { zh: '首页', en: 'Home', ja: 'ホーム' },


  'hero.scroll.dawn': siteConfig.hero.scrollCue.dawn,
  'hero.scroll.sea': siteConfig.hero.scrollCue.sea,
  'hero.scroll.star': siteConfig.hero.scrollCue.star,
  'hero.downloadCv': { zh: '下载简历', en: 'Download CV', ja: '履歴書をダウンロード' },
  'hero.email': { zh: '写信', en: 'Email me', ja: 'メールする' },
  'hero.github': { zh: 'GitHub', en: 'GitHub', ja: 'GitHub' },



  'harbor.title': { zh: '又见面了。', en: 'See you again.', ja: 'またね。' },
  'harbor.intro': { zh: '如果你也刚好路过，留一句话，或者写一封邮件。', en: 'If you happen to pass by, leave a word, or write me an email.', ja: 'もし通りかかったなら、ひとこと、あるいはメールを。' },
  'harbor.contact': { zh: '漂流瓶', en: 'Message in a bottle', ja: '漂流瓶' },
  'harbor.email': { zh: '复制邮箱', en: 'Copy email', ja: 'メールをコピー' },
  'harbor.backToTop': { zh: '回到水面', en: 'Back to surface', ja: '水面へ戻る' },

  'footer.rights': { zh: '保留所有想念', en: 'All longing reserved', ja: '想いは、すべて保留' },
  'footer.built': { zh: '用 Astro 和一点点夜色做成', en: 'Made with Astro and a little night', ja: 'Astro と少しの夜でできています' },

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
  'aria.close': { zh: '关闭', en: 'Close', ja: '閉じる' },
  'aria.previous': { zh: '上一个', en: 'Previous', ja: '前へ' },
  'aria.next': { zh: '下一个', en: 'Next', ja: '次へ' },

  'toast.copied': { zh: '已复制，等你来信。', en: 'Copied. I will wait for your letter.', ja: 'コピーしました。手紙、待っています。' },
  '404.title': { zh: '这里什么都没有。', en: 'Nothing here.', ja: 'ここには何もない。' },
  '404.desc': {
    zh: '你可能漂到了地图之外。',
    en: 'You may have drifted off the map.',
    ja: '地図の外に流れ着いたようです。',
  },
  '404.home': { zh: '回到岸边', en: 'Back to shore', ja: '岸へ戻る' },
} satisfies Record<string, L10n>;

export type MessageKey = keyof typeof messages;
