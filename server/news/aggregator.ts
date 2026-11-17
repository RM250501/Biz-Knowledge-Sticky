import fs from 'fs';
import path from 'path';
import { ARTICLES_PER_CATEGORY, NEWS_FEED_CATEGORIES, type NewsFeed, type NewsFeedCategory } from './feeds';
import { parseFeed } from './rss';

export type NewsArticle = { title: string; source: string; url: string; publishedAt: string | null };
export type NewsCategory = { id: string; name: string; articles: NewsArticle[] };

const FETCH_TIMEOUT_MS = 8000;
const MAX_FEED_BYTES = 2 * 1024 * 1024;
const CACHE_FILE = path.resolve(process.cwd(), '.data', 'news-cache.json');

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

async function fetchFeed(feed: NewsFeed, fetchImpl: FetchLike): Promise<NewsArticle[]> {
  const response = await fetchImpl(feed.url, {
    headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${feed.url}: HTTP ${response.status}`);
  const text = await response.text();
  if (text.length > MAX_FEED_BYTES) throw new Error(`${feed.url}: too large`);
  return parseFeed(text).map((item) => ({ ...item, source: feed.source }));
}

// 1カテゴリ分：複数の取得元をまとめ、新しい順に重複を除いて上位を返す。
async function fetchCategory(category: NewsFeedCategory, fetchImpl: FetchLike) {
  const results = await Promise.allSettled(category.feeds.map((feed) => fetchFeed(feed, fetchImpl)));
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => String(r.reason?.message ?? r.reason));
  const seen = new Set<string>();
  const articles = results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
    .filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    })
    .slice(0, ARTICLES_PER_CATEGORY);
  return { category: { id: category.id, name: category.name, articles }, errors };
}

// すべてのカテゴリを取得する。記事が1件も取れなかったカテゴリは除く。
export async function fetchAllNews(fetchImpl: FetchLike = fetch) {
  const results = await Promise.all(NEWS_FEED_CATEGORIES.map((c) => fetchCategory(c, fetchImpl)));
  return {
    categories: results.map((r) => r.category).filter((c) => c.articles.length > 0),
    errors: results.flatMap((r) => r.errors),
  };
}

// 最後に取得できた結果をファイルに残す。サーバーを再起動しても、取得元が落ちていても表示できるように。
export function saveNewsCache(categories: NewsCategory[], fetchedAt: number) {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ fetchedAt, categories }));
  } catch (error) {
    console.warn('[news] failed to save cache:', error);
  }
}

export function loadNewsCache(): { fetchedAt: number; categories: NewsCategory[] } | null {
  try {
    const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (typeof data?.fetchedAt !== 'number' || !Array.isArray(data?.categories)) return null;
    return data;
  } catch {
    return null;
  }
}
