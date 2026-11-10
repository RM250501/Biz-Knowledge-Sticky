import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { triviaRouter } from './trivia/routes';
import { newsRouter } from './routes/news';
import { quizReportRouter } from './routes/quizReport';

dotenv.config({ path: '.env.local' });
dotenv.config();

const PORT = Number(process.env.TRIVIA_API_PORT || 8787);
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const app = express();
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/trivia', triviaRouter);
app.use('/api/news', newsRouter);
app.use('/api/quiz/report', quizReportRouter);

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
