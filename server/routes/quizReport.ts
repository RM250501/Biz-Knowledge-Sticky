import { Router } from 'express';
import { GEMINI_MODEL, getGenAI, hasGeminiKey } from '../gemini';
import {
  buildLocalQuizReport,
  toReportRows,
  type QuizReport,
  type QuizSessionLogItem,
} from '../../shared/quizReport';
import { QUESTIONS } from '../../src/data/questions';

const MAX_LOG_ITEMS = 200;
const QUESTIONS_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

// 回答ログはクライアントの値を信用せず、questionId から問題・正解を引き直す。
// 回答は選択肢の文字列に一致するものだけを受け付け、正誤もサーバーで判定する。
// これにより、任意の文字列がプロンプトに入らないようにする。
function parseSessionLog(body: unknown): QuizSessionLogItem[] | null {
  const raw = (body as any)?.sessionLog;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_LOG_ITEMS) return null;

  const items: QuizSessionLogItem[] = [];
  for (const s of raw) {
    const question = QUESTIONS_BY_ID.get(String(s?.questionId ?? ''));
    if (!question) continue;
    const correctAnswer = question.options[question.correctIndex];
    const submitted = String(s?.userAnswer ?? '');
    const userAnswer = question.options.includes(submitted) ? submitted : '';
    items.push({
      questionId: question.id,
      question: question.question,
      category: question.category,
      correctAnswer,
      userAnswer,
      isCorrect: userAnswer === correctAnswer,
      timestamp: String(s?.timestamp ?? '').slice(0, 40),
    });
  }
  return items.length > 0 ? items : null;
}

// 総括とコメントだけを AI に書かせ、正誤表は検証済みの回答ログから作る。
async function generateAIReport(sessionLog: QuizSessionLogItem[]): Promise<QuizReport> {
  const ai = getGenAI();
  const summaryItems = sessionLog
    .map((s, idx) => `${idx + 1}. カテゴリ: ${s.category}｜正解: ${s.correctAnswer}｜回答: ${s.userAnswer}｜結果: ${s.isCorrect ? '正解' : '不正解'}`)
    .join('\n');

  const prompt = `
あなたはビジネス学習支援の専門家です。以下はユーザーのクイズセッションの回答ログです。
1) summary: セッション全体の短い要約（日本語、60文字程度）
2) comment: 正答数や分野に応じた短い一言コメント（日本語、20〜60文字）

入力ログ:
${summaryItems}

制約:
- 日本語で出力すること。
- JSONのみを返すこと。
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          summary: { type: 'STRING' },
          comment: { type: 'STRING' },
        },
        required: ['summary', 'comment'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  if (typeof parsed?.summary !== 'string' || typeof parsed?.comment !== 'string') {
    throw new Error('invalid AI report');
  }
  return {
    summary: parsed.summary,
    comment: parsed.comment,
    correctnessTable: toReportRows(sessionLog),
    source: 'ai',
  };
}

export const quizReportRouter = Router();

quizReportRouter.post('/', async (req, res) => {
  const sessionLog = parseSessionLog(req.body);
  if (!sessionLog) {
    res.status(400).json({ error: 'sessionLog is required' });
    return;
  }

  if (!hasGeminiKey()) {
    res.json({ report: buildLocalQuizReport(sessionLog) });
    return;
  }

  try {
    res.json({ report: await generateAIReport(sessionLog) });
  } catch (error) {
    console.error('[quiz-report] AI generation failed:', error);
    res.json({ report: buildLocalQuizReport(sessionLog) });
  }
});
