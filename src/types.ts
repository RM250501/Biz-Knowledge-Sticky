// 4択クイズ1問分のデータ構造。
export interface Question {
  id: string;
  category: 'english' | 'kanji' | 'manners' | 'governance' | 'weather' | 'economy';
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Trivia モジュールで表示する日替わり雑学カードの構造。
export interface Trivia {
  id: string;
  category: string;
  title: string;
  explanation: string;
  doyaPoint: string;
  starter: string;
  target: string[];
  date: string;
}

// 雑学を話した結果のリアクション記録。
export interface TriviaLog {
  id: string;
  triviaId: string;
  date: string;
  reaction: 'funny' | 'failed' | 'known';
  note: string;
}

// お天気モジュールの現在天気表示データ。
export interface CurrentWeather {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitationProb: number;
  precipitationMm: number;
  updatedAt: string;
}

// 時間帯ごとの短期予報アイテム。
export interface ForecastItem {
  time: string;
  temp: number;
  condition: string;
  precipitationProb: number;
  precipitationMm: number;
}

// 表示用に整形した注意喚起情報。
export interface WeatherAlert {
  level: 'info' | 'watch' | 'warning';
  title: string;
  detail: string;
}

// 現在天気・予報・注意喚起をまとめた取得結果。
export interface WeatherBundle {
  current: CurrentWeather;
  forecast: ForecastItem[];
  alerts: WeatherAlert[];
}

// localStorage に保存する学習進捗の集約状態。
export interface UserStats {
  rank: string;
  score: number;
  completedQuestions: string[];
  categoryScores: Record<string, number>;
  learningLog: { date: string; score: number; earnedPoints: number; categories: string[]; triviaCount: number }[];
  knowledgeLevel: number;
  triviaLogs: TriviaLog[];
  loginStreak: number;
  lastLoginDate: string;
}

// 将来拡張向けのアカウント構造（現 UI では未使用）。
export interface UserAccount {
  username: string;
  password?: string; // デモ用のため、簡易なパスワード保持を想定
  createdAt: string;
}

// カテゴリ ID を画面表示名に変換するラベル辞書。
export const CATEGORY_LABELS: Record<string, string> = {
  english: '英語',
  kanji: '漢字',
  manners: 'ビジネスマナー',
  governance: '政治・行政',
  weather: '気象',
  economy: '経済',
  trivia: '雑学',
};

// 初回起動時に使うユーザー状態の初期値。
export const INITIAL_STATS: UserStats = {
  rank: 'インターン',
  score: 0,
  completedQuestions: [],
  categoryScores: {
    english: 0,
    kanji: 0,
    manners: 0,
    governance: 0,
    weather: 0,
    economy: 0,
    trivia: 0,
  },
  learningLog: [],
  knowledgeLevel: 0,
  triviaLogs: [],
  loginStreak: 0,
  lastLoginDate: '',
};

// QuizModule が参照する問題データ本体（ここにコンテンツを追加）
export const QUESTIONS: Question[] = [];
