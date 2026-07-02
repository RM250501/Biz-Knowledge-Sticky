import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { History } from 'lucide-react';
import { TriviaLog, UserStats } from '../types';
import { useDailyTrivia } from '../hooks/useDailyTrivia';
import { TriviaCard } from './trivia/TriviaCard';
import { TriviaErrorState } from './trivia/TriviaErrorState';
import { TriviaLogForm } from './trivia/TriviaLogForm';
import { TriviaStats } from './trivia/TriviaStats';

interface TriviaModuleProps {
  stats: UserStats;
  onUpdateStats: (points: number, category: string, isTrivia?: boolean, triviaLogEntry?: any) => void;
}

type TriviaReaction = 'funny' | 'failed' | 'known';

export const TriviaModule = ({ stats, onUpdateStats }: TriviaModuleProps) => {
  const { trivia, isLoading, isRefreshing, error, lastFetchedLabel, refreshTrivia } = useDailyTrivia();
  const [showLogForm, setShowLogForm] = useState(false);
  const [logNote, setLogNote] = useState('');
  const [logReaction, setLogReaction] = useState<TriviaReaction>('funny');
  const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
  const urlDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  const handleLogSubmit = () => {
    if (!trivia) return;

    const newLog: TriviaLog = {
      id: Math.random().toString(36).slice(2, 11),
      triviaId: trivia.id,
      date: new Date().toISOString(),
      reaction: logReaction,
      note: logNote,
    };

    onUpdateStats(logReaction === 'funny' ? 10 : 5, 'trivia', true, newLog);
    setShowLogForm(false);
    setLogNote('');
    setLogReaction('funny');
  };

  const handleRefresh = async () => {
    setShowLogForm(false);
    await refreshTrivia({ force: true, background: true });
  };

  if (isLoading && !trivia) {
    return (
      <div className="flex min-h-[28rem] flex-col items-center justify-center gap-4 rounded-[40px] border border-dashed border-yellow-200 bg-white/70 p-8 text-center">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-serif italic text-gray-500">今日のネタを読み込んでいます...</p>
        <p className="text-xs text-gray-400">初回のみ取得します。以降は今日のキャッシュを優先して表示します。</p>
      </div>
    );
  }

  if (error && !trivia) {
    return (
      <TriviaErrorState
        message={error}
        onRetry={() => refreshTrivia({ force: true })}
        onCheckCache={() => refreshTrivia()}
      />
    );
  }

  if (!trivia) return null;

  const hasTalked = stats.triviaLogs.some(log => log.triviaId === trivia.id);
  const funnyCount = stats.triviaLogs.filter(log => log.reaction === 'funny').length;

  return (
    <>
      {(debugMode || urlDebug) && (
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 1000 }}>
          <button
            id="debug-trivia-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded border border-yellow-200 text-xs"
            aria-label="debug-get-new-trivia"
          >
            {isRefreshing ? '取得中...' : '🔄 新ネタ (DEBUG)'}
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto font-serif">
        <TriviaCard
          trivia={trivia}
          hasTalked={hasTalked}
          lastFetchedLabel={lastFetchedLabel}
          statusMessage={error}
          onOpenLogForm={() => setShowLogForm(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <AnimatePresence>
          {showLogForm && (
            <TriviaLogForm
              reaction={logReaction}
              note={logNote}
              onReactionChange={setLogReaction}
              onNoteChange={setLogNote}
              onSubmit={handleLogSubmit}
              onCancel={() => setShowLogForm(false)}
            />
          )}
        </AnimatePresence>

        <TriviaStats
          knowledgeLevel={stats.knowledgeLevel}
          outputCount={stats.triviaLogs.length}
          funnyCount={funnyCount}
        />

        {stats.triviaLogs.length > 0 && (
          <div className="mt-12">
            <h4 className="text-xs font-sans font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History size={14} /> 最近の持ちネタ
            </h4>
            <div className="space-y-4">
              {stats.triviaLogs.slice(0, 5).map(log => (
                <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-400">{new Date(log.date).toLocaleDateString()}</div>
                    <div className="text-sm font-bold text-gray-700">{log.note || 'メモなし'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
