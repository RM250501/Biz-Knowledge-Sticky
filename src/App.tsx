import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Sparkles, 
  CloudSun,
  Newspaper,
  Award,
  AlertCircle,
  User,
  Flame
} from 'lucide-react';

import { MenuSticky } from './components/MenuSticky';
import { ContentWindow } from './components/ContentWindow';
import { Dashboard } from './components/Dashboard';
import { QuizModule } from './components/QuizModule';
import { TriviaModule } from './components/TriviaModule';
import { LocalModule } from './components/LocalModule';
import { NewsModule } from './components/NewsModule';

import { useUserStats } from './hooks/useUserStats';
import { useCurrentTime } from './hooks/useCurrentTime';

export default function App() {
  // 学習進捗 state とスコア更新 API を取得。
  const { stats, setStats, updateScore } = useUserStats();
  // 右側コンテンツで表示するモジュールのタブ状態。
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  // ヘッダー表示用の現在時刻。
  const currentTime = useCurrentTime();

  // 左メニュー定義（id によって表示分岐する）。
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, title: '成績レポート', color: 'blue' as const },
    { id: 'learning', icon: BookOpen, title: '一般常識ドリル', color: 'yellow' as const },
    { id: 'trivia', icon: Sparkles, title: '雑学ネタ帳', color: 'purple' as const },
    { id: 'local', icon: CloudSun, title: 'お天気情報', color: 'pink' as const },
    { id: 'news', icon: Newspaper, title: '最新トピックス', color: 'green' as const },
  ];

  const activeItem = menuItems.find(item => item.id === activeTab) || menuItems[0];
  // ログイン連続日数更新時に一度だけ表示する演出。
  const [showStreakAnim, setShowStreakAnim] = useState(false);

  useEffect(() => {
    if (stats.loginStreak > 0) {
      // 同じ日数の演出を繰り返し表示しないための判定。
      const lastSeenStreak = localStorage.getItem('last_seen_streak');
      if (lastSeenStreak !== stats.loginStreak.toString()) {
        setShowStreakAnim(true);
        localStorage.setItem('last_seen_streak', stats.loginStreak.toString());
        // 一定時間後に演出を自動で閉じる。
        setTimeout(() => setShowStreakAnim(false), 3000);
      }
    }
  }, [stats.loginStreak]);

  return (
    <div className="h-screen w-screen bg-[#f8f8f8] overflow-hidden flex flex-col font-sans text-gray-900 relative">
      <AnimatePresence>
        {showStreakAnim && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-orange-400 flex flex-col items-center gap-4">
              <motion.div
                animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Flame size={80} className="text-orange-500 fill-orange-500" />
              </motion.div>
              <h2 className="text-4xl font-black text-gray-800 tracking-tighter">
                {stats.loginStreak} DAYS STREAK!
              </h2>
              <p className="text-lg font-bold text-gray-400 uppercase tracking-widest">Keep it up!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 背景のドットパターン */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* ヘッダー */}
      <div className="px-8 py-6 flex justify-between items-center relative z-10 bg-white/50 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 p-2 -rotate-2 shadow-sm">
            <Award size={28} className="text-gray-900" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase text-gray-800 leading-none">
              Biz-Knowledge <span className="text-yellow-600">Sticky</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Professional Learning Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 shadow-sm transition-all hover:scale-110">
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <span className="text-sm font-black text-orange-600">{stats.loginStreak}</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-gray-700">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">{currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-400 uppercase">Current Rank</div>
              <div className="text-xs font-black text-blue-600 uppercase tracking-wider">{stats.rank}</div>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <User size={20} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ領域 */}
      <div className="flex-1 flex overflow-hidden p-8 gap-8">
        {/* 左メニュー（付箋） */}
        <div className="w-64 flex flex-col">
          <div className="mb-6 px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Main Menu</h3>
            {menuItems.map(item => (
              <MenuSticky
                key={item.id}
                title={item.title}
                icon={item.icon}
                color={item.color}
                isActive={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </div>
          
          <div className="mt-auto p-4 bg-gray-100/50 rounded-xl border border-dashed border-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Quick Tip</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              付箋メニューにカーソルを合わせると詳細が表示されます。クリックで内容を切り替えます。
            </p>
          </div>
        </div>

        {/* 右コンテンツペイン */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <ContentWindow 
              key={activeTab}
              title={activeItem.title}
              icon={activeItem.icon}
              color={activeItem.color}
            >
              {/* 選択中タブに応じてモジュールを切り替える。 */}
              {activeTab === 'dashboard' && <Dashboard stats={stats} />}
              {activeTab === 'learning' && <QuizModule onComplete={updateScore} />}
              {activeTab === 'trivia' && <TriviaModule stats={stats} onUpdateStats={updateScore} />}
              {activeTab === 'local' && <LocalModule />}
              {activeTab === 'news' && <NewsModule />}
            </ContentWindow>
          </AnimatePresence>
        </div>
      </div>

      {/* フッター */}
      <div className="px-8 py-4 flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] border-t border-gray-100 bg-white/30">
        <span>© 2026 Biz-Knowledge Sticky System</span>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </div>
    </div>
  );
}
