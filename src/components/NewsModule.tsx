import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { ApiError, fetchNewsTopics, type NewsCategory } from '../services/apiClient';

// 最後に表示できたニュース。API サーバーに届かないときの予備として、このブラウザに残す。
const NEWS_CACHE_KEY = 'biz_news_cache_v2';
const LEGACY_KEYS = ['biz_daily_news', 'biz_daily_news_date', 'biz_daily_news_time'];

type SavedNews = { fetchedAt: number; categories: NewsCategory[] };

function formatDateTime(ms: number) {
  return new Date(ms).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function readSavedNews(): SavedNews | null {
  try {
    const data = JSON.parse(localStorage.getItem(NEWS_CACHE_KEY) || 'null');
    return typeof data?.fetchedAt === 'number' && Array.isArray(data?.categories) ? data : null;
  } catch {
    return null;
  }
}

function writeSavedNews(data: SavedNews) {
  try {
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(data));
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // 保存できなくても表示には影響しない
  }
}

// 失敗の原因に合わせて、利用者に伝えるメッセージを選ぶ。
function newsErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status >= 500 && error.code === null) {
    return 'API サーバーに接続できません。サーバー（npm run dev:api）が起動しているか確認してください。';
  }
  if (error instanceof TypeError) {
    return 'ネットワークに接続できないため、ニュースを取得できません。接続を確認してください。';
  }
  return 'ニュースの取得元に接続できませんでした。時間をおいて再度お試しください。';
}

export const NewsModule = () => {
  // UI に表示するカテゴリ別ニュースカード。
  const [displayNews, setDisplayNews] = useState<NewsCategory[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // 取得できなかったときの案内
  const [fetchError, setFetchError] = useState<string | null>(null);
  // 表示中のニュースを取得した日時
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchNews = useCallback(async (force = false) => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      // サーバーが RSS から取得し、30分ごとに更新したものを受け取る。
      const { categories, source, fetchedAt } = await fetchNewsTopics(force);
      if (categories.length === 0) throw new Error('No news received');
      const at = fetchedAt ?? Date.now();
      setDisplayNews(categories);
      setLastUpdated(formatDateTime(at));
      writeSavedNews({ fetchedAt: at, categories });
      if (source === 'stale') {
        setFetchError(`ニュースの取得元に接続できないため、${formatDateTime(at)} 時点のニュースを表示しています。`);
      }
    } catch (error) {
      console.error("Failed to fetch news topics:", error);
      const saved = readSavedNews();
      if (saved) {
        // API サーバーに届かないときは、このブラウザに残っている前回のニュースを表示する。
        setDisplayNews(saved.categories);
        setLastUpdated(formatDateTime(saved.fetchedAt));
        setFetchError(`${newsErrorMessage(error)}（${formatDateTime(saved.fetchedAt)} 時点のニュースを表示しています）`);
      } else {
        setFetchError(newsErrorMessage(error));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // モジュール表示時の初回ロード。
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Newspaper className="text-blue-600" /> 時事ニュース・業界動向
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-8">Stay Updated with Global Trends</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => fetchNews(true)}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-blue-600 disabled:opacity-50 group flex items-center gap-2"
          >
            <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">最新情報を取得</span>
            <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
          </button>
          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
            最終更新: {lastUpdated || (isRefreshing ? "取得中..." : "未取得")}
          </span>
        </div>
      </div>

      {fetchError && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayNews.length > 0 ? (
          displayNews.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" /> {cat.name}
                </h3>
              </div>
              <div className="p-4 flex-1 space-y-4">
                {cat.articles.map((art, i) => (
                  <div key={i} className="group">
                    <a 
                      href={art.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors mb-1 leading-snug"
                    >
                      {art.title}
                    </a>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="font-bold uppercase">
                        {art.source}
                        {art.publishedAt && <span className="font-normal ml-2">{formatDateTime(Date.parse(art.publishedAt))}</span>}
                      </span>
                      <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : isRefreshing ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-pulse h-48">
              <div className="bg-gray-100 h-10 border-b border-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-400 italic">
            {fetchError ? 'ニュースはまだありません。' : 'ニュースを読み込めませんでした。更新ボタンを押してください。'}
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700 flex items-start gap-3">
        <div className="p-2 bg-white rounded-full shadow-sm">
          <Newspaper size={16} className="text-blue-500" />
        </div>
        <div>
          <p className="font-bold mb-1 uppercase tracking-wider">💡 学習のヒント</p>
          <p className="leading-relaxed">最新のニュースを把握することは、ビジネスパーソンとしての信頼構築に繋がります。毎日5分、主要カテゴリの動向をチェックしましょう。</p>
        </div>
      </div>
    </div>
  );
};
