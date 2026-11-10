import React, { useEffect } from 'react';
import { useQuizSession } from '../hooks/useQuizSession';
import { QuizSetup } from './quiz/QuizSetup';
import { QuizPlay } from './quiz/QuizPlay';
import { QuizSummary } from './quiz/QuizSummary';
import type { QuizLaunchPreset } from './quiz/types';

export type { QuizLaunchPreset } from './quiz/types';

interface QuizModuleProps {
  onComplete: (score: number, category: string) => void;
  launchPreset: QuizLaunchPreset | null;
  onPresetConsumed: () => void;
}

export const QuizModule = ({ onComplete, launchPreset, onPresetConsumed }: QuizModuleProps) => {
  const session = useQuizSession(onComplete);

  // ダッシュボードのショートカットから来た場合は、設定画面を飛ばして開始する。
  useEffect(() => {
    if (launchPreset) {
      session.start(launchPreset);
      onPresetConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchPreset]);

  if (session.state === 'summary') {
    return (
      <QuizSummary
        message={session.summaryMessage}
        settings={session.settings}
        answeredCount={session.answeredCount}
        correctCount={session.correctCount}
        report={session.report}
        reportLoading={session.reportLoading}
        onBackToSetup={session.backToSetup}
        onRestart={() => session.start()}
      />
    );
  }

  if (session.state === 'quiz' && session.currentQuestion) {
    return (
      <QuizPlay
        question={session.currentQuestion}
        settings={session.settings}
        selectedOption={session.selectedOption}
        timeLeft={session.timeLeft}
        answeredCount={session.answeredCount}
        totalQuestions={session.questions.length}
        isLastQuestion={session.isLastQuestion}
        onAnswer={session.answer}
        onNext={session.next}
        onBack={session.backToSetup}
      />
    );
  }

  return (
    <QuizSetup
      settings={session.settings}
      message={session.setupMessage}
      onChange={session.updateSettings}
      onStart={() => session.start()}
    />
  );
};
