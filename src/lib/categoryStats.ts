import { CATEGORY_LABELS } from '../../shared/categories';
import type { CategoryStat, UserStats } from '../types';

// クイズのカテゴリ（雑学は正誤がないので除く）。
export const QUIZ_CATEGORIES = Object.keys(CATEGORY_LABELS).filter((key) => key !== 'trivia');

// 「得意分野」と判定するのに必要な最低回答数。1〜2 問だけの 100% で決まらないようにする。
export const MIN_ANSWERS_FOR_RANKING = 3;

// 正答率（0〜100 の整数）。まだ回答がなければ null。
export function accuracyPercent(stat: CategoryStat | undefined): number | null {
  if (!stat || stat.answered <= 0) return null;
  return Math.round((stat.correct / stat.answered) * 100);
}

// 1 問回答したときのカテゴリ別集計を更新する。
export function addAnswer(
  categoryStats: Record<string, CategoryStat> | undefined,
  category: string,
  isCorrect: boolean,
): Record<string, CategoryStat> {
  const current = categoryStats?.[category] ?? { answered: 0, correct: 0 };
  return {
    ...(categoryStats ?? {}),
    [category]: {
      answered: current.answered + 1,
      correct: current.correct + (isCorrect ? 1 : 0),
    },
  };
}

export type RadarPoint = {
  subject: string;
  accuracy: number;
  answered: number;
  correct: number;
};

// レーダーチャート用のデータ。回答のないカテゴリは 0 として表示する。
export function buildRadarData(stats: Pick<UserStats, 'categoryStats'>): RadarPoint[] {
  return QUIZ_CATEGORIES.map((key) => {
    const stat = stats.categoryStats?.[key];
    return {
      subject: CATEGORY_LABELS[key],
      accuracy: accuracyPercent(stat) ?? 0,
      answered: stat?.answered ?? 0,
      correct: stat?.correct ?? 0,
    };
  });
}

// 正答率がいちばん高いカテゴリ。同率なら回答数が多いほうを選ぶ。該当がなければ null。
// 正答率 0% の分野は「得意」とは言えないので対象外にする。
export function strongestCategory(stats: Pick<UserStats, 'categoryStats'>): string | null {
  const ranked = QUIZ_CATEGORIES
    .map((key) => ({ key, stat: stats.categoryStats?.[key] }))
    .filter(({ stat }) => (stat?.answered ?? 0) >= MIN_ANSWERS_FOR_RANKING && (stat?.correct ?? 0) > 0)
    .sort((a, b) => {
      const diff = (accuracyPercent(b.stat) ?? 0) - (accuracyPercent(a.stat) ?? 0);
      return diff !== 0 ? diff : (b.stat?.answered ?? 0) - (a.stat?.answered ?? 0);
    });
  return ranked[0]?.key ?? null;
}
