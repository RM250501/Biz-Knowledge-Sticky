import express from 'express';
import fs from 'fs';
import path from 'path';
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

type DailyRecord = {
  assignedByBrowser: Record<string, Trivia>;
};

type TriviaState = {
  byDate: Record<string, DailyRecord>;
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

const STATIC_TRIVIA_POOL: Omit<Trivia, 'id' | 'date'>[] = [
  {
    category: '言葉の由来',
    title: '「サボる」の語源はフランス語',
    explanation: '「サボタージュ」が由来で、語源はフランス語の木靴「sabot」に由来するとされます。',
    doyaPoint: '身近な言葉が外国語由来だと会話が盛り上がる。',
    starter: '「サボる」って実はフランス語由来って知ってた？',
    target: ['同僚', '友人']
  },
  {
    category: '生き物の不思議',
    title: 'パンダの「第6の指」は手首の骨',
    explanation: '竹をつかむために、手首の骨が発達して指のように機能しています。',
    doyaPoint: '指が多いのではなく骨の使い方が進化した点が面白い。',
    starter: 'パンダの指って実は普通と違うんだよ。',
    target: ['家族', '友人']
  },
  {
    category: '食べ物・料理',
    title: 'イチゴの粒は実、赤い部分は花托',
    explanation: '赤い部分は花托で、表面の粒の一つ一つが果実です。',
    doyaPoint: '見た目の常識が逆転する食品トリビア。',
    starter: 'イチゴって、実は赤い部分が果実じゃないんだって。',
    target: ['家族', '同僚']
  },
  {
    category: '科学の逆説',
    title: '熱いお湯が先に凍ることがある',
    explanation: '条件によっては温かい水が冷たい水より先に凍る「ムペンバ効果」が知られています。',
    doyaPoint: '直感に反する科学現象は記憶に残りやすい。',
    starter: '冷たい水より熱い水が先に凍ることがあるって知ってた？',
    target: ['同僚', '友人']
  },
  {
    category: '心理学の小ネタ',
    title: '選択肢が多すぎると決められなくなる',
    explanation: '心理学では選択肢過多が意思決定を遅らせることが示されています。',
    doyaPoint: '会議で案を絞る理由を説明しやすい。',
    starter: '案が多すぎると逆に決めにくいの、心理学でも有名なんだ。',
    target: ['同僚', '友人']
  },
  {
    category: '地理・地名',
    title: '東京駅は丸の内側が「西口」',
    explanation: '地図上で皇居側が西にあたるため、丸の内側は西口扱いです。',
    doyaPoint: '日常の場所に地理の理由があると印象に残る。',
    starter: '東京駅の丸の内側って、実は西口扱いなんだよ。',
    target: ['同僚', '家族']
  },
  {
    category: '制度トリビア',
    title: '日本の紙幣は約20年で刷新される傾向',
    explanation: '偽造防止技術の更新や社会状況に応じて、紙幣デザインは周期的に変更されます。',
    doyaPoint: 'ニュースと絡めて雑談しやすい時事ネタ。',
    starter: 'お札のデザインって、だいたい20年くらいで変わる傾向があるんだ。',
    target: ['同僚', '友人']
  },
  {
    category: '道具の豆知識',
    title: 'ホチキスは商品名由来で、一般名はステープラー',
    explanation: '日本で普及した商品名が一般化し、今も通称として広く使われています。',
    doyaPoint: '普段使う言葉の背景を知ると印象が変わる。',
    starter: 'ホチキスって実は商品名由来なんだよ。',
    target: ['同僚', '友人']
  },
  {
    category: '歴史・偉人',
    title: 'ナポレオンは平均身長だった',
    explanation: '当時の単位差や記録解釈の違いで「小柄」イメージが広まったとされます。',
    doyaPoint: '有名な先入観が覆る歴史トリビア。',
    starter: 'ナポレオンって実は当時としては平均身長だったらしいよ。',
    target: ['友人', '家族']
  },
  {
    category: '言語',
    title: '「了解しました」は目上には避けることが多い',
    explanation: 'ビジネスでは「承知しました」「かしこまりました」がより丁寧とされます。',
    doyaPoint: 'すぐ使える実践的な会話ネタ。',
    starter: 'ビジネスだと「了解しました」より丁寧な言い方があるんだ。',
    target: ['同僚', '友人']
  }
];

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
  const stmt = db.prepare(`INSERT INTO trivia_assignments (id, browserId, date, category, title, explanation, doyaPoint, starter, target) VALUES (:id, :b, :d, :cat, :title, :exp, :doya, :starter, :target)`);
  stmt.bind({
    ':id': trivia.id,
    ':b': browserId,
    ':d': trivia.date,
    ':cat': trivia.category,
    ':title': trivia.title,
    ':exp': trivia.explanation,
    ':doya': trivia.doyaPoint,
    ':starter': trivia.starter,
    ':target': JSON.stringify(trivia.target),
  });
  stmt.run();
  stmt.free();

  // persist to file
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
    id: `ai-${dateKey}-${idSeed}`,
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

function generateGuaranteedUniqueFallback(dateKey: string, usedTitles: Set<string>, variantIndex: number): Trivia {
  for (let i = 0; i < STATIC_TRIVIA_POOL.length; i += 1) {
    const idx = (variantIndex + i) % STATIC_TRIVIA_POOL.length;
    const candidate = STATIC_TRIVIA_POOL[idx];
    if (!usedTitles.has(normalizeTitle(candidate.title))) {
      return {
        id: `fb-${dateKey}-${idx}`,
        date: dateKey,
        ...candidate,
      };
    }
  }

  // 全候補使用済みでも連番タイトルで一意を保証。
  const seq = usedTitles.size + 1;
  return {
    id: `gen-${dateKey}-${seq}`,
    category: '日次配布ネタ',
    title: `日次限定トリビア ${seq}`,
    explanation: '本日の配布枠が埋まったため、重複回避用のユニークトリビアを生成しました。',
    doyaPoint: 'このタイトル番号は当日中に重複しません。',
    starter: '今日限定で配られたネタなんだけど、聞いてみる？',
    target: ['同僚', '友人'],
    date: dateKey,
  };
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

  if (!browserId) {
    res.status(400).json({ error: 'browserId is required' });
    return;
  }

  writeQueue = writeQueue.then(async () => {
    // In AI-only mode we do not return prior assignments; always attempt fresh AI generation.
    const usedTitles = await getUsedTitlesFromDb(dateKey);
    const variantIndex = hashString(`${dateKey}-${browserId}`) % 12;

    let assigned: Trivia | null = null;

    // Try multiple times to get a unique AI-generated trivia.
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

        assigned = sanitizeTrivia(aiTrivia, dateKey, `${browserId.slice(-6)}-${attempt}`);
        break;
      } catch (error) {
        console.error('AI trivia generation failed:', error);
      }
    }

    if (!assigned) {
      // Complete AI mode: if AI cannot produce a unique trivia, return error.
      res.status(503).json({ error: 'ai_unavailable', message: 'AI trivia generation failed; try again later.' });
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
    console.error('Assignment queue failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'internal_error' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`[trivia-api] listening on http://localhost:${PORT}`);
});
