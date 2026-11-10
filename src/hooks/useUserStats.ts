import { useState, useEffect, useCallback, useRef } from 'react';
import { UserStats, INITIAL_STATS } from '../types';
import { toLocalDateKey } from '../../shared/date';
import { DATE_KEY_VERSION, nextLoginStreak } from '../lib/streak';

const STORAGE_KEY = 'biz_knowledge_stats';

function readStoredRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseStats(raw: string | null): UserStats | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserStats;
  } catch {
    return null;
  }
}

export function useUserStats() {
  // リロード後も進捗を維持できるよう、localStorage から初期化する。
  const [stats, setStats] = useState<UserStats>(() => {
    const parsed = parseStats(readStoredRaw());
    if (parsed) return parsed;
    if (readStoredRaw()) {
      // 破損データは削除して、初期化時に復旧できるようにする
      console.error('Failed to parse stats from localStorage');
      localStorage.removeItem(STORAGE_KEY);
    }
    return INITIAL_STATS;
  });

  // このタブが最後に読み書きした localStorage の内容。
  // これと違う値が入っていれば、別のタブが書き換えたと判断できる。
  const lastSyncedRef = useRef<string | null>(readStoredRaw());

  useEffect(() => {
    // stats が変わるたびに永続化する。
    const raw = JSON.stringify(stats);
    if (readStoredRaw() !== raw) localStorage.setItem(STORAGE_KEY, raw);
    lastSyncedRef.current = raw;
  }, [stats]);

  // 別のタブで学習データが更新されたら、このタブにも反映する。
  // （同じ内容の書き込みでは storage イベントは発生しないため、タブ間で往復し続けることはない）
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || event.newValue === null) return;
      const parsed = parseStats(event.newValue);
      if (!parsed) return;
      lastSyncedRef.current = event.newValue;
      setStats(parsed);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 学習データを更新する。別のタブが先に書き換えていた場合は、その内容を取り込んでから更新する。
  // こうしないと、各タブが自分の古いデータで上書きし、別タブで得た XP や記録が消えてしまう。
  // 取り込みは updater の外で 1 回だけ行い、同じタブ内の連続した更新（回答記録と XP 加算など）は順に積み上げる。
  const updateStats = useCallback((update: (prev: UserStats) => UserStats) => {
    const raw = readStoredRaw();
    if (raw !== lastSyncedRef.current) {
      const external = parseStats(raw);
      if (external) {
        lastSyncedRef.current = raw;
        setStats(external);
      }
    }
    setStats(update);
  }, []);

  // 今日の日付（ローカル）。開いたまま日付をまたいでも気づけるよう、
  // 1 分ごと・タブに戻ったときに確認し直す。
  const [todayKey, setTodayKey] = useState(() => toLocalDateKey());
  useEffect(() => {
    const check = () => setTodayKey(toLocalDateKey());
    const timer = window.setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, []);

  // 日付が変わったら連続ログイン日数を更新する。
  useEffect(() => {
    updateStats(prev => {
      if (prev.lastLoginDate === todayKey && prev.dateKeyVersion === DATE_KEY_VERSION) return prev;
      return {
        ...prev,
        loginStreak: nextLoginStreak(prev, todayKey),
        lastLoginDate: todayKey,
        dateKeyVersion: DATE_KEY_VERSION,
      };
    });
  }, [todayKey, updateStats]);

  const updateScore = (points: number, category: string, isTrivia: boolean = false, triviaLogEntry?: any) => {
    try {
      updateStats(prev => {
        // 全体 XP を更新。
        const newScore = (prev.score || 0) + points;

        // カテゴリスコアは可視化しやすいよう上限 100 にする。
        const newCategoryScores = {
          ...(prev.categoryScores || {}),
          [category]: Math.min(((prev.categoryScores?.[category]) || 0) + points, 100)
        };

        // 累積スコアに応じてランクを更新。
        let newRank = prev.rank || 'インターン';
        if (newScore > 500) newRank = 'エグゼクティブ';
        else if (newScore > 300) newRank = 'マネージャー';
        else if (newScore > 100) newRank = 'シニア';

        // 雑学アウトプット時は知識レベルを別軸で加算。
        const newKnowledgeLevel = isTrivia 
          ? (prev.knowledgeLevel || 0) + points 
          : (prev.knowledgeLevel || 0);

        // 雑学ログは新しい順に先頭へ追加。
        const newTriviaLogs = triviaLogEntry 
          ? [triviaLogEntry, ...(prev.triviaLogs || [])]
          : (prev.triviaLogs || []);

        // ダッシュボード用に日次の集計ログを更新。
        const today = toLocalDateKey();
        const newLearningLog = Array.isArray(prev.learningLog) ? [...prev.learningLog] : [];
        const todayLogIdx = newLearningLog.findIndex(log => log.date === today);
        
        if (todayLogIdx >= 0) {
          const currentLog = newLearningLog[todayLogIdx];
          newLearningLog[todayLogIdx] = { 
            ...currentLog, 
            score: newScore,
            earnedPoints: (currentLog.earnedPoints || 0) + points,
            categories: currentLog.categories.includes(category) 
              ? currentLog.categories 
              : [...currentLog.categories, category],
            triviaCount: isTrivia ? (currentLog.triviaCount || 0) + 1 : (currentLog.triviaCount || 0)
          };
        } else {
          newLearningLog.push({ 
            date: today, 
            score: newScore, 
            earnedPoints: points,
            categories: [category],
            triviaCount: isTrivia ? 1 : 0
          });
        }

        return {
          ...prev,
          score: newScore,
          rank: newRank,
          knowledgeLevel: newKnowledgeLevel,
          triviaLogs: newTriviaLogs,
          categoryScores: newCategoryScores,
          // localStorage サイズを抑えるため履歴は直近 30 日に制限。
          learningLog: newLearningLog.slice(-30) // カレンダー表示用に直近30日分を保持
        };
      });
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  // 回答した問題 ID を記録する（正誤は問わず、重複なし）。
  const markQuestionAnswered = useCallback((questionId: string) => {
    updateStats(prev => {
      const answered = prev.completedQuestions || [];
      if (answered.includes(questionId)) return prev;
      return { ...prev, completedQuestions: [...answered, questionId] };
    });
  }, [updateStats]);

  return { stats, setStats, updateScore, markQuestionAnswered };
}
