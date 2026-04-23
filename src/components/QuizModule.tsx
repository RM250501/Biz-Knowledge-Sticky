import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Clock, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { cn } from '../lib/utils';
import { Question, CATEGORY_LABELS, QUESTIONS } from '../types';

interface QuizModuleProps {
  onComplete: (score: number, category: string) => void;
}

export const QuizModule = ({ onComplete }: QuizModuleProps) => {
  // 選択カテゴリに応じて出題プールを決める。
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // 現在の問題インデックス。
  const [currentIdx, setCurrentIdx] = useState(0);
  // ユーザーが選択した選択肢。
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  // 回答後は再入力を防ぐ。
  const [isAnswered, setIsAnswered] = useState(false);
  // 1 問ごとの制限時間カウント。
  const [timeLeft, setTimeLeft] = useState(10);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  // カテゴリ内の出題順をランダム化した配列。
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (selectedCategory) {
      // カテゴリ選択時に対象問題を抽出してシャッフル。
      const filtered = QUESTIONS.filter(q => q.category === selectedCategory);
      if (filtered.length > 0) {
        setShuffledQuestions([...filtered].sort(() => Math.random() - 0.5));
      } else {
        setShuffledQuestions([]);
      }
      setCurrentIdx(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(10);
      setAiFeedback(null);
    }
  }, [selectedCategory]);

  const currentQuestion = shuffledQuestions[currentIdx];

  useEffect(() => {
    // 有効な未回答問題がある間だけカウントダウンする。
    if (selectedCategory && timeLeft > 0 && !isAnswered && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (selectedCategory && timeLeft === 0 && !isAnswered && currentQuestion) {
      // 時間切れ時は不正インデックス扱いで回答確定。
      handleAnswer(-1);
    }
  }, [timeLeft, isAnswered, selectedCategory, currentQuestion]);

  const handleAnswer = (idx: number) => {
    if (isAnswered || !currentQuestion) return;
    
    // 先に回答状態を確定する。
    setSelectedOption(idx);
    setIsAnswered(true);
    setAiFeedback(currentQuestion.explanation || "解説はありません。");

    // その後に外部のスコア更新を呼び出す。
    const isCorrect = idx === currentQuestion.correctIndex;
    if (isCorrect) {
      try {
        // 正解時のみカテゴリに XP を加算。
        onComplete(10, currentQuestion.category);
      } catch (e) {
        console.error("Error in onComplete:", e);
      }
    }
  };

  const nextQuestion = () => {
    // 次の問題へ進むか、カテゴリ選択に戻るかを判定。
    if (currentIdx < shuffledQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(10);
      setAiFeedback(null);
    } else {
      setSelectedCategory(null);
      setCurrentIdx(0);
    }
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        {/* 初期状態ではカテゴリ選択 UI を表示。 */}
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">学習カテゴリを選択してください</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className="p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <span className="font-bold text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // カテゴリ選択済みだが問題が未ロード/未定義の場合の分岐。
  if (shuffledQuestions.length === 0) {
    const hasQuestions = QUESTIONS.some(q => q.category === selectedCategory);
    if (!hasQuestions) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle size={48} className="text-gray-300" />
          <p className="text-gray-500">このカテゴリの問題は現在準備中です。</p>
          <button 
            onClick={() => setSelectedCategory(null)}
            className="text-blue-600 font-bold hover:underline"
          >
            カテゴリ一覧に戻る
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 italic">
        問題を読み込み中...
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">エラーが発生しました。</p>
        <button 
          onClick={() => setSelectedCategory(null)}
          className="text-blue-600 font-bold hover:underline"
        >
          最初からやり直す
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setSelectedCategory(null)}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          <ChevronRight className="rotate-180" size={14} /> カテゴリ一覧へ
        </button>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          カテゴリ: {CATEGORY_LABELS[currentQuestion.category] || currentQuestion.category || '不明'}
        </span>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full font-mono text-sm",
          timeLeft < 4 ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-600"
        )}>
          <Clock size={14} /> {timeLeft}s
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-lg italic text-sm">
          "{currentQuestion.scenario || 'シチュエーションの読み込み中...'}"
        </div>
        <h2 className="text-2xl font-bold text-gray-800 leading-tight">
          {currentQuestion.question || '問題の読み込み中...'}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {(currentQuestion.options || []).map((option, idx) => (
          <button
            key={idx}
            disabled={isAnswered}
            onClick={() => handleAnswer(idx)}
            className={cn(
              "p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-center justify-between group",
              !isAnswered && "border-gray-200 hover:border-blue-500 hover:bg-blue-50",
              isAnswered && idx === currentQuestion.correctIndex && "border-green-500 bg-green-50 text-green-800",
              isAnswered && selectedOption === idx && idx !== currentQuestion.correctIndex && "border-red-500 bg-red-50 text-red-800",
              isAnswered && idx !== currentQuestion.correctIndex && selectedOption !== idx && "border-gray-100 opacity-50"
            )}
          >
            <span className="font-medium">{option}</span>
            {isAnswered && idx === currentQuestion.correctIndex && <CheckCircle2 size={20} />}
            {isAnswered && selectedOption === idx && idx !== currentQuestion.correctIndex && <AlertCircle size={20} />}
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
              <Award size={14} /> 解説
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {aiFeedback}
            </p>
          </div>

          <button
            onClick={nextQuestion}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            {currentIdx < shuffledQuestions.length - 1 ? '次の問題へ' : 'カテゴリ選択へ'} <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
