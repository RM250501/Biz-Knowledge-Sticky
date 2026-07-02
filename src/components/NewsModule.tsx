import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { getActualNewsTopics } from '../services/geminiService';

export const NewsModule = () => {
  // UI に表示するカテゴリ別ニュースカード。
  const [displayNews, setDisplayNews] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // ニュース取得エラーメッセージ（再試行の促し）
  const [fetchError, setFetchError] = useState<string | null>(null);
  // 画面表示用の最終更新時刻。
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchNews = useCallback(async (force = false) => {
    // キャッシュは日付単位で管理する。
    const today = new Date().toISOString().split('T')[0];
    const savedNews = localStorage.getItem('biz_daily_news');
    const savedDate = localStorage.getItem('biz_daily_news_date');

    if (!force && savedNews && savedDate === today) {
      try {
        // 同日内の再取得を避けるためローカルキャッシュを再利用。
        setDisplayNews(JSON.parse(savedNews));
        setLastUpdated(localStorage.getItem('biz_daily_news_time') || "");
        setFetchError(null);
        return;
      } catch (e) {
        console.error("Failed to parse saved news:", e);
        // 破損キャッシュは削除
        localStorage.removeItem('biz_daily_news');
        localStorage.removeItem('biz_daily_news_date');
      }
    }

    setIsRefreshing(true);
    setFetchError(null);
    try {
      // Gemini サービスから最新カテゴリニュースを取得。
      const categories = await getActualNewsTopics();
      if (categories && Array.isArray(categories) && categories.length > 0) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDisplayNews(categories);
        setLastUpdated(timeStr);
        
        // 日付が変わるまでキャッシュとして保持。
        localStorage.setItem('biz_daily_news', JSON.stringify(categories));
        localStorage.setItem('biz_daily_news_date', today);
        localStorage.setItem('biz_daily_news_time', timeStr);
      } else {
        throw new Error("Invalid news data received");
      }
    } catch (error) {
      console.error("Failed to fetch news topics:", error);
      setFetchError(
        '最新ニュースの取得に失敗しました。ネットワークを確認するか、キャッシュをクリアして再度お試しください。'
      );
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
            最終更新: {lastUpdated || "取得中..."}
          </span>
        </div>
      </div>

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
                      <span className="font-bold uppercase">{art.source}</span>
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
            ニュースを読み込めませんでした。更新ボタンを押してください。
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
