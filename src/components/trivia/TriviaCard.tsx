import { Check, CheckCircle2, MessageSquare, Sparkles, User } from 'lucide-react';
import { Trivia } from '../../types';

interface TriviaCardProps {
  trivia: Trivia;
  hasTalked: boolean;
  lastFetchedLabel: string;
  statusMessage?: string | null;
  onOpenLogForm: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function TriviaCard({
  trivia,
  hasTalked,
  lastFetchedLabel,
  statusMessage,
  onOpenLogForm,
  onRefresh,
  isRefreshing,
}: TriviaCardProps) {
  return (
    <div className="bg-[#fdfdfb] p-10 rounded-[40px] shadow-sm border border-[#e8e8e0] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-16 -mt-16 opacity-50" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="px-4 py-1 bg-[#5A5A40] text-white rounded-full text-[10px] font-sans font-bold uppercase tracking-widest">
            {trivia.category}
          </span>
          <span className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest">
            {trivia.date}
          </span>
          {lastFetchedLabel && (
            <span className="text-[10px] font-sans font-bold text-green-600 uppercase tracking-widest">
              {lastFetchedLabel}
            </span>
          )}
          {statusMessage && (
            <span className="text-[10px] font-sans font-bold text-amber-600 uppercase tracking-widest">
              {statusMessage}
            </span>
          )}
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
            <div className="flex gap-2 flex-wrap">
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
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onOpenLogForm}
                className="olive-button flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
              >
                <Check size={18} /> 今日、誰かに話した！
              </button>
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="text-xs font-sans font-bold text-gray-400 hover:text-gray-700 transition disabled:opacity-50"
              >
                {isRefreshing ? '更新中...' : '今日のネタを更新する'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 font-bold italic">
              <CheckCircle2 size={20} /> アウトプット完了！
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
