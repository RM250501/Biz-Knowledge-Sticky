import { useCallback, useEffect, useState } from 'react';
import type { Question } from '../types';
import { QUESTIONS } from '../data/questions';
import { shuffle } from '../lib/shuffle';
import { toLocalDateKey } from '../../shared/date';
import { requestQuizReport } from '../services/apiClient';
import { buildLocalQuizReport, type QuizReport, type QuizSessionLogItem } from '../../shared/quizReport';
import {
  DEFAULT_QUIZ_SETTINGS,
  type QuizLaunchPreset,
  type QuizSessionState,
  type QuizSettings,
} from '../components/quiz/types';

// URL に ?quickTest=1 があるときは 1 問だけ出題する（動作確認用）。
function isQuickTest() {
  try {
    return new URLSearchParams(window.location.search).get('quickTest') === '1';
  } catch {
    return false;
  }
}

// 正解の位置が覚えられないよう、出題ごとに選択肢の並びを入れ替える。
function shuffleOptions(question: Question): Question {
  const order = shuffle(question.options.map((_, idx) => idx));
  return {
    ...question,
    options: order.map((idx) => question.options[idx]),
    correctIndex: order.indexOf(question.correctIndex),
  };
}

function buildSessionPool(settings: QuizSettings): Question[] {
  const source = settings.sourceMode === 'random'
    ? QUESTIONS
    : QUESTIONS.filter((q) => q.category === settings.category);
  const shuffled = shuffle(source);
  const picked = settings.endMode === 'count'
    ? shuffled.slice(0, Math.min(settings.questionTarget, shuffled.length))
    : shuffled;
  return picked.map(shuffleOptions);
}

function saveSessionLog(log: QuizSessionLogItem[], report: QuizReport) {
  try {
    localStorage.setItem(`quiz_session_${toLocalDateKey()}`, JSON.stringify({ timestamp: Date.now(), log, report }));
  } catch (error) {
    console.warn('Failed to save quiz session:', error);
  }
}

export function useQuizSession(onCorrect: (points: number, category: string) => void) {
  const [state, setState] = useState<QuizSessionState>('setup');
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_QUIZ_SETTINGS);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionLog, setSessionLog] = useState<QuizSessionLogItem[]>([]);
  const [report, setReport] = useState<QuizReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const [summaryMessage, setSummaryMessage] = useState('');

  const currentQuestion = questions[currentIdx] as Question | undefined;
  const isAnswered = selectedOption !== null;
  const correctCount = sessionLog.filter((s) => s.isCorrect).length;
  const isLastQuestion = currentIdx >= questions.length - 1;

  const updateSettings = useCallback((patch: Partial<QuizSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const start = useCallback((preset?: QuizLaunchPreset) => {
    const next: QuizSettings = {
      sourceMode: preset?.sourceMode ?? settings.sourceMode,
      endMode: preset?.endMode ?? settings.endMode,
      durationMinutes: preset?.durationMinutes ?? settings.durationMinutes,
      questionTarget: preset?.questionTarget ?? settings.questionTarget,
      category: preset?.category ?? settings.category,
    };
    if (isQuickTest()) {
      next.endMode = 'count';
      next.questionTarget = 1;
    }

    const pool = buildSessionPool(next);
    setSettings(next);
    if (pool.length === 0) {
      setQuestions([]);
      setState('setup');
      setSetupMessage('この条件で出題できる問題がありません。');
      return;
    }

    setQuestions(pool);
    setCurrentIdx(0);
    setSelectedOption(null);
    setSessionLog([]);
    setReport(null);
    setReportLoading(false);
    setSetupMessage('');
    setSummaryMessage('');
    setTimeLeft(next.endMode === 'time' ? next.durationMinutes * 60 : 0);
    setState('quiz');
  }, [settings]);

  const finish = useCallback((reason: string) => {
    setSummaryMessage(reason);
    setState('summary');
  }, []);

  const backToSetup = useCallback(() => {
    setState('setup');
    setQuestions([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setSessionLog([]);
    setReport(null);
    setReportLoading(false);
    setSummaryMessage('');
  }, []);

  const answer = useCallback((optionIdx: number) => {
    if (state !== 'quiz' || !currentQuestion || selectedOption !== null) return;
    setSelectedOption(optionIdx);

    const isCorrect = optionIdx === currentQuestion.correctIndex;
    if (isCorrect) {
      // 正解時のみカテゴリに XP を加算する。
      onCorrect(10, currentQuestion.category);
    }
    setSessionLog((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        category: currentQuestion.category,
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex] || '',
        userAnswer: currentQuestion.options[optionIdx] || '',
        isCorrect,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [state, currentQuestion, selectedOption, onCorrect]);

  const next = useCallback(() => {
    if (!isLastQuestion) {
      setCurrentIdx((idx) => idx + 1);
      setSelectedOption(null);
      return;
    }
    finish(settings.endMode === 'count' ? '出題数に達しました' : '用意された問題をすべて解きました');
  }, [isLastQuestion, settings.endMode, finish]);

  // 時間制: 未回答の問題を表示している間だけカウントダウンする。
  useEffect(() => {
    if (state !== 'quiz' || settings.endMode !== 'time' || isAnswered || !currentQuestion) return;
    if (timeLeft <= 0) {
      finish('時間切れ');
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [state, settings.endMode, isAnswered, currentQuestion, timeLeft, finish]);

  // 結果画面に入ったらレポートを作る。サーバーに届かなければローカル集計に切り替える。
  useEffect(() => {
    if (state !== 'summary' || report || sessionLog.length === 0) return;
    let cancelled = false;
    setReportLoading(true);
    requestQuizReport(sessionLog)
      .catch((error) => {
        console.warn('Quiz report API failed, using local report:', error);
        return buildLocalQuizReport(sessionLog);
      })
      .then((result) => {
        if (cancelled) return;
        setReport(result);
        setReportLoading(false);
        saveSessionLog(sessionLog, result);
      });
    return () => {
      cancelled = true;
    };
  }, [state, report, sessionLog]);

  return {
    state,
    settings,
    updateSettings,
    questions,
    currentIdx,
    currentQuestion,
    selectedOption,
    isAnswered,
    isLastQuestion,
    timeLeft,
    answeredCount: sessionLog.length,
    correctCount,
    report,
    reportLoading,
    setupMessage,
    summaryMessage,
    start,
    answer,
    next,
    backToSetup,
  };
}

export type QuizSession = ReturnType<typeof useQuizSession>;
