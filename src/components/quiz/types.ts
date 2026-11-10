export type QuizSourceMode = 'category' | 'random';
export type QuizEndMode = 'time' | 'count';
export type QuizSessionState = 'setup' | 'quiz' | 'summary';

export interface QuizSettings {
  sourceMode: QuizSourceMode;
  endMode: QuizEndMode;
  durationMinutes: number;
  questionTarget: number;
  category: string;
}

// ダッシュボードのショートカットから渡す開始設定。
export interface QuizLaunchPreset {
  sourceMode: QuizSourceMode;
  endMode: QuizEndMode;
  durationMinutes?: number;
  questionTarget?: number;
  category?: string | null;
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  sourceMode: 'category',
  endMode: 'time',
  durationMinutes: 5,
  questionTarget: 10,
  category: 'english',
};

export const DURATION_CHOICES = [3, 5, 10, 15];
export const QUESTION_COUNT_CHOICES = [5, 10, 15, 20];
