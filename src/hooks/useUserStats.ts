import { useState, useEffect } from 'react';
import { UserStats, INITIAL_STATS } from '../types';

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('biz_knowledge_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stats from localStorage', e);
      }
    }
    return INITIAL_STATS;
  });

  useEffect(() => {
    localStorage.setItem('biz_knowledge_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    // Check for login streak
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastLoginDate !== today) {
      setStats(prev => {
        let newStreak = prev.loginStreak || 0;
        const lastLogin = prev.lastLoginDate;
        
        if (lastLogin) {
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
        const newScore = (prev.score || 0) + points;
        const newCategoryScores = {
          ...(prev.categoryScores || {}),
          [category]: Math.min(((prev.categoryScores?.[category]) || 0) + points, 100)
        };

        // Update rank based on score
        let newRank = prev.rank || 'インターン';
        if (newScore > 500) newRank = 'エグゼクティブ';
        else if (newScore > 300) newRank = 'マネージャー';
        else if (newScore > 100) newRank = 'シニア';

        // Update knowledge level for trivia
        const newKnowledgeLevel = isTrivia 
          ? (prev.knowledgeLevel || 0) + points 
          : (prev.knowledgeLevel || 0);

        // Update trivia logs
        const newTriviaLogs = triviaLogEntry 
          ? [triviaLogEntry, ...(prev.triviaLogs || [])]
          : (prev.triviaLogs || []);

        // Update learning log
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
          learningLog: newLearningLog.slice(-30) // Keep last 30 days for calendar
        };
      });
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  return { stats, setStats, updateScore };
}
