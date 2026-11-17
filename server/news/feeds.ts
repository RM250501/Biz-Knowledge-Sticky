// ニュースの取得元（RSS）の設定。取得元を変えるときはこのファイルだけを編集する。
// 各サイトの利用条件の範囲（見出しと元記事へのリンクの表示）で使うこと。
// 取得できるかは `npm run check:news -- --live` で確認できる。

export type NewsFeed = {
  // 画面に出す配信元の名前
  source: string;
  url: string;
};

export type NewsFeedCategory = {
  id: string;
  name: string;
  feeds: NewsFeed[];
};

// 1カテゴリに表示する記事の数
export const ARTICLES_PER_CATEGORY = 3;

export const NEWS_FEED_CATEGORIES: NewsFeedCategory[] = [
  {
    id: 'tech',
    name: 'IT・テクノロジー',
    feeds: [{ source: 'ITmedia NEWS', url: 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml' }],
  },
  {
    id: 'economy',
    name: '経済・ビジネス',
    feeds: [{ source: 'NHKニュース', url: 'https://www.nhk.or.jp/rss/news/cat5.xml' }],
  },
  {
    id: 'society',
    name: '政治・社会',
    feeds: [
      { source: 'NHKニュース', url: 'https://www.nhk.or.jp/rss/news/cat4.xml' },
      { source: 'NHKニュース', url: 'https://www.nhk.or.jp/rss/news/cat1.xml' },
    ],
  },
];
