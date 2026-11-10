import React from 'react';
import { BookOpen, ChevronRight, ListChecks, Settings2, Shuffle, Timer } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CATEGORY_LABELS } from '../../types';
import { QUESTION_COUNT_BY_CATEGORY } from '../../data/questions';
import { DURATION_CHOICES, QUESTION_COUNT_CHOICES, type QuizSettings } from './types';

interface QuizSetupProps {
  settings: QuizSettings;
  message: string;
  onChange: (patch: Partial<QuizSettings>) => void;
  onStart: () => void;
}

const QUIZ_CATEGORIES = Object.entries(CATEGORY_LABELS).filter(([key]) => key !== 'trivia');

const ToggleButton = ({
  active,
  activeClass,
  onClick,
  children,
}: {
  active: boolean;
  activeClass: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2',
      active ? activeClass : 'bg-white text-gray-600 border border-gray-200',
    )}
  >
    {children}
  </button>
);

export const QuizSetup = ({ settings, message, onChange, onStart }: QuizSetupProps) => (
  <div className="space-y-6 max-w-4xl mx-auto">
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
        <Settings2 size={14} /> 学習設定
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
          <div className="text-sm font-black text-gray-800">出題方法</div>
          <div className="flex gap-2">
            <ToggleButton active={settings.sourceMode === 'category'} activeClass="bg-blue-600 text-white" onClick={() => onChange({ sourceMode: 'category' })}>
              カテゴリ別
            </ToggleButton>
            <ToggleButton active={settings.sourceMode === 'random'} activeClass="bg-blue-600 text-white" onClick={() => onChange({ sourceMode: 'random' })}>
              <Shuffle size={14} /> カテゴリランダム
            </ToggleButton>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
          <div className="text-sm font-black text-gray-800">終了条件</div>
          <div className="flex gap-2">
            <ToggleButton active={settings.endMode === 'time'} activeClass="bg-orange-500 text-white" onClick={() => onChange({ endMode: 'time' })}>
              <Timer size={14} /> 時間
            </ToggleButton>
            <ToggleButton active={settings.endMode === 'count'} activeClass="bg-orange-500 text-white" onClick={() => onChange({ endMode: 'count' })}>
              <ListChecks size={14} /> 出題数
            </ToggleButton>
          </div>
        </div>
      </div>

      {settings.endMode === 'time' ? (
        <div className="space-y-3">
          <div className="text-sm font-black text-gray-800">所要時間</div>
          <div className="flex flex-wrap gap-2">
            {DURATION_CHOICES.map((minutes) => (
              <ToggleButton key={minutes} active={settings.durationMinutes === minutes} activeClass="bg-gray-900 text-white" onClick={() => onChange({ durationMinutes: minutes })}>
                {minutes}分
              </ToggleButton>
            ))}
          </div>
          <p className="text-xs text-gray-500">デフォルトは 5 分です。</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm font-black text-gray-800">出題問題数</div>
          <div className="flex flex-wrap gap-2">
            {QUESTION_COUNT_CHOICES.map((count) => (
              <ToggleButton key={count} active={settings.questionTarget === count} activeClass="bg-gray-900 text-white" onClick={() => onChange({ questionTarget: count })}>
                {count}問
              </ToggleButton>
            ))}
          </div>
        </div>
      )}

      {settings.sourceMode === 'category' ? (
        <div className="space-y-3">
          <div className="text-sm font-black text-gray-800">カテゴリ</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QUIZ_CATEGORIES.map(([key, label]) => (
              <button
                key={key}
                onClick={() => onChange({ category: key })}
                className={cn(
                  'p-4 rounded-xl border text-center transition-all',
                  settings.category === key ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300',
                )}
              >
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="text-blue-600" size={20} />
                </div>
                <span className="font-bold text-gray-700">{label}</span>
                <span className="block text-[10px] text-gray-400 font-bold mt-1">{QUESTION_COUNT_BY_CATEGORY[key] ?? 0}問</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-900">
          カテゴリランダムでは、英語・漢字・ビジネスマナー・政治・行政・気象・経済から自動で混在出題します。
        </div>
      )}

      {message && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{message}</p>
      )}

      <button
        onClick={onStart}
        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        <ChevronRight size={18} /> この設定で開始
      </button>
    </div>
  </div>
);
