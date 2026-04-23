import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, History, Check, Smile, Frown, Meh, User, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Trivia, TriviaLog, UserStats, STATIC_TRIVIA } from '../types';

interface TriviaModuleProps {
  stats: UserStats;
  onUpdateStats: (points: number, category: string, isTrivia?: boolean, triviaLogEntry?: any) => void;
}

export const TriviaModule = ({ stats, onUpdateStats }: TriviaModuleProps) => {
  // 当日に表示する雑学データ。
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 反応ログ入力フォームの表示状態。
  const [showLogForm, setShowLogForm] = useState(false);
  const [logNote, setLogNote] = useState("");
  const [logReaction, setLogReaction] = useState<'funny' | 'failed' | 'known'>('funny');

  useEffect(() => {
    const fetchTrivia = () => {
      setIsLoading(true);
      setError(null);
      try {
        // 日付に応じて固定データを日替わりで選ぶ。
        const today = new Date();
        const dayIdx = today.getDate() % STATIC_TRIVIA.length;
        const triviaData = STATIC_TRIVIA[dayIdx];
        
        setTrivia({
          ...triviaData,
          date: today.toISOString().split('T')[0],
        });
      } catch (err) {
        setError("ネタの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrivia();
  }, []);

  const handleLogSubmit = () => {
    if (!trivia) return;

    // 当日の雑学カードに紐づく 1 件のログを作成。
    const newLog: TriviaLog = {
      id: Math.random().toString(36).substr(2, 9),
      triviaId: trivia.id,
      date: new Date().toISOString(),
      reaction: logReaction,
      note: logNote
    };

  // 反応に応じて付与ポイントを調整（ウケた方が高い）。
    onUpdateStats(logReaction === 'funny' ? 10 : 5, 'trivia', true, newLog);
    
    setShowLogForm(false);
    setLogNote("");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-serif italic text-gray-500">今日のネタを仕込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center p-8">
        <Frown size={48} className="text-gray-300" />
        <p className="text-gray-500 font-serif">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-xs font-sans font-bold text-yellow-600 hover:underline"
        >
          再読み込みする
        </button>
      </div>
    );
  }

  if (!trivia) return null;

  // 同じ triviaId に対する重複記録を防止する判定。
  const hasTalked = stats.triviaLogs.some(log => log.triviaId === trivia.id);

  return (
    <div className="max-w-3xl mx-auto font-serif">
      <div className="bg-[#fdfdfb] p-10 rounded-[40px] shadow-sm border border-[#e8e8e0] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-4 py-1 bg-[#5A5A40] text-white rounded-full text-[10px] font-sans font-bold uppercase tracking-widest">
              {trivia.category}
            </span>
            <span className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest">
              {trivia.date}
            </span>
          </div>

          <h2 className="text-4xl font-bold text-[#2d2d2d] leading-tight mb-8">
            {trivia.title}
          </h2>

          <div className="space-y-6 mb-10">
            <div className="flex gap-4">
              <div className="w-1 h-auto bg-yellow-200 rounded-full" />
              <p className="text-xl text-gray-600 leading-relaxed italic">
                {trivia.explanation}
              </p>
            </div>

            <div className="p-6 bg-yellow-50/50 rounded-2xl border border-yellow-100">
              <h4 className="text-xs font-sans font-black text-yellow-700 uppercase mb-2 flex items-center gap-2">
                <Sparkles size={14} /> ドヤ顔ポイント
              </h4>
              <p className="text-lg font-bold text-gray-800">
                {trivia.doyaPoint}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <h4 className="text-xs font-sans font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} /> 話し方ガイド
              </h4>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm italic text-gray-600">
                「{trivia.starter}」
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-sans font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> おすすめの相手
              </h4>
              <div className="flex gap-2">
                {trivia.target.map(t => (
                  <span key={t} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-sans font-bold text-gray-500">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            {!hasTalked ? (
              <button
                onClick={() => setShowLogForm(true)}
                className="olive-button flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
              >
                <Check size={18} /> 今日、誰かに話した！
              </button>
            ) : (
              <div className="flex items-center gap-2 text-green-600 font-bold italic">
                <CheckCircle2 size={20} /> アウトプット完了！
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLogForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 p-8 bg-white rounded-3xl border border-gray-100 shadow-xl"
          >
            <h3 className="text-xl font-bold mb-6 text-center">相手の反応はどうでしたか？</h3>
            <div className="flex justify-center gap-8 mb-8">
              {[
                { id: 'funny', icon: Smile, label: 'ウケた', color: 'text-green-500' },
                { id: 'known', icon: Meh, label: '知ってた', color: 'text-yellow-500' },
                { id: 'failed', icon: Frown, label: '滑った', color: 'text-red-500' },
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setLogReaction(r.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all",
                    logReaction === r.id ? "bg-gray-50 scale-110 ring-2 ring-gray-200" : "opacity-40 hover:opacity-100"
                  )}
                >
                  <r.icon size={32} className={r.color} />
                  <span className="text-xs font-sans font-bold">{r.label}</span>
                </button>
              ))}
            </div>
            <textarea
              value={logNote}
              onChange={(e) => setLogNote(e.target.value)}
              placeholder="メモ（相手の反応など）"
              className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-yellow-200 mb-6 font-sans text-sm"
              rows={3}
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowLogForm(false)} className="px-6 py-2 text-gray-400 font-sans font-bold text-sm">キャンセル</button>
              <button onClick={handleLogSubmit} className="olive-button font-sans font-bold text-sm">記録を保存</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
          <h4 className="text-[10px] font-sans font-black text-gray-400 uppercase tracking-widest mb-2">博識レベル</h4>
          <div className="text-3xl font-bold text-[#5A5A40]">{stats.knowledgeLevel}</div>
          <p className="text-[10px] text-gray-400 mt-1 italic">Knowledge Level</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
          <h4 className="text-[10px] font-sans font-black text-gray-400 uppercase tracking-widest mb-2">アウトプット数</h4>
          <div className="text-3xl font-bold text-[#5A5A40]">{stats.triviaLogs.length}</div>
          <p className="text-[10px] text-gray-400 mt-1 italic">Total Outputs</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
          <h4 className="text-[10px] font-sans font-black text-gray-400 uppercase tracking-widest mb-2">ウケた回数</h4>
          <div className="text-3xl font-bold text-[#5A5A40]">
            {stats.triviaLogs.filter(l => l.reaction === 'funny').length}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 italic">Success Count</p>
        </div>
      </div>

      {stats.triviaLogs.length > 0 && (
        <div className="mt-12">
          <h4 className="text-xs font-sans font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <History size={14} /> 最近の持ちネタ
          </h4>
          <div className="space-y-4">
            {stats.triviaLogs.slice(0, 5).map(log => (
              <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    log.reaction === 'funny' ? "bg-green-50 text-green-500" : 
                    log.reaction === 'known' ? "bg-yellow-50 text-yellow-500" : "bg-red-50 text-red-500"
                  )}>
                    {log.reaction === 'funny' ? <Smile size={20} /> : 
                     log.reaction === 'known' ? <Meh size={20} /> : <Frown size={20} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400">{new Date(log.date).toLocaleDateString()}</div>
                    <div className="text-sm font-bold text-gray-700">{log.note || "メモなし"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
