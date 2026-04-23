import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Clock, CheckCircle2, AlertCircle, Award, Shuffle, Timer, ListChecks, Settings2, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { Question, CATEGORY_LABELS, QUESTIONS } from '../types';

type QuizSourceMode = 'category' | 'random';
type QuizEndMode = 'time' | 'count';
type QuizSessionState = 'setup' | 'quiz' | 'summary';

export interface QuizLaunchPreset {
  sourceMode: QuizSourceMode;
  endMode: QuizEndMode;
  durationMinutes?: number;
  questionTarget?: number;
  category?: string | null;
}

interface QuizModuleProps {
  onComplete: (score: number, category: string) => void;
  launchPreset: QuizLaunchPreset | null;
  onPresetConsumed: () => void;
}

export const QuizModule = ({ onComplete, launchPreset, onPresetConsumed }: QuizModuleProps) => {
  // セッション開始前の設定画面、実行中、結果画面を切り替える。
  const [sessionState, setSessionState] = useState<QuizSessionState>('setup');
  // 出題元はカテゴリ別かランダムかを選ぶ。
  const [sourceMode, setSourceMode] = useState<QuizSourceMode>('category');
  // 終了条件は時間制か出題数かを選ぶ。
  const [endMode, setEndMode] = useState<QuizEndMode>('time');
  // 時間制の初期値は 5 分。
  const [durationMinutes, setDurationMinutes] = useState(5);
  // 出題数制の初期値。
  const [questionTarget, setQuestionTarget] = useState(10);
  // カテゴリ別出題時に使う選択カテゴリ。
  const [selectedCategory, setSelectedCategory] = useState<string>('english');
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
  // セッション全体の正解数。
  const [correctCount, setCorrectCount] = useState(0);
  // セッション全体の回答数。
  const [answeredCount, setAnsweredCount] = useState(0);
  // 結果画面で表示するメッセージ。
  const [summaryMessage, setSummaryMessage] = useState<string>('');

  const resetQuestionState = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setAiFeedback(null);
  };

  const startSession = (preset?: QuizLaunchPreset) => {
    const nextSourceMode = preset?.sourceMode ?? sourceMode;
    const nextEndMode = preset?.endMode ?? endMode;
    const nextDurationMinutes = preset?.durationMinutes ?? durationMinutes;
    const nextQuestionTarget = preset?.questionTarget ?? questionTarget;
    const nextCategory = preset?.category ?? selectedCategory;

    const sourcePool = nextSourceMode === 'random'
      ? QUESTIONS
      : QUESTIONS.filter(q => q.category === nextCategory);

    if (sourcePool.length === 0) {
      setShuffledQuestions([]);
      setSessionState('setup');
      setSummaryMessage('この条件で出題できる問題がありません。');
      return;
    }

    const shuffledPool = [...sourcePool].sort(() => Math.random() - 0.5);
    const sessionPool = nextEndMode === 'count'
      ? shuffledPool.slice(0, Math.min(nextQuestionTarget, shuffledPool.length))
      : shuffledPool;

    setSourceMode(nextSourceMode);
    setEndMode(nextEndMode);
    setDurationMinutes(nextDurationMinutes);
    setQuestionTarget(nextQuestionTarget);
    setSelectedCategory(nextCategory || 'english');
    setShuffledQuestions(sessionPool);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setAiFeedback(null);
    setCorrectCount(0);
    setAnsweredCount(0);
    setSummaryMessage('');
    setTimeLeft(nextEndMode === 'time' ? nextDurationMinutes * 60 : 0);
    setSessionState('quiz');
  };

  useEffect(() => {
    if (launchPreset) {
      startSession(launchPreset);
      onPresetConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchPreset]);

  const currentQuestion = shuffledQuestions[currentIdx];

  useEffect(() => {
    // 有効な未回答問題がある間だけカウントダウンする。
    if (sessionState === 'quiz' && endMode === 'time' && timeLeft > 0 && !isAnswered && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sessionState === 'quiz' && endMode === 'time' && timeLeft === 0 && !isAnswered && currentQuestion) {
      finishSession('時間切れ');
    }
  }, [timeLeft, isAnswered, sessionState, endMode, currentQuestion]);

  const finishSession = (reason: string) => {
    setSessionState('summary');
    setSummaryMessage(reason);
  };

  const handleAnswer = (idx: number) => {
    if (isAnswered || !currentQuestion || sessionState !== 'quiz') return;
    
    // 先に回答状態を確定する。
    setSelectedOption(idx);
    setIsAnswered(true);
    setAiFeedback(currentQuestion.explanation || "解説はありません。");
    setAnsweredCount(prev => prev + 1);

    // その後に外部のスコア更新を呼び出す。
    const isCorrect = idx === currentQuestion.correctIndex;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
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
      setAiFeedback(null);
    } else if (endMode === 'count') {
      finishSession('出題数に達しました');
    } else {
      setSessionState('setup');
      resetQuestionState();
    }
  };

  const restartSetup = () => {
    setSessionState('setup');
    setSummaryMessage('');
    resetQuestionState();
  };

  if (sessionState === 'summary') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
            <Settings2 size={14} /> セッション終了
          </div>
          <h2 className="text-2xl font-black text-gray-800">{summaryMessage || 'セッションが終了しました'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-[10px] font-black text-gray-400 uppercase">回答数</div>
              <div className="text-xl font-black text-gray-800">{answeredCount}</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-[10px] font-black text-gray-400 uppercase">正解数</div>
              <div className="text-xl font-black text-green-600">{correctCount}</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-[10px] font-black text-gray-400 uppercase">出題方法</div>
              <div className="text-sm font-bold text-gray-800">{sourceMode === 'random' ? 'カテゴリランダム' : `カテゴリ別: ${CATEGORY_LABELS[selectedCategory] || selectedCategory}`}</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-[10px] font-black text-gray-400 uppercase">終了条件</div>
              <div className="text-sm font-bold text-gray-800">{endMode === 'time' ? `${durationMinutes}分` : `${questionTarget}問`}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={restartSetup}
            className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> 設定に戻る
          </button>
          <button
            onClick={() => startSession()}
            className="flex-1 py-4 bg-white text-gray-900 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ChevronRight size={18} /> 同じ設定でもう一度
          </button>
        </div>
      </div>
    );
  }

  if (sessionState === 'setup') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
            <Settings2 size={14} /> 学習設定
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <div className="text-sm font-black text-gray-800">出題方法</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSourceMode('category')}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all",
                    sourceMode === 'category' ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                  )}
                >
                  カテゴリ別
                </button>
                <button
                  onClick={() => setSourceMode('random')}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                    sourceMode === 'random' ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                  )}
                >
                  <Shuffle size={14} /> カテゴリランダム
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <div className="text-sm font-black text-gray-800">終了条件</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEndMode('time')}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                    endMode === 'time' ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200"
                  )}
                >
                  <Timer size={14} /> 時間
                </button>
                <button
                  onClick={() => setEndMode('count')}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                    endMode === 'count' ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200"
                  )}
                >
                  <ListChecks size={14} /> 出題数
                </button>
              </div>
            </div>
          </div>

          {endMode === 'time' ? (
            <div className="space-y-3">
              <div className="text-sm font-black text-gray-800">所要時間</div>
              <div className="flex flex-wrap gap-2">
                {[3, 5, 10, 15].map(minutes => (
                  <button
                    key={minutes}
                    onClick={() => setDurationMinutes(minutes)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-all",
                      durationMinutes === minutes ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"
                    )}
                  >
                    {minutes}分
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">デフォルトは 5 分です。</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-black text-gray-800">出題問題数</div>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20].map(count => (
                  <button
                    key={count}
                    onClick={() => setQuestionTarget(count)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-all",
                      questionTarget === count ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"
                    )}
                  >
                    {count}問
                  </button>
                ))}
              </div>
            </div>
          )}

          {sourceMode === 'category' ? (
            <div className="space-y-3">
              <div className="text-sm font-black text-gray-800">カテゴリ</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(CATEGORY_LABELS).filter(([key]) => key !== 'trivia').map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={cn(
                      "p-4 rounded-xl border text-center transition-all",
                      selectedCategory === key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-blue-300"
                    )}
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="text-blue-600" size={20} />
                    </div>
                    <span className="font-bold text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-900">
              カテゴリランダムでは、英語・漢字・ビジネスマナー・政治・気象・行政から自動で混在出題します。
            </div>
          )}

          <button
            onClick={() => startSession()}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <ChevronRight size={18} /> この設定で開始
          </button>
        </div>
      </div>
    );
  }

  // カテゴリ選択済みだが問題が未ロード/未定義の場合の分岐。
  if (shuffledQuestions.length === 0) {
    const hasQuestions = QUESTIONS.some(q => sourceMode === 'random' ? true : q.category === selectedCategory);
    if (!hasQuestions) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle size={48} className="text-gray-300" />
          <p className="text-gray-500">このカテゴリの問題は現在準備中です。</p>
          <button 
            onClick={restartSetup}
            className="text-blue-600 font-bold hover:underline"
          >
            設定に戻る
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
          onClick={restartSetup}
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
          onClick={restartSetup}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          <ChevronRight className="rotate-180" size={14} /> 設定に戻る
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block">
            {sourceMode === 'random' ? 'カテゴリランダム' : `カテゴリ: ${CATEGORY_LABELS[currentQuestion.category] || currentQuestion.category || '不明'}`}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            {endMode === 'time' ? `${durationMinutes}分セッション` : `${questionTarget}問セッション`}
          </span>
        </div>
        {endMode === 'time' ? (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full font-mono text-sm",
            timeLeft < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-600"
          )}>
            <Clock size={14} /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full font-mono text-sm bg-gray-100 text-gray-600">
            <ListChecks size={14} /> {answeredCount}/{shuffledQuestions.length}
          </div>
        )}
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
            {currentIdx < shuffledQuestions.length - 1 ? '次の問題へ' : endMode === 'count' ? '結果を見る' : '設定に戻る'} <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
