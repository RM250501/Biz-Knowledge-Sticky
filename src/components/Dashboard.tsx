import React, { useEffect, useState } from 'react';
import { User, TrendingUp, Award, Calendar as CalendarIcon, Sparkles, Shuffle, Timer, Eye, EyeOff } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from 'recharts';
import { UserStats, CATEGORY_LABELS } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Dashboard = ({ stats, onStartTimedQuiz, onStartRandomQuiz }: { stats: UserStats; onStartTimedQuiz: () => void; onStartRandomQuiz: () => void }) => {
  // プロファイル表示とカレンダー表示の切替状態。
  const [showCalendar, setShowCalendar] = useState(false);
  // 文字を抑えた簡易表示を既定にする。
  const [showDetails, setShowDetails] = useState(false);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => setChartsReady(true));
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const todayKey = new Date().toISOString().split('T')[0];
  const todayLog = stats.learningLog.find(log => log.date === todayKey);

  const strongestCategoryEntry = Object.entries(stats.categoryScores)
    .filter(([key]) => CATEGORY_LABELS[key])
    .sort(([, a], [, b]) => b - a)[0];

  const strongestCategoryLabel = strongestCategoryEntry
    ? CATEGORY_LABELS[strongestCategoryEntry[0]] || strongestCategoryEntry[0]
    : 'まだデータなし';

  const nextAction = todayLog
    ? '今日の学習は記録済み。雑学を1つアウトプットして、知識レベルも伸ばすのがおすすめです。'
    : stats.completedQuestions.length === 0
      ? 'まずは一般常識ドリルを1問解いて、最初のXPを積みましょう。'
      : '学習履歴があるので、雑学ネタ帳でアウトプットを加えると伸びが見えやすくなります。';

  // カテゴリ別スコアをレーダーチャート用データへ変換。
  const radarData = Object.entries(stats.categoryScores)
    .filter(([key]) => CATEGORY_LABELS[key])
    .map(([key, value]) => ({
      subject: CATEGORY_LABELS[key]?.toUpperCase() || key.toUpperCase(),
      A: value,
      fullMark: 100,
    }));

  const today = new Date();
  const currentMonthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  // 当月の日付配列を作り、該当日の学習ログを紐付ける。
  const calendarDays = Array.from({ length: currentMonthDays }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), i + 1).toISOString().split('T')[0];
    const log = stats.learningLog.find(l => l.date === date);
    return { day: i + 1, date, log };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full pb-12 min-w-0">
      <div className="space-y-6 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <Award size={14} /> 成績レポート
          </div>
          <button
            onClick={() => setShowDetails(v => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {showDetails ? <EyeOff size={14} /> : <Eye size={14} />}
            {showDetails ? '簡易' : '詳細'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <TrendingUp size={18} className="text-gray-500" />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">XP</span>
            </div>
            <div className="text-2xl font-black text-gray-900 flex items-baseline gap-1">
              <span>{todayLog ? `${todayLog.earnedPoints}` : '0'}</span>
              <span className="text-sm font-black text-gray-500">XP</span>
            </div>
            {showDetails && <p className="text-xs text-gray-500 mt-1">今日の学習成果</p>}
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Award size={18} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">BEST</span>
            </div>
            <div className="text-2xl font-black text-blue-600">{showDetails ? strongestCategoryLabel : strongestCategoryLabel.slice(0, 2)}</div>
            {showDetails && <p className="text-xs text-gray-500 mt-1">今いちばん伸びている分野</p>}
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                <Timer size={18} className="text-orange-500" />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">STREAK</span>
            </div>
            <div className="text-2xl font-black text-orange-600 flex items-baseline gap-1">
              <span>{stats.loginStreak}</span>
              <span className="text-sm font-black text-orange-500">Day</span>
            </div>
            {showDetails ? (
              <p className="text-xs text-gray-500 mt-1">{stats.loginStreak > 0 ? `${stats.loginStreak}日連続学習中` : '学習を始めましょう'}</p>
            ) : null}
          </div>
        </div>

        <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Recommended Action</div>
          <p className="text-sm text-blue-900 leading-relaxed">{nextAction}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={onStartTimedQuiz}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              <Timer size={14} /> 5分ドリル
            </button>
            <button
              onClick={onStartRandomQuiz}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-800 text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Shuffle size={14} /> ランダム出題
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="text-blue-500" /> {showDetails ? 'Profile Status' : 'Profile'}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowCalendar(!showCalendar)}
                className={cn(
                  "p-2 rounded-full transition-all",
                  showCalendar ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                )}
              >
                <CalendarIcon size={16} />
              </button>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                {stats.rank}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!showCalendar ? (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {showDetails ? (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Total Score</span>
                        <span className="font-bold">{stats.score} XP</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min(stats.score / 10, 100)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">雑学（アウトプット）</span>
                        <span className="font-bold">{stats.knowledgeLevel} LV</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${Math.min(stats.knowledgeLevel, 100)}%` }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">XP</div>
                      <div className="text-lg font-black text-gray-900 flex items-center justify-center gap-1">
                        <span>{stats.score}</span>
                        <span className="text-xs font-black text-gray-500">XP</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">LV</div>
                      <div className="text-lg font-black text-purple-600 flex items-center justify-center gap-1">
                        <span>{stats.knowledgeLevel}</span>
                        <span className="text-xs font-black text-purple-500">LV</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pt-2"
              >
                <div className="text-xs font-black text-gray-500 uppercase mb-4 text-center tracking-widest leading-none">
                  {today.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={`${d}-${i}`} className="text-[10px] font-black text-gray-400 uppercase pb-1">{d}</div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {calendarDays.map(({ day, date, log }) => {
                    // 今日の日付を強調して現在位置を把握しやすくする。
                    const isToday = today.toISOString().split('T')[0] === date;
                    const earnedXp = log?.earnedPoints || 0;
                    
                    // 日次獲得 XP に応じてカレンダー色を変える。
                    let bgClass = "bg-gray-100/50 text-gray-500 border border-gray-200/50";
                    if (log) {
                      if (earnedXp >= 100) bgClass = "bg-orange-500 text-white shadow-[0_4px_12px_rgba(249,115,22,0.4)] scale-110 z-10 animate-pulse border-none";
                      else if (earnedXp >= 50) bgClass = "bg-blue-600 text-white shadow-md scale-105 border-none";
                      else bgClass = "bg-blue-400 text-white opacity-90 scale-100 border-none shadow-sm";
                    }

                    return (
                      <div key={day} className="relative group">
                        <div className={cn(
                          "aspect-square flex items-center justify-center text-xs font-black rounded-xl transition-all relative overflow-hidden",
                          bgClass,
                          isToday && !log && "border-2 border-yellow-400"
                        )}>
                          {day}
                          {isToday && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-bl-lg shadow-sm" />
                          )}
                        </div>
                        {log && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 z-[100] pointer-events-none opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-y-[-4px]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{log.date}</span>
                              <span className="text-[10px] font-bold text-gray-400">DAILY LOG</span>
                            </div>
                            <div className="text-sm font-black text-gray-800 mb-1">{earnedXp} XP EARNED</div>
                            <div className="text-[10px] font-bold text-gray-500 mb-3 border-b border-gray-100 pb-2">Total Progress: {log.score} XP</div>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {(log.categories || []).map(c => (
                                <span key={c} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-bold border border-gray-200">
                                  {CATEGORY_LABELS[c] || c}
                                </span>
                              ))}
                            </div>
                            {log.triviaCount > 0 && (
                              <div className="flex items-center gap-1.5 text-[10px] text-purple-600 font-bold bg-purple-50 p-2 rounded-lg border border-purple-100">
                                <Sparkles size={12} /> {log.triviaCount} trivia outputs shared
                              </div>
                            )}
                            <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-100 shadow-xl" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64 min-w-0 min-h-[16rem]">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-500" /> {showDetails ? 'Learning Progress' : '推移'}
          </h3>
          <div className="min-w-0 min-h-[12rem] h-[calc(100%-2.5rem)]">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <LineChart data={stats.learningLog}>
                  {/* X 軸は日付、Y 軸は累積スコア。 */}
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full rounded-xl bg-gray-50 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-w-0">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="text-purple-500" /> {showDetails ? 'Skill Radar' : '傾向'}
        </h3>
        <div className="flex-1 min-h-[320px] min-w-0">
          {chartsReady ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                {/* レーダー面でカテゴリ間のバランスを可視化する。 */}
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" fontSize={10} />
                <Radar 
                  name="Skills" 
                  dataKey="A" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6} 
                  isAnimationActive={false}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full rounded-xl bg-gray-50 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
