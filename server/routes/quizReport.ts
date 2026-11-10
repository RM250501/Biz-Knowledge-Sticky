import { Router } from 'express';
import { GEMINI_MODEL, getGenAI, hasGeminiKey } from '../gemini';
import {
  buildLocalQuizReport,
  toReportRows,
  type QuizReport,
  type QuizSessionLogItem,
} from '../../shared/quizReport';

const MAX_LOG_ITEMS = 200;

function parseSessionLog(body: unknown): QuizSessionLogItem[] | null {
  const raw = (body as any)?.sessionLog;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_LOG_ITEMS) return null;
  return raw.map((s: any) => ({
    questionId: String(s?.questionId ?? ''),
    question: String(s?.question ?? ''),
    category: String(s?.category ?? ''),
    correctAnswer: String(s?.correctAnswer ?? ''),
    userAnswer: String(s?.userAnswer ?? ''),
    isCorrect: s?.isCorrect === true,
    timestamp: String(s?.timestamp ?? ''),
  }));
}

// 総括とコメントだけを AI に書かせ、正誤表は回答ログからそのまま作る。
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
