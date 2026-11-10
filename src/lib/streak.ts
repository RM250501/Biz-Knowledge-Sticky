import { diffInDays } from '../../shared/date';

// 保存データの日付形式。1（または未設定）= UTC の日付、2 = ローカルの日付。
export const DATE_KEY_VERSION = 2;

type StreakState = {
  loginStreak: number;
  lastLoginDate: string;
  dateKeyVersion?: number;
};

// 前回ログイン日と今日の日付から、新しい連続ログイン日数を求める。
export function nextLoginStreak(prev: StreakState, todayKey: string): number {
  const streak = prev.loginStreak || 0;
  if (!prev.lastLoginDate) return 1;

  const diff = diffInDays(prev.lastLoginDate, todayKey);
  if (Number.isNaN(diff)) return 1;

  // 旧形式（UTC の日付）は、実際のローカル日付と前後 1 日ずれていることがある。
  // 例：日本時間 8 時に開いた日は、UTC では前日の日付で保存されている。
  // 毎日使っている人の記録が途切れないよう、差が 2 日までは連続として扱う。
  const isLegacy = (prev.dateKeyVersion ?? 1) < DATE_KEY_VERSION;
  const maxContinuousGap = isLegacy ? 2 : 1;

  if (diff <= 0) return Math.max(streak, 1); // 同じ日
  if (diff <= maxContinuousGap) return streak + 1; // 連続
  return 1; // 途切れた
}
