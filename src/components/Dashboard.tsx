import React, { useState } from 'react';
import { User, TrendingUp, Award, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
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

export const Dashboard = ({ stats }: { stats: UserStats }) => {
  // プロファイル表示とカレンダー表示の切替状態。
  const [showCalendar, setShowCalendar] = useState(false);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full pb-12">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="text-blue-500" /> Profile Status
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

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-500" /> Learning Progress
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.learningLog}>
              {/* X 軸は日付、Y 軸は累積スコア。 */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="text-purple-500" /> Skill Radar
        </h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
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
        </div>
      </div>
    </div>
  );
};
