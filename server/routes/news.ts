import { Router } from 'express';
import { fetchAllNews, loadNewsCache, saveNewsCache, type NewsCategory } from '../news/aggregator';

// ニュースは各サイトの RSS から取得する（AI は使わないので利用枠の影響を受けない）。
// 取得元は server/news/feeds.ts で設定する。

// 取得結果をこの時間は使い回す。
const CACHE_TTL_MS = 30 * 60 * 1000;
// 「最新情報を取得」を押しても、前回取得からこの時間はキャッシュを返す（取得元への連続アクセスを防ぐ）。
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
// 取得に失敗したあと、この時間は取得し直さない。
const FAILURE_RETRY_INTERVAL_MS = 2 * 60 * 1000;

let cache: { fetchedAt: number; categories: NewsCategory[] } | null = loadNewsCache();
let lastFailureAt = 0;
// 取得中のリクエストがあれば、それを共有して取得元へのアクセスを1回にまとめる。
let inflight: Promise<NewsCategory[]> | null = null;

function refreshNews() {
  if (!inflight) {
    inflight = fetchAllNews()
      .then(({ categories, errors }) => {
        if (errors.length > 0) console.warn('[news] some feeds failed:', errors.join(' / '));
        if (categories.length > 0) {
          cache = { fetchedAt: Date.now(), categories };
          saveNewsCache(categories, cache.fetchedAt);
          lastFailureAt = 0;
        } else {
          lastFailureAt = Date.now();
        }
        return categories;
      })
      .catch((error) => {
        lastFailureAt = Date.now();
        throw error;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export const newsRouter = Router();

newsRouter.get('/', async (req, res) => {
  const age = cache ? Date.now() - cache.fetchedAt : Infinity;
  const wantsRefresh = req.query.refresh === '1' && age >= MIN_REFRESH_INTERVAL_MS;
  const recentlyFailed = Date.now() - lastFailureAt < FAILURE_RETRY_INTERVAL_MS;

  // 新しいキャッシュがあれば、それを返す。
  if (cache && age < CACHE_TTL_MS && !wantsRefresh) {
    res.json({ categories: cache.categories, source: 'cached', fetchedAt: cache.fetchedAt });
    return;
  }

  // 直前に失敗したばかりなら、取得し直さずに手元の結果を返す。
  if (recentlyFailed) {
    if (cache) {
      res.json({ categories: cache.categories, source: 'stale', fetchedAt: cache.fetchedAt });
    } else {
      res.status(502).json({ error: 'upstream_error' });
    }
    return;
  }

  try {
    const categories = await refreshNews();
    if (categories.length > 0 && cache) {
      res.json({ categories: cache.categories, source: 'new', fetchedAt: cache.fetchedAt });
      return;
    }
  } catch (error) {
    console.error('[news] fetch failed:', error);
  }

  // 取得できなかった：以前の結果があればそれを返す。
  if (cache) {
    res.json({ categories: cache.categories, source: 'stale', fetchedAt: cache.fetchedAt });
  } else {
    res.status(502).json({ error: 'upstream_error' });
  }
});
