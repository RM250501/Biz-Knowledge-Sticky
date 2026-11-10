import { Router } from 'express';
import { getGeminiModel, getGenAI, hasGeminiKey } from '../gemini';
import { toLocalDateKey } from '../../shared/date';

// refresh=1 でも、この間隔より短い再取得はキャッシュを返す。
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export type NewsArticle = { title: string; source: string; url: string };
export type NewsCategory = { id: string; name: string; articles: NewsArticle[] };

// 同じ日の再取得で AI を何度も呼ばないよう、日付単位でメモリに保持する。
let cache: { date: string; fetchedAt: number; categories: NewsCategory[] } | null = null;

async function fetchNewsTopics(): Promise<NewsCategory[]> {
  const ai = getGenAI();
  const today = new Date().toLocaleDateString('ja-JP');
  const prompt = `あなたはプロのニュースキュレーターです。本日（${today}時点）の日本および世界の主要ニュース・業界動向を調査し、以下のカテゴリーごとに実在する最新記事をピックアップしてください：
    1. IT・テクノロジー
    2. 経済・ビジネス
    3. 政治・社会

    各カテゴリーにつき2〜3件の記事を提供してください。
    【最重要】URLは必ず、検索結果から得られた「現在アクセス可能な実際の個別記事のURL」を正確に記載してください。トップページのURLや、存在しないパス、存在しない記事IDを含む嘘のURL（ハルシネーション）は絶対に含めないでください。
    信頼できるソース（日本経済新聞、ITmedia、ロイター、読売新聞、東洋経済オンラインなど）の記事を優先してください。`;

  const response = await ai.models.generateContent({
    model: getGeminiModel(),
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true },
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            name: { type: 'STRING' },
            articles: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  source: { type: 'STRING' },
                  url: { type: 'STRING' },
                },
                required: ['title', 'source', 'url'],
              },
            },
          },
          required: ['id', 'name', 'articles'],
        },
      },
    },
  });

  const parsed = JSON.parse(response.text || '[]');
  if (!Array.isArray(parsed)) return [];

  // 表示できない要素を取り除く。
  return parsed
    .filter((cat: any) => cat && typeof cat.name === 'string' && Array.isArray(cat.articles))
    .map((cat: any, index: number) => ({
      id: String(cat.id || `cat-${index}`),
      name: cat.name,
      articles: cat.articles.filter(
        (a: any) => a && typeof a.title === 'string' && typeof a.url === 'string' && /^https?:\/\//.test(a.url),
      ),
    }));
}

export const newsRouter = Router();

// 取得中のリクエストがあれば、それを共有して AI 呼び出しを 1 回にまとめる。
let inflight: Promise<NewsCategory[]> | null = null;

function fetchNewsShared(todayKey: string) {
  if (!inflight) {
    inflight = fetchNewsTopics()
      .then((categories) => {
        if (categories.length > 0) cache = { date: todayKey, fetchedAt: Date.now(), categories };
        return categories;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

newsRouter.get('/', async (req, res) => {
  if (!hasGeminiKey()) {
    res.status(503).json({ error: 'gemini_not_configured' });
    return;
  }

  // 同じ日のキャッシュがあれば返す。refresh=1 でも前回取得から一定時間はキャッシュを返す。
  const todayKey = toLocalDateKey();
  const refreshAllowed = req.query.refresh === '1'
    && (!cache || Date.now() - cache.fetchedAt >= MIN_REFRESH_INTERVAL_MS);
  if (cache && cache.date === todayKey && cache.categories.length > 0 && !refreshAllowed) {
    res.json({ categories: cache.categories, source: 'cached' });
    return;
  }

  try {
    const categories = await fetchNewsShared(todayKey);
    if (categories.length === 0) {
      res.status(502).json({ error: 'empty_response' });
      return;
    }
    res.json({ categories, source: 'new' });
  } catch (error) {
    console.error('[news] fetch failed:', error);
    res.status(502).json({ error: 'upstream_error' });
  }
});
