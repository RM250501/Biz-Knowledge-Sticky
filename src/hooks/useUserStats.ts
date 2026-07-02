import { useState, useEffect } from 'react';
import { UserStats, INITIAL_STATS } from '../types';

export function useUserStats() {
  // リロード後も進捗を維持できるよう、localStorage から初期化する。
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('biz_knowledge_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stats from localStorage', e);
        // 破損データは削除して、初期化時に復旧できるようにする
        localStorage.removeItem('biz_knowledge_stats');
      }
    }
    return INITIAL_STATS;
  });

  useEffect(() => {
    // stats が変わるたびに永続化する。
    localStorage.setItem('biz_knowledge_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    // 連続ログイン日数を判定する。
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastLoginDate !== today) {
      setStats(prev => {
        let newStreak = prev.loginStreak || 0;
        const lastLogin = prev.lastLoginDate;
        
        if (lastLogin) {
          // 最終ログイン日と今日の日付差から連続日数を判定する。
          const lastDate = new Date(lastLogin);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
        
        return {
          ...prev,
          lastLoginDate: today,
          loginStreak: newStreak
        };
      });
    }
  }, []);

  const updateScore = (points: number, category: string, isTrivia: boolean = false, triviaLogEntry?: any) => {
    try {
      setStats(prev => {
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
        const today = new Date().toISOString().split('T')[0];
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

  return { stats, setStats, updateScore };
}
