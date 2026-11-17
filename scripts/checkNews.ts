// ニュース（RSS）の取得チェック。
//   npm run check:news            … サンプルの RSS で、読み取りとまとめ方を確認する（ネットワーク不要・CI で実行）
//   npm run check:news -- --live  … server/news/feeds.ts の取得元に実際に接続して確認する
import { parseFeed } from '../server/news/rss';
import { fetchAllNews } from '../server/news/aggregator';
import { NEWS_FEED_CATEGORIES, ARTICLES_PER_CATEGORY } from '../server/news/feeds';

let failures = 0;
function check(label: string, got: unknown, expected: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? 'OK' : 'NG'}  ${label}: ${JSON.stringify(got)}${ok ? '' : `（期待値 ${JSON.stringify(expected)}）`}`);
}

const RSS2 = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>サンプル</title><link>https://example.com/</link>
<item><title>日銀、金融政策を&quot;維持&quot; &amp; 声明</title><link>https://example.com/a</link><pubDate>Mon, 16 Nov 2026 10:00:00 +0900</pubDate></item>
<item><title><![CDATA[新製品 <発表> のお知らせ]]></title><link>https://example.com/b</link><pubDate>Mon, 16 Nov 2026 12:30:00 +0900</pubDate></item>
<item><title>危険なリンク</title><link>javascript:alert(1)</link></item>
<item><title>リンクなし</title></item>
</channel></rss>`;

const RDF = `<?xml version="1.0"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://purl.org/rss/1.0/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<item rdf:about="https://example.org/1"><title>RDF の記事</title><link>https://example.org/1</link><dc:date>2026-11-16T09:00:00+09:00</dc:date></item>
</rdf:RDF>`;

const ATOM = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Atom</title>
<entry><title>Atom の記事</title><link rel="alternate" href="https://example.net/x"/><updated>2026-11-16T01:00:00Z</updated></entry>
</feed>`;

async function offline() {
  console.log('RSS 2.0');
  const rss = parseFeed(RSS2);
  check('有効な記事だけを読む（危険なリンク・リンクなしは除く）', rss.length, 2);
  check('エンティティを戻す', rss[0]?.title, '日銀、金融政策を"維持" & 声明');
  check('CDATA はそのまま', rss[1]?.title, '新製品 <発表> のお知らせ');
  check('日時を ISO 形式に', rss[1]?.publishedAt, '2026-11-16T03:30:00.000Z');

  console.log('\nRSS 1.0（RDF）/ Atom');
  check('RDF の記事', parseFeed(RDF).map((i) => [i.title, i.url, i.publishedAt]), [['RDF の記事', 'https://example.org/1', '2026-11-16T00:00:00.000Z']]);
  check('Atom の記事', parseFeed(ATOM).map((i) => [i.title, i.url]), [['Atom の記事', 'https://example.net/x']]);
  check('壊れた XML でも例外を出さない', parseFeed('<rss><item><title>途中で切れ'), []);

  console.log('\nまとめ方（取得元を差し替えて確認）');
  const feedXml = (n: number, prefix: string) => `<rss><channel>${Array.from({ length: n }, (_, i) =>
    `<item><title>${prefix}${i}</title><link>https://example.com/${prefix}${i}</link><pubDate>Mon, 16 Nov 2026 ${String(10 + i).padStart(2, '0')}:00:00 +0900</pubDate></item>`).join('')}</channel></rss>`;
  const fakeFetch = async (url: string) => {
    // 1つ目のカテゴリの取得元だけ失敗させ、ほかは記事を5件返す
    if (url === NEWS_FEED_CATEGORIES[0].feeds[0].url) return new Response('error', { status: 503 });
    return new Response(feedXml(5, 'n'), { status: 200 });
  };
  const { categories, errors } = await fetchAllNews(fakeFetch as typeof fetch);
  check('失敗した取得元はエラーとして報告', errors.length, NEWS_FEED_CATEGORIES[0].feeds.length);
  check('記事のないカテゴリは除く', categories.some((c) => c.id === NEWS_FEED_CATEGORIES[0].id), false);
  check(`1カテゴリ ${ARTICLES_PER_CATEGORY} 件まで`, categories.every((c) => c.articles.length <= ARTICLES_PER_CATEGORY), true);
  check('新しい順', categories[0]?.articles.map((a) => a.title), ['n4', 'n3', 'n2']);
  const multi = categories.find((c) => NEWS_FEED_CATEGORIES.find((f) => f.id === c.id)!.feeds.length > 1);
  if (multi) check('複数の取得元で同じ記事は1件にまとめる', new Set(multi.articles.map((a) => a.url)).size, multi.articles.length);
}

async function live() {
  console.log('取得元に接続して確認します（server/news/feeds.ts）\n');
  for (const category of NEWS_FEED_CATEGORIES) {
    for (const feed of category.feeds) {
      try {
        const res = await fetch(feed.url, { signal: AbortSignal.timeout(10000) });
        const items = res.ok ? parseFeed(await res.text()) : [];
        const ok = res.ok && items.length > 0;
        if (!ok) failures += 1;
        console.log(`${ok ? 'OK' : 'NG'}  [${category.name}] ${feed.source} ${feed.url}`);
        console.log(`      HTTP ${res.status}、記事 ${items.length} 件${items[0] ? `（最新：${items[0].title}）` : ''}`);
      } catch (error) {
        failures += 1;
        console.log(`NG  [${category.name}] ${feed.source} ${feed.url}`);
        console.log(`      ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}

(async () => {
  if (process.argv.includes('--live')) await live();
  else await offline();
  if (failures > 0) {
    console.error(`\n${failures} 件失敗しました`);
    process.exit(1);
  }
  console.log('\nOK');
})();
