import type { QuizReport, QuizSessionLogItem } from '../../shared/quizReport';

// Gemini を使う処理はすべてサーバー（server/）経由で呼び出す。
// API キーはブラウザに渡さない。

export type NewsArticle = { title: string; source: string; url: string; publishedAt?: string | null };
export type NewsCategory = { id: string; name: string; articles: NewsArticle[] };

// API のエラー。code はサーバーが返したエラー種別（例: quota_exceeded）。
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
    readonly retryAfterSec: number | null,
    message: string,
  ) {
    super(message);
  }
}

async function readJson(response: Response) {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let body: any = null;
    try {
      body = JSON.parse(text);
    } catch {
      // JSON でないエラー（プロキシのエラーページなど）
    }
    throw new ApiError(
      response.status,
      typeof body?.error === 'string' ? body.error : null,
      typeof body?.retryAfterSec === 'number' ? body.retryAfterSec : null,
      `API ${response.status}${text ? `: ${text}` : ''}`,
    );
  }
  return response.json();
}

// source: 'new' / 'cached' = 最新の取得結果、'stale' = 取得元に接続できず以前の結果を返したもの。
// fetchedAt: サーバーがニュースを取得した時刻（ミリ秒）。
export type NewsResult = { categories: NewsCategory[]; source: 'new' | 'cached' | 'stale'; fetchedAt: number | null };

export async function fetchNewsTopics(force = false): Promise<NewsResult> {
  const response = await fetch(`/api/news${force ? '?refresh=1' : ''}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await readJson(response);
  if (!Array.isArray(data?.categories)) throw new Error('Invalid news data received');
  const source = data.source === 'stale' || data.source === 'cached' ? data.source : 'new';
  const fetchedAt = typeof data.fetchedAt === 'number' ? data.fetchedAt : null;
  return { categories: data.categories as NewsCategory[], source, fetchedAt };
}

export async function requestQuizReport(sessionLog: QuizSessionLogItem[]): Promise<QuizReport> {
  const response = await fetch('/api/quiz/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ sessionLog }),
  });
  const data = await readJson(response);
  if (!data?.report) throw new Error('Invalid report data received');
  return data.report as QuizReport;
}
