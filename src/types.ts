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

// 日替わり表示用の固定雑学データ（ここにコンテンツを追加）
export const STATIC_TRIVIA: Trivia[] = [];

// QuizModule が参照する問題データ本体（ここにコンテンツを追加）
// QuizModule が参照する問題データ本体（ここにコンテンツを追加）
export const QUESTIONS: Question[] = [
  // --- 英語 ---
  {
    id: 'eng1',
    category: 'english',
    scenario: '文法',
    question: '「〜に慣れている」という状態を表すのに最も適切なものはどれですか？',
    options: [
      'I used to get up early.',
      'I am used to getting up early.',
      'I get used to get up early.',
      'I am use to get up early.'
    ],
    correctIndex: 1,
    explanation: '「be used to + 動名詞」が「〜に慣れている」を表します。'
  },
  {
    id: 'eng2',
    category: 'english',
    scenario: 'ビジネス表現',
    question: 'ビジネスメールの末尾に添える「敬具（よろしくお願いいたします）」に相当する表現はどれですか？',
    options: ['Hello,', 'Sincerely yours,', 'Nice meeting you,', 'Take care,'],
    correctIndex: 1,
    explanation: 'ビジネスメールの結びとしては「Sincerely」や「Sincerely yours」が一般的です。'
  },

  // --- 漢字 ---
  {
    id: 'kanji1',
    category: 'kanji',
    scenario: '語彙・読み',
    question: '下線部の読みとして正しいものはどれですか？「新体制への移行が進捗している。」',
    options: ['しんぽ', 'しんしゅう', 'しんちょく', 'しんあゆ'],
    correctIndex: 2,
    explanation: '「進捗」は「しんちょく」と読み、物事の進み具合を表します。'
  },
  {
    id: 'kanji2',
    category: 'kanji',
    scenario: '慣用句',
    question: '「意外なことが起こって驚くこと」を意味する正しい漢字はどれですか？',
    options: ['虚を突く', '許を突く', '居を突く', '去を突く'],
    correctIndex: 0,
    explanation: '「虚を突く（きょをつく）」が正しい表現です。'
  },

  // --- ビジネスマナー ---
  {
    id: 'manners1',
    category: 'manners',
    scenario: '敬語',
    question: '上司や取引先に対して「わかりました」と伝える際、最も適切な敬語はどれですか？',
    options: ['了解しました', '承知いたしました', '把握しました', '了信しました'],
    correctIndex: 1,
    explanation: 'より丁寧で正式なのは「承知いたしました」です。'
  },
  {
    id: 'manners2',
    category: 'manners',
    scenario: '応接室マナー',
    question: '応接室に案内された際、指示がない場合に座って待つべき場所はどこですか？',
    options: ['入り口に最も近い席（下座）', '部屋の最も奥の席（上座）', '部屋の中央の席', '立ったまま待つのが正解'],
    correctIndex: 0,
    explanation: '一般に訪問者は下座（入り口に近い席）に座るのが礼儀です。'
  },

  // --- 政治・行政 ---
  {
    id: 'gov1',
    category: 'governance',
    scenario: '国会の権限',
    question: '日本の国会において、衆議院にのみ認められている権限はどれですか？',
    options: ['法律案の議決', '条約の承認', '内閣不信任案の決議', '予算の議決'],
    correctIndex: 2,
    explanation: '内閣不信任決議は衆議院で可決することに意味があり、衆議院に特有の手続きです。'
  },
  {
    id: 'gov2',
    category: 'governance',
    scenario: '地方自治',
    question: '住民がその職を辞めさせるよう求めることができる権利（解職請求）を何といいますか？',
    options: ['リコール', 'サボタージュ', 'ボイコット', 'イニシアティブ'],
    correctIndex: 0,
    explanation: '解職請求は英語で「リコール（recall）」と呼ばれます。'
  },

  // --- 気象 ---
  {
    id: 'weather1',
    category: 'weather',
    scenario: '気団',
    question: '日本付近で、冬に北西から吹く冷たく乾燥した風の正体である気団は何ですか？',
    options: ['オホーツク海気団', '小笠原気団', 'シベリア気団', '揚子江気団'],
    correctIndex: 2,
    explanation: '冬季に日本に冷たい北西の季節風をもたらすのはシベリア気団です。'
  },
  {
    id: 'weather2',
    category: 'weather',
    scenario: '警報級',
    question: '気象警報のうち、重大な災害が起こるおそれが著しく高まっている場合に発表される最高レベルのものはどれですか？',
    options: ['注意報', '警報', '特別警報', '避難勧告'],
    correctIndex: 2,
    explanation: '重大な災害の危険性が極めて高い場合に発表されるのが「特別警報」です。'
  },

  // --- 経済 ---
  {
    id: 'econ1',
    category: 'economy',
    scenario: '物価動向',
    question: '物価が持続的に下落し、通貨の価値が上がっていく経済現象を何といいますか？',
    options: ['インフレーション', 'デフレーション', 'スタグフレーション', 'リフレーション'],
    correctIndex: 1,
    explanation: '物価の持続的下落は「デフレーション」と呼ばれます。'
  },
  {
    id: 'econ2',
    category: 'economy',
    scenario: '政策',
    question: '日本の中央銀行である日本銀行が行う、通貨の流通量を調節する政策を何といいますか？',
    options: ['財政政策', '金融政策', '産業政策', '租税政策'],
    correctIndex: 1,
    explanation: '通貨供給量や金利を調整するのは中央銀行が行う「金融政策」です。'
  }
];
