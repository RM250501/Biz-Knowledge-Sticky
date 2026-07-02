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

const SERVER_FALLBACK_TRIVIA: Array<Omit<Trivia, 'id' | 'date'>> = [
  {
    category: '雑学',
    title: '富士山は日本最高峰',
    explanation: '富士山は日本でいちばん高い山として知られています。標高は 3776m です。',
    doyaPoint: '日本一の高さは、会話の切り出しに使いやすい定番ネタです。',
    starter: 'そういえば、日本でいちばん高い山って知ってる？',
    target: ['同僚', '友人'],
  },
  {
    category: '雑学',
    title: '1日は24時間',
    explanation: '地球の自転により、私たちは 1 日を 24 時間として区切って生活しています。',
    doyaPoint: '当たり前に見えて、時間の基準は地球の動きに支えられています。',
    starter: '時間の区切りって、どうして 24 時間なんだろう？',
    target: ['同僚', '友人'],
  },
  {
    category: '雑学',
    title: '紙は折ると強くなる',
    explanation: '紙は薄くても、折り方や重ね方を工夫すると見た目以上の強さを出せます。',
    doyaPoint: '身近な素材でも、形を変えるだけで性質が変わります。',
    starter: '紙って、ただの紙でも結構すごいんだよ。',
    target: ['同僚', '友人'],
  },
  {
    category: '雑学',
    title: '月は地球の衛星',
    explanation: '月は地球の周りを回る唯一の自然衛星です。夜空で最も身近な天体のひとつです。',
    doyaPoint: '天体の基本ネタは、幅広い相手に話しやすいのが強みです。',
    starter: '月って、実は地球の衛星なんだよね。',
    target: ['同僚', '友人'],
  },
];

function buildFallbackTrivia(dateKey: string, browserId: string): Trivia {
  const index = hashString(`${dateKey}-${browserId}`) % SERVER_FALLBACK_TRIVIA.length;
  const selected = SERVER_FALLBACK_TRIVIA[index];
  return {
    id: `fallback-${dateKey}-${browserId.slice(-8)}-${index}-${randomUUID()}`,
    date: dateKey,
    ...selected,
  };
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
# 役割
あなたは『明日のランチで話せるネタ帳』の優秀な編集者です。
ユーザーから与えられたテーマに基づき、思わず明日誰かに話したくなる、新鮮で面白い雑学を1つだけ作成してください。

# コンテキスト情報
- 本日の日付: ${today}
- ブラウザID: ${browserId}
- バリアント: ${variantIndex}
- 試行回数: ${attempt}
- 必須テーマ: ${selectedTheme}
- 再利用禁止タイトル（これらに類似する内容は絶対に避けること）: ${(avoidTitles || []).join(' / ') || 'なし'}

# 雑学作成のクオリティ基準
1. 【意外性】「えっ、そうなの！？」という驚きや、身近なものの裏話であること。
2. 【健全性】下ネタ、政治、宗教、不快感を与えるドロドロした雑学はNG。
3. 【事実性】広く一般に知られている確かな事実であること（諸説ありすぎるグレーな歴史ネタや、真偽不明の都市伝説は避ける）。

# 出力フォーマット
必ず以下のJSON形式のみを出力してください。余計な挨拶や解説（「json」のマークダウンタグなど含む）は一切不要です。

{
  "category": "【必須テーマ】に合致する、キャッチーなカテゴリ名（10文字以内）",
  "title": "思わず内容を聞きたくなる、引きのあるタイトル（20文字以内）",
  "explanation": "スマホの画面でも読みやすい、100文字〜130文字程度（3行相当）の簡潔かつ分かりやすい解説。専門用語は使わないこと。",
  "doyaPoint": "ランチの席で「ドヤ顔」で言える、一番言いたい結論の一言（30文字以内）",
  "starter": "会話を自然に切り出すためのセリフ（例：「ねえ、〇〇って知ってる？」など。30文字以内）",
  "target": ["家族", "同僚", "友人"] 
}

# 制約事項
- 必ず日本語で出力すること。
- 断定が難しい固有名詞・年代・由来は避けること。
- 出力は指定されたJSONのオブジェクト1つのみとし、ValidなJSONにすること。
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
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
    model: 'gemini-2.0-flash',
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

type TriviaAssignmentResponse = {
  status: number;
  body: Record<string, unknown>;
};

async function resolveTriviaAssignment(browserId: string, dateKey: string, refresh: boolean): Promise<TriviaAssignmentResponse> {
  if (!browserId) {
    return { status: 400, body: { error: 'browserId is required' } };
  }

  // If an assignment already exists for this browser/date and caller did not request refresh,
  // return the existing assignment to avoid duplicate inserts and needless AI calls.
  try {
    const existing = await getAssignedFromDb(browserId, dateKey);
    if (existing && !refresh) {
      return { status: 200, body: { trivia: existing, source: 'cached' } };
    }
  } catch (err) {
    console.error('Failed checking existing assignment:', err);
    // continue to attempt assignment; errors here shouldn't block the flow
  }

  return await new Promise<TriviaAssignmentResponse>((resolve) => {
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
        assigned = buildFallbackTrivia(dateKey, browserId);
      }

      await insertAssignmentToDb(assigned, browserId);

      // 直近45日だけ保持。
      const cutoff = new Date(dateKey);
      cutoff.setDate(cutoff.getDate() - 45);
      const cutoffKey = toDateKey(cutoff);
      await pruneOldEntries(cutoffKey);

      resolve({
        status: 200,
        body: {
          trivia: assigned,
          source: assigned.id.startsWith('fallback-') ? 'fallback' : 'new',
        },
      });
    }).catch((error) => {
      console.error('[trivia-api] assignment failed:', error);
      resolve({ status: 500, body: { error: 'internal_error' } });
    });
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/trivia/today', async (req, res) => {
  const browserId = String(req.query.browserId || '').trim();
  const dateKey = req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.date))
    ? String(req.query.date)
    : toDateKey(new Date());
  const refresh = req.query.refresh === '1';

  const result = await resolveTriviaAssignment(browserId, dateKey, refresh);
  res.status(result.status).json(result.body);
});

app.post('/api/trivia/assign', async (req, res) => {
  const browserId = String(req.body?.browserId || '').trim();
  const dateKey = req.body?.date && /^\d{4}-\d{2}-\d{2}$/.test(req.body.date)
    ? req.body.date
    : toDateKey(new Date());
  const refresh = req.body?.refresh === true;

  const result = await resolveTriviaAssignment(browserId, dateKey, refresh);
  res.status(result.status).json(result.body);
});

app.listen(PORT, () => {
  console.log(`[trivia-api] listening on http://localhost:${PORT}`);
});
