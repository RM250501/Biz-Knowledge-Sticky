import type { QuizReport, QuizSessionLogItem } from '../../shared/quizReport';

// Gemini を使う処理はすべてサーバー（server/）経由で呼び出す。
// API キーはブラウザに渡さない。

export type NewsArticle = { title: string; source: string; url: string };
export type NewsCategory = { id: string; name: string; articles: NewsArticle[] };

async function readJson(response: Response) {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`API ${response.status}${text ? `: ${text}` : ''}`);
  }
  return response.json();
}

export async function fetchNewsTopics(force = false): Promise<NewsCategory[]> {
  const response = await fetch(`/api/news${force ? '?refresh=1' : ''}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await readJson(response);
  if (!Array.isArray(data?.categories)) throw new Error('Invalid news data received');
  return data.categories as NewsCategory[];
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
