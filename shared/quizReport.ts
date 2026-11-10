import { CATEGORY_LABELS } from './categories';

// クイズ結果レポートの型と、AI を使わないローカル集計。
// サーバー（API キー未設定・AI 失敗時）とクライアント（API 通信失敗時）の両方で使う。

export interface QuizSessionLogItem {
  questionId: string;
  question: string;
  category: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface QuizReportRow {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  category: string;
}

export interface QuizReport {
  summary: string;
  correctnessTable: QuizReportRow[];
  comment: string;
  source: 'ai' | 'local';
}

export function toReportRows(sessionLog: QuizSessionLogItem[]): QuizReportRow[] {
  return sessionLog.map((s) => ({
    id: s.questionId,
    question: s.question,
    userAnswer: s.userAnswer,
    correctAnswer: s.correctAnswer,
    isCorrect: s.isCorrect,
    category: s.category,
  }));
}

export function buildLocalQuizReport(sessionLog: QuizSessionLogItem[]): QuizReport {
  const total = sessionLog.length;
  const correct = sessionLog.filter((s) => s.isCorrect).length;

  const wrongByCategory: Record<string, number> = {};
  for (const s of sessionLog) {
    if (!s.isCorrect) wrongByCategory[s.category] = (wrongByCategory[s.category] || 0) + 1;
  }
  const topWrong = Object.entries(wrongByCategory).sort((a, b) => b[1] - a[1])[0];

  let comment: string;
  if (total === 0) {
    comment = '回答がありませんでした。';
  } else if (correct === total) {
    comment = '全問正解です。この調子で続けましょう。';
  } else if (correct === 0) {
    comment = '解説を読み直して、基礎から復習しましょう。';
  } else if (topWrong) {
    const label = CATEGORY_LABELS[topWrong[0]] || topWrong[0];
    comment = `${label}で${topWrong[1]}問間違えました。解説を見直しましょう。`;
  } else {
    comment = `${correct}/${total}問正解です。`;
  }

  return {
    summary: `全${total}問中 ${correct}問正解。`,
    correctnessTable: toReportRows(sessionLog),
    comment,
    source: 'local',
  };
}
