import { randomUUID } from 'crypto';
import { getGeminiModel, getGenAI } from '../gemini';
import type { Trivia } from './types';
import { FALLBACK_TRIVIA } from './fallback';

const THEMES = [
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

export const THEME_COUNT = THEMES.length;

export function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// タイトルの比較用に空白を取り除く。
export function normalizeTitle(input: string) {
  return (input || '').trim().replace(/\s+/g, '');
}

// 固定の雑学から1件選ぶ。日付とブラウザで選ぶ位置を決め、同じ日に配った雑学とは重ならないようにする。
export function buildFallbackTrivia(dateKey: string, browserId: string, usedTitles: Iterable<string> = []): Trivia {
  const used = new Set(Array.from(usedTitles, normalizeTitle));
  const start = hashString(`${dateKey}-${browserId}`) % FALLBACK_TRIVIA.length;
  let index = start;
  for (let i = 0; i < FALLBACK_TRIVIA.length; i += 1) {
    const candidate = (start + i) % FALLBACK_TRIVIA.length;
    if (!used.has(normalizeTitle(FALLBACK_TRIVIA[candidate].title))) {
      index = candidate;
      break;
    }
  }
  return {
    id: `fallback-${dateKey}-${browserId.slice(-8)}-${index}-${randomUUID()}`,
    date: dateKey,
    ...FALLBACK_TRIVIA[index],
  };
}

export function sanitizeTrivia(input: any, dateKey: string, idSeed: string): Trivia {
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

export async function generateAITrivia(
  dateKey: string,
  browserId: string,
  avoidTitles: string[],
  variantIndex: number,
  attempt: number,
) {
  const ai = getGenAI();
  const selectedTheme = THEMES[Math.abs(variantIndex + attempt) % THEMES.length];
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
- 再利用禁止タイトル（これらに類似する内容は絶対に避けること）: ${avoidTitles.join(' / ') || 'なし'}

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
- 諸説が分かれる話や、真偽のはっきりしない話は避けること。
- 出力は指定されたJSONのオブジェクト1つのみとし、ValidなJSONにすること。
`;

  const response = await ai.models.generateContent({
    model: getGeminiModel(),
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
          target: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['title', 'explanation', 'doyaPoint', 'starter', 'target'],
      },
    },
  });

  return JSON.parse(response.text || '{}');
}

// 生成した雑学を別の AI 呼び出しで承認/不承認判定する（二段階チェック）。
export async function verifyAITrivia(trivia: Trivia) {
  const ai = getGenAI();
  const prompt = `
あなたは事実確認担当です。次の雑学を、会話のネタとして紹介してよいかを判定してください。

判定基準:
- 辞書・教科書・公的機関などで一般に確認できる内容なら承認する（数値や由来を含んでいてもよい）
- 細部に諸説がある程度で、話の中心が正しければ承認する
- 明らかな誤り、都市伝説、根拠のはっきりしない俗説が話の中心なら不承認にする
- 下品・差別的・政治的・宗教的な内容は不承認にする

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
    model: getGeminiModel(),
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          approved: { type: 'BOOLEAN' },
          reason: { type: 'STRING' },
        },
        required: ['approved', 'reason'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    approved: parsed?.approved === true,
    reason: String(parsed?.reason || 'fact check failed'),
  };
}
