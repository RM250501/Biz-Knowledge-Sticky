import type { Question } from '../../types';
import { ENGLISH_QUESTIONS } from './english';
import { KANJI_QUESTIONS } from './kanji';
import { MANNERS_QUESTIONS } from './manners';
import { GOVERNANCE_QUESTIONS } from './governance';
import { WEATHER_QUESTIONS } from './weather';
import { ECONOMY_QUESTIONS } from './economy';

// QuizModule が参照する問題データ。カテゴリごとのファイルに問題を追加する。
export const QUESTIONS: Question[] = [
  ...ENGLISH_QUESTIONS,
  ...KANJI_QUESTIONS,
  ...MANNERS_QUESTIONS,
  ...GOVERNANCE_QUESTIONS,
  ...WEATHER_QUESTIONS,
  ...ECONOMY_QUESTIONS,
];

export const QUESTION_COUNT_BY_CATEGORY: Record<string, number> = QUESTIONS.reduce<Record<string, number>>(
  (acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  },
  {},
);
