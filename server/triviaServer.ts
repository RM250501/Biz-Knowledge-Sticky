import express from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import initSqlJs from 'sql.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

type Trivia = {
  id: string;
  category: string;
  title: string;
  explanation: string;
  doyaPoint: string;
  starter: string;
  target: string[];
  date: string;
};

const PORT = Number(process.env.TRIVIA_API_PORT || 8787);
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'trivia.db');

const app = express();
app.use(express.json());

// Serve built frontend if available (production single-process mode).
const DIST_DIR = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));

  // SPA fallback for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

let genAI: GoogleGenAI | null = null;
let SQL: any = null;
let db: any = null;

async function initDb() {
  if (db) return db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  SQL = await initSqlJs({});

  if (fs.existsSync(DB_FILE)) {
    const buffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(new Uint8Array(buffer));
  } else {
    db = new SQL.Database();
  }

  // Ensure table exists
  db.run(`
    CREATE TABLE IF NOT EXISTS trivia_assignments (
      id TEXT PRIMARY KEY,
      browserId TEXT,
      date TEXT,
      category TEXT,
      title TEXT,
      explanation TEXT,
      doyaPoint TEXT,
      starter TEXT,
      target TEXT
    );
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_trivia_date ON trivia_assignments(date);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_trivia_browser_date ON trivia_assignments(browserId, date);`);

  // persist initial DB state
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
  return db;
}

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

function normalizeTitle(input: string) {
  return (input || '').trim().replace(/\s+/g, '');
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

async function getAssignedFromDb(browserId: string, dateKey: string): Promise<Trivia | null> {
  await initDb();
  const stmt = db.prepare('SELECT * FROM trivia_assignments WHERE browserId = :b AND date = :d');
  stmt.bind({ ':b': browserId, ':d': dateKey });
  const hasRow = stmt.step();
  if (!hasRow) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject();
  stmt.free();
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    explanation: row.explanation,
    doyaPoint: row.doyaPoint,
    starter: row.starter,
    target: JSON.parse(row.target || '[]'),
    date: row.date,
  } as Trivia;
}

async function insertAssignmentToDb(trivia: Trivia, browserId: string) {
  await initDb();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = attempt === 0
      ? trivia
      : { ...trivia, id: `ai-${trivia.date}-retry-${randomUUID()}` };

    try {
      const stmt = db.prepare(`INSERT INTO trivia_assignments (id, browserId, date, category, title, explanation, doyaPoint, starter, target) VALUES (:id, :b, :d, :cat, :title, :exp, :doya, :starter, :target)`);
      stmt.bind({
        ':id': candidate.id,
        ':b': browserId,
        ':d': candidate.date,
        ':cat': candidate.category,
        ':title': candidate.title,
        ':exp': candidate.explanation,
        ':doya': candidate.doyaPoint,
        ':starter': candidate.starter,
        ':target': JSON.stringify(candidate.target),
      });
      stmt.run();
      stmt.free();

      // persist to file
      const data = db.export();
      fs.writeFileSync(DB_FILE, Buffer.from(data));
      return;
    } catch (error: any) {
      const message = String(error?.message || '');
      if (!message.includes('UNIQUE constraint failed: trivia_assignments.id') || attempt === 2) {
        throw error;
      }
    }
  }

  throw new Error('Failed to insert trivia assignment after retries');
}

async function deleteAssignmentForBrowserDate(browserId: string, dateKey: string) {
  await initDb();
  const stmt = db.prepare('DELETE FROM trivia_assignments WHERE browserId = :b AND date = :d');
  stmt.bind({ ':b': browserId, ':d': dateKey });
  stmt.run();
  stmt.free();
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

async function getUsedTitlesFromDb(dateKey: string): Promise<Set<string>> {
  await initDb();
  const stmt = db.prepare('SELECT title FROM trivia_assignments WHERE date = :d');
  stmt.bind({ ':d': dateKey });
  const used = new Set<string>();
  while (stmt.step()) {
    const row = stmt.getAsObject();
    used.add(normalizeTitle(row.title || ''));
  }
  stmt.free();
  return used;
}

async function pruneOldEntries(cutoffKey: string) {
  await initDb();
  const stmt = db.prepare('DELETE FROM trivia_assignments WHERE date < :c');
  stmt.bind({ ':c': cutoffKey });
  stmt.run();
  stmt.free();
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

function sanitizeTrivia(input: any, dateKey: string, idSeed: string): Trivia {
  return {
    id: `ai-${dateKey}-${idSeed}-${randomUUID()}`,
    category: input?.category || 'AI雑学',
    title: input?.title || `今日の雑学 ${idSeed}`,
    explanation: input?.explanation || '雑学の生成に失敗したため、簡易説明を表示しています。',
    doyaPoint: input?.doyaPoint || '会話の導入で使いやすい一言です。',
    starter: input?.starter || 'そういえば、こんな話を聞いたんだけど…',
    target: Array.isArray(input?.target) && input.target.length > 0 ? input.target : ['同僚', '友人'],
    date: dateKey,
  };
}

async function generateAITrivia(dateKey: string, browserId: string, avoidTitles: string[], variantIndex: number, attempt: number) {
  const ai = getGenAI();
  const themes = [
    '数字の意外性',
    '語源と歴史',
    '人体の不思議',
    '動物の行動',
    '食文化の背景',
    '科学の逆説',
    '仕事で使える会話ネタ',
    '身近な道具の豆知識',
    '地理・地名の由来',
    '法律・制度のトリビア',
    '心理学の小ネタ',
    'ことわざ・慣用句の由来',
  ];
  const selectedTheme = themes[Math.abs(variantIndex + attempt) % themes.length];
  const today = new Date(dateKey).toLocaleDateString('ja-JP');

  const prompt = `
あなたは『明日のランチで話せるネタ帳』の編集者です。
本日（${today}）向けに、重複しない雑学を1つ作ってください。
ブラウザID: ${browserId}
バリアント: ${variantIndex}
試行: ${attempt}
必須テーマ: ${selectedTheme}
再利用禁止タイトル: ${(avoidTitles || []).join(' / ') || 'なし'}

以下のJSONを返してください。
{
  "category": "カテゴリ名",
  "title": "タイトル",
  "explanation": "3行程度の解説",
  "doyaPoint": "盛り上がる一言",
  "starter": "会話の切り出し",
  "target": ["家族", "同僚", "友人"]
}

制約:
- 既出タイトルに類似しないこと
- 必須テーマに必ず沿うこと
- 日本語で書くこと
- 事実関係は、一般的に広く知られているものだけに限定すること
- 断定が難しい固有名詞・年代・由来は避けること
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          category: { type: 'STRING' },
          title: { type: 'STRING' },
          explanation: { type: 'STRING' },
          doyaPoint: { type: 'STRING' },
          starter: { type: 'STRING' },
          target: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['title', 'explanation', 'doyaPoint', 'starter', 'target']
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

type FactCheckResult = {
  approved: boolean;
  reason: string;
};

async function verifyAITrivia(trivia: Trivia) {
  const ai = getGenAI();
  const prompt = `
あなたは事実確認担当です。次の雑学に含まれる内容が、一般的に広く知られている事実だけで構成されているかを判定してください。

判定基準:
- 断定が難しい固有名詞、年代、語源、由来、数値が含まれていれば不承認
- 曖昧さが少しでもある場合は不承認
- 雑学として面白くても、真偽に自信がないなら不承認

雑学:
タイトル: ${trivia.title}
説明: ${trivia.explanation}
ドヤ顔ポイント: ${trivia.doyaPoint}
切り出し: ${trivia.starter}

以下のJSONで返してください。
{
  "approved": true or false,
  "reason": "1文の理由"
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          approved: { type: 'BOOLEAN' },
          reason: { type: 'STRING' }
        },
        required: ['approved', 'reason']
      }
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    approved: parsed?.approved === true,
    reason: String(parsed?.reason || 'fact check failed'),
  } satisfies FactCheckResult;
}

let writeQueue = Promise.resolve();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/trivia/assign', async (req, res) => {
  const browserId = String(req.body?.browserId || '').trim();
  const dateKey = req.body?.date && /^\d{4}-\d{2}-\d{2}$/.test(req.body.date)
    ? req.body.date
    : toDateKey(new Date());
  const refresh = req.body?.refresh === true;

  if (!browserId) {
    res.status(400).json({ error: 'browserId is required' });
    return;
  }

  // If an assignment already exists for this browser/date and caller did not request refresh,
  // return the existing assignment to avoid duplicate inserts and needless AI calls.
  try {
    const existing = await getAssignedFromDb(browserId, dateKey);
    if (existing && !refresh) {
      res.json({ trivia: existing, source: 'cached' });
      return;
    }
  } catch (err) {
    console.error('Failed checking existing assignment:', err);
    // continue to attempt assignment; errors here shouldn't block the flow
  }

  writeQueue = writeQueue.then(async () => {
    if (refresh) {
      await deleteAssignmentForBrowserDate(browserId, dateKey);
    }

    const usedTitles = await getUsedTitlesFromDb(dateKey);
    const variantIndex = hashString(`${dateKey}-${browserId}`) % 12;

    let assigned: Trivia | null = null;

    // Try multiple times to get a unique AI-generated trivia that also passes fact check.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const aiTrivia = await generateAITrivia(
          dateKey,
          browserId,
          Array.from(usedTitles),
          variantIndex,
          attempt
        );

        const normalizedTitle = normalizeTitle(aiTrivia?.title || '');
        if (!normalizedTitle || usedTitles.has(normalizedTitle)) {
          continue;
        }

        const candidate = sanitizeTrivia(aiTrivia, dateKey, `${browserId.slice(-6)}-${attempt}`);
        const factCheck = await verifyAITrivia(candidate);
        if (!factCheck.approved) {
          continue;
        }

        assigned = candidate;
        break;
      } catch {
        // retry with a different prompt variant
      }
    }

    if (!assigned) {
      res.status(503).json({ error: 'ai_unavailable', message: 'AI trivia generation failed or failed fact check; try again later.' });
      return;
    }

    await insertAssignmentToDb(assigned, browserId);

    // 直近45日だけ保持。
    const cutoff = new Date(dateKey);
    cutoff.setDate(cutoff.getDate() - 45);
    const cutoffKey = toDateKey(cutoff);
    await pruneOldEntries(cutoffKey);

    res.json({ trivia: assigned, source: 'new' });
  }).catch((error) => {
    console.error('[trivia-api] assignment failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'internal_error' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`[trivia-api] listening on http://localhost:${PORT}`);
});
