import { randomUUID } from 'crypto';
import { GEMINI_MODEL, getGenAI } from '../gemini';
import type { Trivia } from './types';

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

const FALLBACK_TRIVIA: Array<Omit<Trivia, 'id' | 'date'>> = [
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

export function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function buildFallbackTrivia(dateKey: string, browserId: string): Trivia {
  const index = hashString(`${dateKey}-${browserId}`) % FALLBACK_TRIVIA.length;
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
- 断定が難しい固有名詞・年代・由来は避けること。
- 出力は指定されたJSONのオブジェクト1つのみとし、ValidなJSONにすること。
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
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
    model: GEMINI_MODEL,
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
