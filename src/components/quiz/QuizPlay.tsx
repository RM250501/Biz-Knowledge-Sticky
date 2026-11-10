import React from 'react';
import { AlertCircle, Award, CheckCircle2, ChevronRight, Clock, ListChecks } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CATEGORY_LABELS, type Question } from '../../types';
import type { QuizSettings } from './types';

interface QuizPlayProps {
  question: Question;
  settings: QuizSettings;
  selectedOption: number | null;
  timeLeft: number;
  answeredCount: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  onAnswer: (optionIdx: number) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export const QuizPlay = ({
  question,
  settings,
  selectedOption,
  timeLeft,
  answeredCount,
  totalQuestions,
  isLastQuestion,
  onAnswer,
  onNext,
  onBack,
}: QuizPlayProps) => {
  const isAnswered = selectedOption !== null;
  const categoryLabel = CATEGORY_LABELS[question.category] || question.category;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <ChevronRight className="rotate-180" size={14} /> 設定に戻る
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block">
            {settings.sourceMode === 'random' ? `カテゴリランダム（${categoryLabel}）` : `カテゴリ: ${categoryLabel}`}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            {settings.endMode === 'time' ? `${settings.durationMinutes}分セッション` : `${settings.questionTarget}問セッション`}
          </span>
        </div>
        {settings.endMode === 'time' ? (
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-full font-mono text-sm',
              timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600',
            )}
          >
            <Clock size={14} /> {formatTime(timeLeft)}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full font-mono text-sm bg-gray-100 text-gray-600">
            <ListChecks size={14} /> {answeredCount}/{totalQuestions}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-lg italic text-sm">
          "{question.scenario}"
        </div>
        <h2 className="text-2xl font-bold text-gray-800 leading-tight">{question.question}</h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, idx) => {
          const isCorrectOption = idx === question.correctIndex;
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => onAnswer(idx)}
              className={cn(
                'p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-center justify-between group',
                !isAnswered && 'border-gray-200 hover:border-blue-500 hover:bg-blue-50',
                isAnswered && isCorrectOption && 'border-green-500 bg-green-50 text-green-800',
                isAnswered && isSelected && !isCorrectOption && 'border-red-500 bg-red-50 text-red-800',
                isAnswered && !isCorrectOption && !isSelected && 'border-gray-100 opacity-50',
              )}
            >
              <span className="font-medium">{option}</span>
              {isAnswered && isCorrectOption && <CheckCircle2 size={20} />}
              {isAnswered && isSelected && !isCorrectOption && <AlertCircle size={20} />}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
              <Award size={14} /> 解説
            </h4>
            <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
          </div>

          <button
            onClick={onNext}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            {isLastQuestion ? '結果を見る' : '次の問題へ'} <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
