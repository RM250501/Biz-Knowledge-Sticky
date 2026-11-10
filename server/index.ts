import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { triviaRouter } from './trivia/routes';
import { newsRouter } from './routes/news';
import { quizReportRouter } from './routes/quizReport';
import { rateLimit } from './rateLimit';

dotenv.config({ path: '.env.local' });
dotenv.config();

const PORT = Number(process.env.TRIVIA_API_PORT || 8787);
const DIST_DIR = path.resolve(process.cwd(), 'dist');

// リバースプロキシ（Cloud Run、nginx など）の後ろで動かすときは TRUST_PROXY を設定する。
// 未設定だと全員がプロキシの IP として数えられ、回数制限が利用者全体にかかってしまう。
//   TRUST_PROXY=1            … 手前のプロキシ 1 段を信頼する（Cloud Run など）
//   TRUST_PROXY=loopback     … 同じマシンのプロキシ（nginx など）を信頼する
//   未設定 / false           … X-Forwarded-For を使わない（直接公開する場合。偽装を防ぐ）
function parseTrustProxy(value: string | undefined): boolean | number | string {
  const v = value?.trim();
  if (!v || v === 'false' || v === '0') return false;
  if (v === 'true') return true;
  if (/^\d+$/.test(v)) return Number(v);
  return v;
}

const app = express();
app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// AI を呼ぶエンドポイントは IP ごとに 1 分あたりの回数を制限する。
// 学校など同じ IP を共有する環境を考えて上限は緩めにしている。
// ニュースは routes/news.ts のキャッシュと再取得間隔で AI 呼び出しを抑える。
app.use('/api/trivia', rateLimit({ windowMs: 60_000, max: 60 }), triviaRouter);
app.use('/api/news', newsRouter);
app.use('/api/quiz/report', rateLimit({ windowMs: 60_000, max: 30 }), quizReportRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// ビルド済みフロントエンドがあれば同じプロセスで配信する（本番用）。
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
