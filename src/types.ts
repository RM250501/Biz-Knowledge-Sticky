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
  },
  // ==========================================
  // --- 英語 (english) : eng3 〜 eng12 ---
  // ==========================================
  {
    id: 'eng3',
    category: 'english',
    scenario: 'ビジネス表現',
    question: '「提出期限」を意味する単語として最も適切なものはどれですか？',
    options: ['Baseline', 'Deadline', 'Guideline', 'Headline'],
    correctIndex: 1,
    explanation: '「deadline」は締め切りや提出期限を意味する一般的なビジネス単語です。'
  },
  {
    id: 'eng4',
    category: 'english',
    scenario: '文法',
    question: '「We decided to go on a picnic (  ) it was raining.」の（ ）に入る適切な単語はどれですか？',
    options: ['because', 'despite', 'although', 'unless'],
    correctIndex: 2,
    explanation: '「although（〜にもかかわらず）」が文脈上最も適切です。「despite」は後ろに名詞を伴うため不可です。'
  },
  {
    id: 'eng5',
    category: 'english',
    scenario: 'ビジネス表現',
    question: '会議の「議題」を意味する英単語はどれですか？',
    options: ['Schedule', 'Agenda', 'Minute', 'Summary'],
    correctIndex: 1,
    explanation: '「agenda（アジェンダ）」は会議の議題や協議事項のリストを指します。'
  },
  {
    id: 'eng6',
    category: 'english',
    scenario: '略語',
    question: 'ビジネスメール等で使われる「ASAP」という略語の正しい意味はどれですか？',
    options: ['可能な限り早く', 'できるだけ安く', '準備が整い次第', 'おそらく'],
    correctIndex: 0,
    explanation: '「As Soon As Possible」の略で、「可能な限り早く」という意味です。'
  },
  {
    id: 'eng7',
    category: 'english',
    scenario: '熟語',
    question: '「出張に行く」の表現として最も適切なものはどれですか？',
    options: ['Go to a business trip', 'Go for a business trip', 'Go on a business trip', 'Go in a business trip'],
    correctIndex: 2,
    explanation: '「go on a trip」の形で「旅行・出張に行く」を表します。'
  },
  {
    id: 'eng8',
    category: 'english',
    scenario: '文法',
    question: '「This song reminds me (  ) my childhood.」の（ ）に入る前置詞はどれですか？',
    options: ['in', 'with', 'of', 'to'],
    correctIndex: 2,
    explanation: '「remind A of B」で「AにBを思い出させる」という重要熟語です。'
  },
  {
    id: 'eng9',
    category: 'english',
    scenario: 'ビジネス表現',
    question: '「領収書」を意味する単語の綴り（スペル）として正しいものはどれですか？',
    options: ['Recipt', 'Receipt', 'Reseit', 'Reciept'],
    correctIndex: 1,
    explanation: '「receipt（領収書）」は p を発音しないためスペルミスが起きやすい単語です。'
  },
  {
    id: 'eng10',
    category: 'english',
    scenario: 'ビジネス表現',
    question: '「有給休暇」を意味する表現として最も一般的なものはどれですか？',
    options: ['Paid holiday', 'Free vacation', 'Salary break', 'Money leave'],
    correctIndex: 0,
    explanation: '給与が支払われる（paid）休暇（holiday/leave）で「paid holiday」や「paid leave」と呼びます。'
  },
  {
    id: 'eng11',
    category: 'english',
    scenario: 'ビジネス表現',
    question: '「予算」を意味するビジネスで必須の単語はどれですか？',
    options: ['Profit', 'Budget', 'Cost', 'Asset'],
    correctIndex: 1,
    explanation: '「budget」は予算、「profit」は利益、「cost」は費用、「asset」は資産を意味します。'
  },
  {
    id: 'eng12',
    category: 'english',
    scenario: '文法',
    question: '「ロンドンに3回行ったことがある」を意味する文として正しいものはどれですか？',
    options: [
      'I have gone to London three times.',
      'I have been to London three times.',
      'I have stayed to London three times.',
      'I have visited to London three times.'
    ],
    correctIndex: 1,
    explanation: '「have been to 〜」で経験（〜に行ったことがある）を表します。「have gone to」は「行ってしまってここにはいない」を意味します。'
  },

  // ==========================================
  // --- 漢字 (kanji) : kanji3 〜 kanji12 ---
  // ==========================================
  {
    id: 'kanji3',
    category: 'kanji',
    scenario: '語彙・読み',
    question: '下線部の読みとして正しいものはどれですか？「会議の資料を重複して印刷してしまった。」',
    options: ['じゅうふく', 'ちょうふく', 'じゅうぶく', 'ちょうぷく'],
    correctIndex: 1,
    explanation: '本来の正しい読み（本読み）は「ちょうふく」です。「じゅうふく」も慣用読みとして定着しつつありますが、試験等では「ちょうふく」が正解とされます。'
  },
  {
    id: 'kanji4',
    category: 'kanji',
    scenario: '語彙・漢字',
    question: '「仕事がとどこおる」の「とどこおる」の漢字表記として正しいものはどれですか？',
    options: ['溜まる', '停まる', '滞る', '止まる'],
    correctIndex: 2,
    explanation: '物事が順調に進まない状態を「滞る（とどこおる）」と書きます。'
  },
  {
    id: 'kanji5',
    category: 'kanji',
    scenario: '語彙・読み',
    question: '下線部の読みとして正しいものはどれですか？「この計画には懸念がある。」',
    options: ['けいねん', 'けんねん', 'けねん', 'かねん'],
    correctIndex: 2,
    explanation: '「懸念」は「けねん」と読み、気にかかって不安に思うことを指します。'
  },
  {
    id: 'kanji6',
    category: 'kanji',
    scenario: '誤用しやすい言葉',
    question: '「おもむろに」の正しい漢字と使い方の組み合わせはどれですか？',
    options: ['露に（急に動き出す）', '徐に（ゆっくりと動き出す）', '趣に（趣向を凝らす）', '凡に（平凡な様子）'],
    correctIndex: 1,
    explanation: '「おもむろに（徐に）」は「落ち着いて、ゆっくりと行動を起こす様子」を意味します。急にという意味ではありません。'
  },
  {
    id: 'kanji7',
    category: 'kanji',
    scenario: '同音異義語',
    question: '「新しい役職に就く」の「つく」の漢字として正しいものはどれですか？',
    options: ['付く', '着く', '就く', '即く'],
    correctIndex: 2,
    explanation: '職務や地位に身を置く場合は「就く」を使います。'
  },
  {
    id: 'kanji8',
    category: 'kanji',
    scenario: '慣用句',
    question: '下線部の読みとして正しいものはどれですか？「彼の言葉が心の琴線に触れた。」',
    options: ['ことせん', 'きんせん', 'きんぜん', 'こんせん'],
    correctIndex: 1,
    explanation: '「琴線」は「きんせん」と読み、良いものに触れて感動する心の動きを指します。'
  },
  {
    id: 'kanji9',
    category: 'kanji',
    scenario: '語彙・読み',
    question: '下線部の読みとして正しいものはどれですか？「新しく入ったメンバーは、とても初々しい。」',
    options: ['はつはつしい', 'ういういしい', 'しょしょしい', 'なまなましい'],
    correctIndex: 1,
    explanation: '「初々しい」は「ういういしい」と読み、若らしくて新鮮な様子を意味します。'
  },
  {
    id: 'kanji10',
    category: 'kanji',
    scenario: '語彙・漢字',
    question: '「自分だけの独壇場だ」の「独壇場（どくだんじょう）」は本来の誤用から定着した言葉です。本来の正しい表記と読みはどれですか？',
    options: ['独段場（どくだんじょう）', '特壇場（とくだんじょう）', '独擅場（どくせんじょう）', '独善場（どくぜんじょう）'],
    correctIndex: 2,
    explanation: '本来は「独擅場（どくせんじょう）」でしたが、「擅」を「壇」と見間違えて「どくだんじょう」と読まれるようになり、現在はこちらも辞書に載るようになりました。'
  },
  {
    id: 'kanji11',
    category: 'kanji',
    scenario: '語彙・読み',
    question: '下線部の読みとして正しいものはどれですか？「彼は非常に饒舌な人だ。」',
    options: ['ぎょうぜつ', 'じょうぜつ', 'びょうぜつ', 'れつぜつ'],
    correctIndex: 1,
    explanation: '「饒舌」は「じょうぜつ」と読み、口数が多いこと（おしゃべり）を意味します。'
  },
  {
    id: 'kanji12',
    category: 'kanji',
    scenario: '筆順',
    question: '次の漢字のうち、漢字の書き順として「一画目が左払いでない（横棒から始まる）」ものはどれですか？',
    options: ['有', '右', '左', '在'],
    correctIndex: 2,
    explanation: '「左」の一画目は「横棒」です。それに対して「右」「有」「在」の一画目はすべて「左払い」から始まります。'
  },

  // ==========================================
  // --- ビジネスマナー (manners) : manners3 〜 manners12 ---
  // ==========================================
  {
    id: 'manners3',
    category: 'manners',
    scenario: '席次',
    question: '運転手付きのタクシーにおいて、最も上座とされるのはどの席ですか？',
    options: ['助手席', '運転手の真後ろの席', '後部座席の左側', '後部座席の中央'],
    correctIndex: 1,
    explanation: '運転手付きの車では、万が一の事故の際に最も安全とされる「運転手の真後ろ」が最上座になります。最下座は助手席です。'
  },
  {
    id: 'manners4',
    category: 'manners',
    scenario: '名刺交換',
    question: '他社を訪問した際、名刺を交換するタイミングとして最も適切なのはいつですか？',
    options: ['部屋に通されて挨拶をしてすぐ（着席前）', '着席し、相手が話し始めてから', '会議や商談が終わって帰る間際', '相手にお茶が出された後'],
    correctIndex: 0,
    explanation: '名刺交換は、最初に対面して挨拶を交わす際、席に着く前に行うのが基本ルールです。'
  },
  {
    id: 'manners5',
    category: 'manners',
    scenario: '電話応対',
    question: '電話応対で相手の声が聞き取りにくい場合、マナーとして最も適切な対応はどれですか？',
    options: [
      '「声が小さいので、もっと大きな声でお願いします」と言う',
      '「お電話が少し遠いようですので、もう一度お伺いしてもよろしいでしょうか」と尋ねる',
      '「聞こえないので、かけ直してください」と伝える',
      '聞き流して、後からメールで確認する'
    ],
    correctIndex: 1,
    explanation: '相手のせいにせず、「お電話が遠いようです」と表現するのがビジネス上のクッション言葉として定着しています。'
  },
  {
    id: 'manners6',
    category: 'manners',
    scenario: '指示受け',
    question: '上司から業務の指示を受けた際、ミスの予防として最初に行うべきことは何ですか？',
    options: [
      '指示が終わったらすぐに自席に戻り、作業に取り掛かる',
      '内容をメモに記録し、最後に重要項目を復唱して確認する',
      '自分のやり方で進めて、すべて終わってから報告する',
      '同僚に内容が正しいか相談する'
    ],
    correctIndex: 1,
    explanation: '指示の内容をメモし、最後に復唱（特に期日や数値）して上司と認識を合わせることで、勘違いによるミスを防ぎます。'
  },
  {
    id: 'manners7',
    category: 'manners',
    scenario: '訪問マナー',
    question: '冬場に他社を訪問する際、コートを脱ぐタイミングとして最も適切なのはいつですか？',
    options: ['訪問先の建物（ビル）に入る前', '建物に入ってすぐ（受付の手前）', '応接室に通された後', '相手と対面した直後'],
    correctIndex: 0,
    explanation: 'コートは埃を建物内に持ち込まないよう、ビルの入り口前、あるいはエントランスに入る前に脱ぐのがマナーです。'
  },
  {
    id: 'manners8',
    category: 'manners',
    scenario: 'ビジネスメール',
    question: 'ビジネスメールの「件名」として最も望ましいものはどれですか？',
    options: [
      'お世話になっております',
      '先日はありがとうございました',
      '【ご相談】10月定例会議の日程変更について',
      '田中よりご連絡です'
    ],
    correctIndex: 2,
    explanation: 'メールの件名は、一目で用件と重要度が伝わる具体的かつ簡潔なもの（要件や社名などを明記）にする必要があります。'
  },
  {
    id: 'manners9',
    category: 'manners',
    scenario: '席次',
    question: 'エレベーター内における立ち位置で、最も下座（若手や案内役が立つべき、操作盤の前）はどこですか？',
    options: ['奥の右側', '奥の左側', '入り口付近の操作盤の前', '入り口付近の操作盤の反対側'],
    correctIndex: 2,
    explanation: 'エレベーターでは、ボタンを操作する「操作盤の前」が最下座（案内役の席）となります。最上座は操作盤から一番遠い「奥の右側（または左側）」です。'
  },
  {
    id: 'manners10',
    category: 'manners',
    scenario: '序列',
    question: '一般的な日本企業における、役職の序列（高い順）として正しいものはどれですか？',
    options: [
      '会長 ＞ 社長 ＞ 専務 ＞ 常務',
      '会長 ＞ 社長 ＞ 常務 ＞ 専務',
      '社長 ＞ 会長 ＞ 専務 ＞ 常務',
      '社長 ＞ 専務 ＞ 会長 ＞ 常務'
    ],
    correctIndex: 0,
    explanation: '一般的には会長が最上位、次いで社長、専務、常務の順になります（※企業の組織体制により例外はあります）。'
  },
  {
    id: 'manners11',
    category: 'manners',
    scenario: 'ビジネスメール',
    question: '一般的な業務の手順やスケジュールをメールで教えてもらいたいとき、結びの言葉として最も適切なものはどれですか？',
    options: ['ご教授ください。', 'ご教示ください。', 'ご指示を仰ぎます。', 'ご勉強させてください。'],
    correctIndex: 1,
    explanation: '「ご教示（きょうじ）」は仕事の手順や情報を教えてもらう際に使います。「ご教授（きょうじゅ）」は専門的な学問や芸術・技術を長期間学ぶ場合に使います。'
  },
  {
    id: 'manners12',
    category: 'manners',
    scenario: '名刺交換',
    question: '名刺交換の際、相手から受け取った名刺の持ち方として適切なルールはどれですか？',
    options: [
      '相手の社のロゴが隠れるようにしっかりと持つ',
      '相手の氏名が隠れるように親指で押さえる',
      '文字やロゴが隠れないよう、余白部分（端の方）を両手で持つ',
      'どこを持ってもマナー違反にはならない'
    ],
    correctIndex: 2,
    explanation: '相手の名刺のロゴや氏名は、その人の顔や看板にあたるため、指で隠してしまわないよう余白部分を両手で持つのがマナーです。'
  },

  // ==========================================
  // --- 政治・行政 (governance) : gov3 〜 gov12 ---
  // ==========================================
  {
    id: 'gov3',
    category: 'governance',
    scenario: '憲法',
    question: '日本の国会において、憲法改正の発議を行うために必要な条件はどれですか？',
    options: [
      '衆参各議院でそれぞれ過半数の賛成',
      '衆参各議院でそれぞれ3分の1以上の賛成',
      '衆参各議院でそれぞれ3分の2以上の賛成',
      '衆参両院合同総会における全会一致'
    ],
    correctIndex: 2,
    explanation: '憲法改正の発議には、衆議院・参議院のそれぞれで「総議員の3分の2以上」の賛成が必要です。その後、国民投票が行われます。'
  },
  {
    id: 'gov4',
    category: 'governance',
    scenario: '選挙制度',
    question: '日本の国政選挙のうち、参議院議員の任期は何年ですか？',
    options: ['4年（途中解散あり）', '5年（途中解散なし）', '6年（途中解散なし）', '10年（途中解散あり）'],
    correctIndex: 2,
    explanation: '参議院議員の任期は6年で、解散はありません。なお、3年ごとに半数が改選されます。'
  },
  {
    id: 'gov5',
    category: 'governance',
    scenario: '三権分立',
    question: '日本の内閣総理大臣を指名（首班指名）するのはどこですか？',
    options: ['国民による直接投票', '天皇陛下', '国会', '最高裁判所'],
    correctIndex: 2,
    explanation: '内閣総理大臣は、国会議員の中から国会の議決によって指名されます（憲法第67条）。指名された後、天皇陛下によって任命されます。'
  },
  {
    id: 'gov6',
    category: 'governance',
    scenario: '司法',
    question: '最高裁判所の裁判官がその職にふさわしいかどうかを、国政選挙の際に国民が直接チェックする仕組みを何といいますか？',
    options: ['国民投票', '住民投票', '国民審査', '弾劾裁判'],
    correctIndex: 2,
    explanation: '衆議院議員総選挙と同時に行われる、最高裁判所裁判官の適性を国民が投票で判断する仕組みを「国民審査」といいます。'
  },
  {
    id: 'gov7',
    category: 'governance',
    scenario: '選挙制度',
    question: '衆議院議員の被選挙権（立候補できる年齢）は何歳からですか？',
    options: ['18歳以上', '20歳以上', '25歳以上', '30歳以上'],
    correctIndex: 2,
    explanation: '衆議院議員および市区町村長・地方議員の被選挙権は「25歳以上」です。参議院議員と都道府県知事は「30歳以上」となります。'
  },
  {
    id: 'gov8',
    category: 'governance',
    scenario: '行政組織',
    question: '日本の行政機関のトップ（閣僚）が集まり、政府の重要方針を決定する最高決定機関（会議）を何といいますか？',
    options: ['御前会議', '閣議', '役員会', '本会議'],
    correctIndex: 1,
    explanation: '内閣総理大臣と各省の大臣（国務大臣）が集まって政府の方針を決める会議を「閣議」といいます。原則として全会一致で決定されます。'
  },
  {
    id: 'gov9',
    category: 'governance',
    scenario: '行政制度',
    question: '国の収入や支出（予算の執行）が正しく行われているかをチェックし、決算を検査する、内閣から独立した独自の機関はどこですか？',
    options: ['日本銀行', '財務省', '会計検査院', '国税庁'],
    correctIndex: 2,
    explanation: '「会計検査院」は、国や政府関係機関の決算を厳しくチェックする、憲法上認められた独立の機関です。'
  },
  {
    id: 'gov10',
    category: 'governance',
    scenario: '地方自治',
    question: '日本の地方自治において、首長（知事・市町村長）と地方議会の議員をどちらも住民が直接選挙で選ぶ制度を何と呼びますか？',
    options: ['一元代表制', '二元代表制', '議院内閣制', '直接民主制'],
    correctIndex: 1,
    explanation: '首長（執行機関）と議会（立法機関）の双方を、住民の直接選挙という2つの異なるルートで選ぶため「二元代表制」と呼びます。'
  },
  {
    id: 'gov11',
    category: 'governance',
    scenario: '選挙制度',
    question: '選挙において、各選挙区の有権者数と議員定数の比率に偏りがあり、議員1人の当選に必要な票数に大きな差が生じる問題を何といいますか？',
    options: ['一票の格差', 'ゲリマンダー', '死票の問題', '無投票当選'],
    correctIndex: 0,
    explanation: '住んでいる場所によって投票の価値に差が出てしまう問題を「一票の格差」と呼び、法の下の平等に反するとして度々裁判となっています。'
  },
  {
    id: 'gov12',
    category: 'governance',
    scenario: '行政制度',
    question: '行政機関が特定の政策や規制を行う前に、案を公表して広く国民から意見や要望を募集する手続きを何といいますか？',
    options: ['世論調査', 'パブリック・コメント', 'インフォームド・コンセント', '住民説明会'],
    correctIndex: 1,
    explanation: '「パブリック・コメント（意見公募手続）」と呼ばれ、行政の透明性を確保するための重要な手続きです。'
  },

  // ==========================================
  // --- 気象 (weather) : weather3 〜 weather12 ---
  // ==========================================
  {
    id: 'weather3',
    category: 'weather',
    scenario: '雲の種類',
    question: '夏の強い日射などで強い上昇気流が発生した際、急発達してゲリラ豪雨や雷、雹（ひょう）をもたらす雲は何ですか？',
    options: ['巻雲', '積乱雲', '層雲', '高層雲'],
    correctIndex: 1,
    explanation: '「積乱雲（いわゆる入道雲）」は縦に大きく発達する雲で、短時間の激しい雨や落雷、突風を引き起こします。'
  },
  {
    id: 'weather4',
    category: 'weather',
    scenario: '台風の定義',
    question: '熱帯低気圧のうち、低気圧域内の最大風速が約何m/s以上になったものを「台風」と呼びますか？',
    options: ['約10m/s以上', '約17m/s以上', '約25m/s以上', '約33m/s以上'],
    correctIndex: 1,
    explanation: '日本の気象庁の定義では、最大風速が 17.2m/s（34ノット）以上になった熱帯低気圧を台風と呼びます。'
  },
  {
    id: 'weather5',
    category: 'weather',
    scenario: '気圧配置',
    question: '春や秋に、日本付近を交互に通過して、天気を周期的に（数日ごとに）変化させる気圧配置は何ですか？',
    options: ['西高東低', '南高北低', '移動性高気圧', '太平洋高気圧'],
    correctIndex: 2,
    explanation: '春と秋は「移動性高気圧」と「低気圧」が交互に日本の上空を西から東へ通り抜けるため、天気が数日周期で変わります。'
  },
  {
    id: 'weather6',
    category: 'weather',
    scenario: '天気予報の見方',
    question: '天気予報で「降水確率50%」と発表された場合、その正しい解釈はどれですか？',
    options: [
      '対象地域の面積の50%に雨が降る。',
      '対象時間（例えば6時間）のうち、半分の3時間だけ雨が降る。',
      '同じ気象条件が100回あった場合、およそ50回は雨が降る。',
      '雨の強さが豪雨の50%程度である。'
    ],
    correctIndex: 3, // ※プログラム上のインデックスは2（4択の3番目）
    explanation: '降水確率は雨の量や面積、時間ではなく、「雨が降るという現象の起こりやすさ（確率）」を表しています。'
  },
  {
    id: 'weather7',
    category: 'weather',
    scenario: '気象用語',
    question: '次々に発生した積乱雲が列をなし、同じ場所に数時間にわたって線状に留まることで、甚大な大雨災害を引き起こす気象現象を何といいますか？',
    options: ['線状降水帯', '熱雷', 'ヒートアイランド', '温暖前線'],
    correctIndex: 0,
    explanation: '近年豪雨災害の原因としてよく耳にする「線状降水帯」の説明です。狭い範囲に非常に強い雨を降らせ続けます。'
  },
  {
    id: 'weather8',
    category: 'weather',
    scenario: '天気予報の見方',
    question: '天気予報の用語において、「一時雨」と「時々雨」の違いで、「一時雨」の正しい降水時間はどれですか？',
    options: [
      '予報期間の4分の1未満の時間、連続して降る',
      '予報期間の2分の1未満の時間、断続的に降る',
      '予報期間の2分の1以上の時間、ずっと降る',
      '1時間だけピンポイントで降る'
    ],
    correctIndex: 0,
    explanation: '「一時雨」は予報期間の1/4未満の時間、連続して降ることを指します（「時々雨」は1/2未満の時間、断続的に降ること）。'
  },
  {
    id: 'weather9',
    category: 'weather',
    scenario: '海陸風',
    question: '晴れた日の海岸付近において、日中に「海から陸に向かって」吹く地表付近の風を何といいますか？',
    options: ['陸風', '海風', '季節風', '山風'],
    correctIndex: 1,
    explanation: '日中は太陽によって陸地の方が海より早く温まるため上昇気流が起き、それを補うように海から陸へ「海風（うみかぜ）」が吹きます（夜間は逆の陸風が吹きます）。'
  },
  {
    id: 'weather10',
    category: 'weather',
    scenario: '地震・震度',
    question: '日本国内の地震の揺れの大きさを表す「気象庁震度階級」は、全部で何段階に分かれていますか？',
    options: ['7段階', '10段階', '12段階', '制限なし'],
    correctIndex: 1,
    explanation: '震度0、1、2、3、4、5弱、5強、6弱、6強、7の「計10段階」に分かれています。最高ランクは震度7です。'
  },
  {
    id: 'weather11',
    category: 'weather',
    scenario: '気圧と風',
    question: '北半球において、低気圧の中心に向かって地表付近の風はどのように吹き込みますか？',
    options: [
      '時計回りに外側へ吹き出す',
      '反時計回りに中心へ吹き込む',
      '時計回りに中心へ吹き込む',
      '真っ直ぐ中心に向かって直線的に吹く'
    ],
    correctIndex: 1,
    explanation: '地球の自転による力（コリオリの力）の影響を受け、北半球の低気圧では「反時計回り」に風が中心へと吹き込みます。'
  },
  {
    id: 'weather12',
    category: 'weather',
    scenario: '光学現象',
    question: 'うすい雲がかかった際などに、太陽の周りに大きな虹のような光の輪が見える気象現象を何と呼びますか？',
    options: ['ハロー（暈）', 'オーロラ', '蜃気楼', '陽炎'],
    correctIndex: 0,
    explanation: '「ハロー（暈：かさ）」と呼ばれ、上空の薄い雲に含まれる氷の粒によって太陽の光が屈折することで発生します。天気が下り坂になるサインとも言われます。'
  },

  // ==========================================
  // --- 経済 (economy) : econ3 〜 econ12 ---
  // ==========================================
  {
    id: 'econ3',
    category: 'economy',
    scenario: '物価動向',
    question: '不況（景気後退）であるにもかかわらず、物価が持続的に上昇していくという、非常に厳しい経済状態を何といいますか？',
    options: ['インフレーション', 'デフレーション', 'スタグフレーション', 'リフレーション'],
    correctIndex: 2,
    explanation: '「Stagnation（停滞）」と「Inflation（インフレ）」を組み合わせた言葉で、「スタグフレーション」と呼びます。'
  },
  {
    id: 'econ4',
    category: 'economy',
    scenario: '経済指標',
    question: '国内で一定期間内に新しく生み出されたモノやサービスの付加価値の合計額を指す、国の経済規模を表す指標は何ですか？',
    options: ['GDP（国内総生産）', 'CPI（消費者物価指数）', 'GNP（国民総生産）', '日銀短観'],
    correctIndex: 0,
    explanation: '「Gross Domestic Product（国内総生産）」の略で、国の経済活動の大きさを測る最も代表的な指標です。'
  },
  {
    id: 'econ5',
    category: 'economy',
    scenario: '株式市場',
    question: '日本の株式市場の代表的な指標である「日経平均株価」は、東証プライム市場に上場する企業の中から何社を選出して算出されていますか？',
    options: ['100社', '225社', '400社', '500社'],
    correctIndex: 1,
    explanation: '日本経済新聞社が選定した、日本を代表する「225社」の株価をベースに算出されているため、「日経225」とも呼ばれます。'
  },
  {
    id: 'econ6',
    category: 'economy',
    scenario: '国際経済',
    question: '為替相場において、1ドル＝130円から1ドル＝150円に変化した場合、この現象を何と呼びますか？',
    options: ['円高・ドル安', '円安・ドル高', '円高・ドル高', '為替のデフレ化'],
    correctIndex: 1,
    explanation: '1ドルを手に入れるためにより多くの円が必要になった（円の価値が下がった）ため、「円安（ドル高）」といいます。'
  },
  {
    id: 'econ7',
    category: 'economy',
    scenario: '企業活動',
    question: '企業の社会的責任を意味し、利益追求だけでなく環境や地域社会へ配慮した企業活動を行うべきという考え方を表す略語はどれですか？',
    options: ['CEO', 'CSR', 'TOB', 'M&A'],
    correctIndex: 1,
    explanation: '「Corporate Social Responsibility」の略で、企業の社会的責任を指します（CEOは最高経営責任者、TOBは株式公開買付、M&Aは企業の合併・買収）。'
  },
  {
    id: 'econ8',
    category: 'economy',
    scenario: '投資・市場',
    question: '投資の格言やリスク管理において、「すべての卵を一つのカゴに盛るな」という言葉が表している最も重要な概念は何ですか？',
    options: ['レバレッジ投資', '短期集中投資', '分散投資', 'インサイダー取引'],
    correctIndex: 2,
    explanation: 'カゴが落ちたらすべての卵が割れてしまうリスクを避けるため、複数の異なる資産に資金を分けて投資する「分散投資」の重要性を説いた格言です。'
  },
  {
    id: 'econ9',
    category: 'economy',
    scenario: '労働経済',
    question: '働く意思と能力があり求職活動を行っているが、仕事に就けていない人が労働力人口に占める割合を示す指標を何といいますか？',
    options: ['有効求人倍率', '完全失業率', '労働力調査率', '就業人口率'],
    correctIndex: 1,
    explanation: '総務省が発表する指標で、「完全失業率」といいます（有効求人倍率は厚生労働省が発表する、ハローワークの求職者に対する求人数の割合です）。'
  },
  {
    id: 'econ10',
    category: 'economy',
    scenario: '金融市場',
    question: '債券や預金において、元本（元のお金）に対してだけでなく、それまでについた利息（利子）に対してもさらに利息がつく計算方法を何といいますか？',
    options: ['単利', '複利', '割引利回り', '固定金利'],
    correctIndex: 1,
    explanation: '利息が利息を生む計算方法を「複利（ふくり）」と呼び、長期間運用するほど資産が雪だるま式に増える効果（複利効果）があります。'
  },
  {
    id: 'econ11',
    category: 'economy',
    scenario: '税金',
    question: '日本の税金の中で、所得が上がるにつれて税率も段階的に高くなっていく課税方式（所得税などに採用）を何といいますか？',
    options: ['逆進課税', '固定課税', '累進課税', '一律課税'],
    correctIndex: 2,
    explanation: '貧富の格差を是正するため、収入の多い人ほど高い税率を課す仕組みを「累進課税（るいしんかぜい）」といいます（消費税などは逆に低所得者ほど負担感が重くなる「逆進性」があるとされます）。'
  },
  {
    id: 'econ12',
    category: 'economy',
    scenario: '市場構造',
    question: '特定の1社だけで市場の大部分のシェアを支配し、価格などを自由にコントロールできてしまう不完全競争の市場状態を何といいますか？',
    options: ['独占', '寡占', 'カルテル', '完全競争'],
    correctIndex: 0,
    explanation: '市場を1社が支配することを「独占」、少数（数社）で支配することを「寡占」といいます。これを防ぎ公正な取引を守るために「独占禁止法」が定められています。'
  },
  // ==========================================
  // --- 英語 (english) : eng13 〜 eng22 ---
  // ==========================================
  {
    id: 'eng13',
    category: 'english',
    scenario: 'ビジネス表現',
    question: '「〜を添付しました」とメールで伝える際、最もよく使われる単語はどれですか？',
    options: ['Connected', 'Linked', 'Attached', 'Joined'],
    correctIndex: 2,
    explanation: '「attached」は「添付された」を意味し、ビジネスメールで「Please find the attached file（添付ファイルをご確認ください）」などの形で非常によく使われます。'
  },
  {
    id: 'eng14',
    category: 'english',
    scenario: 'ビジネス表現',
    question: '取引先等へのメールで「ご査収ください（ご確認ください）」に相当する一般的なフレーズはどれですか？',
    options: ['Please look it.', 'Please review the details.', 'Please check out.', 'Please fix this.'],
    correctIndex: 1,
    explanation: '「review the details（詳細を確認・審査する）」や「review the attached document」などが、ビジネスで「ご査収」を表現する丁寧な言い回しです。'
  },
  {
    id: 'eng15',
    category: 'english',
    scenario: '略語',
    question: 'スケジュール表などで見かける「TBD」という略語の正しい意味はどれですか？',
    options: ['すでに決定済み', '後日決定（現在未定）', '締切間近', '中止決定'],
    correctIndex: 1,
    explanation: '「To Be Determined」の略で、「後ほど決定される（現時点では未定だが、追って決まる）」という意味で使われます。'
  },
  {
    id: 'eng16',
    category: 'english',
    scenario: 'ビジネス表現',
    question: '「競合他社（コンペティター）」を意味する英単語として正しいものはどれですか？',
    options: ['Colleague', 'Customer', 'Competitor', 'Client'],
    correctIndex: 2,
    explanation: '「competitor」が競合他社・競争相手を指します。「colleague」は同僚、「client/customer」は顧客を意味します。'
  },
  {
    id: 'eng17',
    category: 'english',
    scenario: '文法',
    question: '「I am looking forward to (  ) you soon.」の（ ）に入る適切な形はどれですか？',
    options: ['see', 'seeing', 'seen', 'saw'],
    correctIndex: 1,
    explanation: '「look forward to 〜」の「to」は前置詞であるため、後ろには名詞または動名詞（V-ing）が続きます。'
  },
  {
    id: 'eng18',
    category: 'english',
    scenario: 'ビジネス表現',
    question: '「（予定を）延期する」を意味するイディオム（熟語）として最も適切なものはどれですか？',
    options: ['Put off', 'Call off', 'Take off', 'Turn off'],
    correctIndex: 0,
    explanation: '「put off」はスケジュールなどを延期することを意味します。「call off」は中止（キャンセル）を意味するので混同に注意が必要です。'
  },
  {
    id: 'eng19',
    category: 'english',
    scenario: 'ビジネス表現',
    question: '書類などに記載されている "Confidential" という表記の正しい意味はどれですか？',
    options: ['一般公開用', '至急返信が必要', '機密（部外秘）', '記入見本'],
    correctIndex: 2,
    explanation: '「confidential」は機密、重要秘、部外秘を意味し、取り扱いに注意が必要な重要書類に付されるマークです。'
  },
  {
    id: 'eng20',
    category: 'english',
    scenario: 'ビジネスマナー',
    question: '初対面の相手に対して「お会いできて光栄です」と丁寧かつ洗練された形で伝える表現はどれですか？',
    options: ['Nice to meet you.', "It's a pleasure to meet you.", 'Good to see you.', 'How are you now?'],
    correctIndex: 1,
    explanation: '「Nice to meet you.」よりも、ビジネスやフォーマルな場では「It\'s a pleasure to meet you.」とする方がプロフェッショナルな印象を与えます。'
  },
  {
    id: 'eng21',
    category: 'english',
    scenario: 'ビジネス表現',
    question: 'プロジェクトがスケジュール通りに「順調に進んでいる」と言いたいとき、適切な表現はどれですか？',
    options: ['On track', 'Off track', 'By track', 'In track'],
    correctIndex: 0,
    explanation: '「on track」で軌道に乗っている、計画通り順調に進んでいる状態を表します。逆に遅れている場合は「off track」となります。'
  },
  {
    id: 'eng22',
    category: 'english',
    scenario: '文法',
    question: '「（製品などが）欠陥のない、完璧な」という意味を持つ形容詞はどれですか？',
    options: ['Flawless', 'Careless', 'Useless', 'Helpless'],
    correctIndex: 0,
    explanation: '「flaw」は傷や欠陥を意味し、接尾辞の「-less」がつくことで「欠陥のない、非の打ち所がない」という意味になります。'
  },

  // ==========================================
  // --- 漢字 (kanji) : kanji13 〜 kanji22 ---
  // ==========================================
  {
    id: 'kanji13',
    category: 'kanji',
    scenario: '語彙・読み',
    question: '下線部の読みとして正しいものはどれですか？「資料の不足分を<u>補填</u>する。」',
    options: ['ほてん', 'ほちょく', 'ほしん', 'ほぞん'],
    correctIndex: 0,
    explanation: '「補填」は「ほてん」と読み、欠けた部分を埋めて補うことを意味します。'
  },
  {
    id: 'kanji14',
    category: 'kanji',
    scenario: '語彙・漢字',
    question: '「あらかじめご了承のほどお願いいたします」の「あらかじめ」を漢字で書く際、正しいものはどれですか？',
    options: ['予め', '既め', '先め', '前め'],
    correctIndex: 0,
    explanation: '「あらかじめ」は「予め」と書きます。「予」には前もってという意味があります。'
  },
  {
    id: 'kanji15',
    category: 'kanji',
    scenario: '語彙・読み',
    question: '下線部の読みとして正しいものはどれですか？「彼らは他社の動向を<u>穿つ</u>ような見方をしている。」',
    options: ['うがつ', 'はなつ', 'ともなう', 'おこなう'],
    correctIndex: 0,
    explanation: '「穿つ」は「うがつ」と読み、物事の本質を深く掘り下げる、鋭く突くという意味を持ちます。'
  },
  {
    id: 'kanji16',
    category: 'kanji',
    scenario: '対義語',
    question: '物事の本質や核心を突いた発言を意味する「的を射る（まとをいる）」の対義語として、正しい表現はどれですか？',
    options: ['的を外す', '的を失う', '的外れ', '的違い'],
    correctIndex: 2,
    explanation: '要点を外していることを意味する正しい表記は「的外れ（まとはずれ）」です。'
  },
  {
    id: 'kanji17',
    category: 'kanji',
    scenario: '語彙・読み',
    question: '下線部の読みとして正しいものはどれですか？「社長の話は非常に<u>示唆</u>に富んでいた。」',
    options: ['じじ', 'しさ', 'じさ', 'しき'],
    correctIndex: 1,
    explanation: '「示唆」は「しさ」と読み、それとなく物事を教えたり、ヒントを与えたりすることを意味します。'
  },
  {
    id: 'kanji18',
    category: 'kanji',
    scenario: '語彙・漢字',
    question: '「円滑に業務を進める」の「えんかつ」の漢字表記として正しいものはどれですか？',
    options: ['円骨', '縁活', '沿滑', '円滑'],
    correctIndex: 3,
    explanation: '物事が滞りなく滑らかに進む様子を「円滑（えんかつ）」と書きます。'
  },
  {
    id: 'kanji19',
    category: 'kanji',
    scenario: '誤用しやすい言葉',
    question: '「独擅場」という言葉の、本来の正しい読み方はどれですか？',
    options: ['どくだんじょう', 'どくせんじょう', 'とくだんじょう', 'とくせんじょう'],
    correctIndex: 1,
    explanation: '本来の正しい読み方は「どくせんじょう」です。のちに「擅」が「壇」と誤認され「どくだんじょう」という読みが生まれ、現在ではどちらも定着しています。'
  },
  {
    id: 'kanji20',
    category: 'kanji',
    scenario: '語彙・読み',
    question: '下線部の読みとして正しいものはどれですか？「新商品の開発に<u>尽力</u>する。」',
    options: ['じんりょく', 'つくちから', 'きくりょく', 'しんりょく'],
    correctIndex: 0,
    explanation: '「尽力」は「じんりょく」と読み、ある目的のために力を尽くすことを意味します。'
  },
  {
    id: 'kanji21',
    category: 'kanji',
    scenario: '同音異義語',
    question: '「プロジェクトの全容を<u>ハアク</u>する」のハアクの正しい漢字はどれですか？',
    options: ['波悪', '派握', '把握', '破確'],
    correctIndex: 2,
    explanation: '物事をしっかりと理解し、自分のものにすることを「把握（ハアク）」と書きます。'
  },
  {
    id: 'kanji22',
    category: 'kanji',
    scenario: '語彙・読み',
    question: '下線部の読みとして正しいものはどれですか？「今回のトラブルは、事前の対策で<u>未然</u>に防げたはずだ。」',
    options: ['みぜん', 'いまぜん', 'いましか', 'みねん'],
    correctIndex: 0,
    explanation: '「未然」は「みぜん」と読み、まだその事が起こらないうち、という意味になります。'
  },

  // ==========================================
  // --- ビジネスマナー (manners) : manners13 〜 manners22 ---
  // ==========================================
  {
    id: 'manners13',
    category: 'manners',
    scenario: '敬語・会話',
    question: '上司や取引先に仕事の成果を褒められた際、謙虚かつ適切に返す言葉はどれですか？',
    options: [
      'とんでもございません、実力です。',
      'おかげさまで、チーム一同の励みになります。',
      'それほどでもあります。',
      '当然の結果だと思っております。'
    ],
    correctIndex: 1,
    explanation: '周囲への感謝（おかげさまで）を示しつつ、前向きに受け止めるフレーズが最も好印象を与えます。'
  },
  {
    id: 'manners14',
    category: 'manners',
    scenario: '贈答マナー',
    question: '取引先に手土産（お菓子など）を渡す際、現在ビジネスシーンで最も好まれる添え言葉はどれですか？',
    options: [
      'つまらないものですが、お受け取りください。',
      '心ばかりの品ですが、皆様でお召し上がりください。',
      '私の大好物ですので、ぜひ食べてください。',
      '非常に高価なものですので、お口に合うか分かりません。'
    ],
    correctIndex: 1,
    explanation: '「つまらないものですが」も間違いではありませんが、最近は「心ばかりの品ですが」「皆様でお召し上がりください」といった肯定的な表現が好まれます。'
  },
  {
    id: 'manners15',
    category: 'manners',
    scenario: '電話応対',
    question: '取引先から電話があったが、担当者が席を外している場合、保留前の対応として適切なのはどれですか？',
    options: [
      '「今いませんので、明日かけ直してください」と伝える。',
      '「あいにく席を外しております。戻りましたら折り返しお電話差し上げましょうか？」と提案する。',
      '「どこへ行ったか分かりません」と正直に言う。',
      '無言で保留ボタンを押す。'
    ],
    correctIndex: 1,
    explanation: '不在の理由を簡潔に伝え（詳細な理由は不要）、こちらから折り返す提案をするのが基本ルールです。'
  },
  {
    id: 'manners16',
    category: 'manners',
    scenario: 'ビジネスメール',
    question: 'メールで急ぎの対応を依頼する際、相手を急かしすぎず不快感を与えないクッション言葉はどれですか？',
    options: [
      '「大至急、今すぐ確認してください」',
      '「大変恐縮ではございますが、○日までにご確認いただけますと幸いです」',
      '「遅れると困りますので早めにお願いします」',
      '「確認を強制するものではありません」'
    ],
    correctIndex: 1,
    explanation: '「大変恐縮ではございますが」というクッション言葉と「〜いただけますと幸いです」という依頼形を使うことで、礼儀正しく期日を伝えられます。'
  },
  {
    id: 'manners17',
    category: 'manners',
    scenario: '社内マナー',
    question: '進行中の会議に、やむを得ない理由で遅れて入室する際のマナーとして適切なのはどれですか？',
    options: [
      'ドアを大きく開けて「遅れてすみません！」と大声で謝りながら入る。',
      '無言でこっそり忍び込み、何事もなかったかのように座る。',
      '軽く会釈をし、できるだけ音を立てずに静かに入室し、空いている席に座る。',
      '入室したその場で、全員に向かって遅刻の理由を詳しく1分間説明する。'
    ],
    correctIndex: 2,
    explanation: '進行している会議の邪魔をしないよう、軽く会釈をして物音を立てずに静かに入室するのが鉄則です。理由は会議終了後などに個別に伝えます。'
  },
  {
    id: 'manners18',
    category: 'manners',
    scenario: '冠婚葬祭',
    question: 'ビジネス関係の葬儀（通夜・告別式）に参列する際、お悔やみの言葉として避けるべき「忌み言葉」はどれですか？',
    options: ['「たびたび」', '「重ね重ね」', '「ますます」', '上記すべて'],
    correctIndex: 3,
    explanation: '「たびたび」「重ね重ね」「ますます」などの重ね言葉は、不幸が繰り返されることを連想させるため、弔事ではすべて「忌み言葉」として避ける必要があります。'
  },
  {
    id: 'manners19',
    category: 'manners',
    scenario: '敬語・間違い探し',
    question: '社外の人から「〇〇部長はいらっしゃいますか？」と電話で問われた際の、自社の対応として正しいものはどれですか？',
    options: [
      '「〇〇部長はただいま外出しております。」',
      '「部長の〇〇はただいま外出されております。」',
      '「部長の〇〇はただいま外出しております。」',
      '「〇〇はただいま外出していらっしゃいます。」'
    ],
    correctIndex: 2,
    explanation: '外部の人に対して身内の人間を呼ぶときは、役職名ではなく氏名を呼び捨て（あるいは「部長の〇〇」）にし、尊敬語（いらっしゃる・される）は使わず謙譲・丁寧語を使います。'
  },
  {
    id: 'manners20',
    category: 'manners',
    scenario: '身だしなみ',
    question: 'ビジネスシーンにおける「オフィスカジュアル」の一般的な考え方として、最も適切なものはどれですか？',
    options: [
      '休日と同じ服であれば何でも良い。',
      'スーツを着る必要はないが、ジャケットや襟付きシャツなど、来客対応ができる清潔感のある服装。',
      'スポーツウェアやサンダルでも派手でなければ問題ない。',
      '必ずネクタイを着用しなければならない。'
    ],
    correctIndex: 1,
    explanation: 'オフィスカジュアルは「急な来客や取引先との対面でも不快感を与えない、清潔感とフォーマル感を残した服装」が基本です。'
  },
  {
    id: 'manners21',
    category: 'manners',
    scenario: '文書マナー',
    question: '他社に送るビジネス文書（送付状など）の宛名において、「御中」と「様」の正しい使い分けはどれですか？',
    options: [
      '個人名には「御中」、組織・部署名には「様」を使う。',
      '組織・部署名には「御中」、個人名には「様」を使う。',
      'どちらも完全に同じ意味なので、どちらを使っても良い。',
      '「〇〇株式会社 御中 〇〇様」のように併用するのが最も丁寧である。'
    ],
    correctIndex: 1,
    explanation: '会社や部署などの団体宛には「御中」、特定の個人宛には「様」を使います。これらを「御中 〇〇様」のように併用するのは間違いです。'
  },
  {
    id: 'manners22',
    category: 'manners',
    scenario: '来客応対',
    question: '自社に迎え入れたお客様をお見送りする際、エレベーター前での正しいマナーはどれですか？',
    options: [
      'エレベーターのボタンを押し、ドアが開いたら先にお客様を乗せてから自分は見送る。ドアが閉まるまでお辞儀を続ける。',
      'お客様をエレベーターの前まで案内したら、そこで「失礼します」と握手をして自席に戻る。',
      'エレベーターには案内せず、応接室の出口で見送るのが基本である。',
      'お客様より先に自分がエレベーターに乗り込み、上まで見送る。'
    ],
    correctIndex: 0,
    explanation: 'エレベーター前で見送る際は、自分でボタンを押してドアを開け、お客様を中に誘導します。そしてドアが完全に閉まるまで深くお辞儀（見送り礼）を続けるのがマナーです。'
  },

  // ==========================================
  // --- 政治・行政 (governance) : gov13 〜 gov22 ---
  // ==========================================
  {
    id: 'gov13',
    category: 'governance',
    scenario: '行政制度',
    question: '行政機関が保有する情報の公開を、国民が求めることができる法律および制度を何といいますか？',
    options: ['個人情報保護制度', '情報公開制度', '秘密保持制度', '公文書管理制度'],
    correctIndex: 1,
    explanation: '「情報公開制度（情報公開法）」により、国や地方自治体の行政文書を広く一般に開示請求することができます。'
  },
  {
    id: 'gov14',
    category: 'governance',
    scenario: '国家組織',
    question: '日本の国家公務員の人事管理（採用試験の実施や給与の勧告など）を担当し、人事の公平性と中立性を担保する独立した機関はどこですか？',
    options: ['人事院', '総務省', '内閣法制局', '内閣人事局'],
    correctIndex: 0,
    explanation: '「人事院」は、国家公務員の人事行政の公正を期するために内閣から独立して設置されている機関です。'
  },
  {
    id: 'gov15',
    category: 'governance',
    scenario: '行政法律',
    question: '行政処分や手続きにおいて、不透明な運用の防止や、国民の権利利益の保護、公平性の確保を目的に定められた法律は何ですか？',
    options: ['行政手続法', '地方自治法', '国家公務員法', '国家戦略特区法'],
    correctIndex: 0,
    explanation: '「行政手続法」は、許認可などの行政手続きの基準を明確にし、透明性を高めるための法律です。'
  },
  {
    id: 'gov16',
    category: 'governance',
    scenario: '国際組織',
    question: '国際連合（UN）の「安全保障理事会」において、重要事項の決定に対する拒否権を持つ「常任理事国」の数はいくつですか？',
    options: ['3カ国', '5カ国', '7カ国', '10カ国'],
    correctIndex: 1,
    explanation: '常任理事国は、アメリカ、イギリス、フランス、ロシア、中国の「5カ国」です。これらの国が1カ国でも反対（拒否権を行使）すると決議は成立しません。'
  },
  {
    id: 'gov17',
    category: 'governance',
    scenario: '国会制度',
    question: '国会に提出された法律案が、正式に法律として成立するために原則として必要なプロセスはどれですか？',
    options: [
      '内閣総理大臣の単独承認を得ること',
      '衆議院と参議院の両議院で可決されること',
      '最高裁判所長官の署名を得ること',
      '国民投票で過半数の賛成を得ること'
    ],
    correctIndex: 1,
    explanation: '憲法第59条により、法律案は衆議院および参議院の両議院で可決したときに法律となります（衆議院の優越規定など一部例外はあります）。'
  },
  {
    id: 'gov18',
    category: 'governance',
    scenario: '三権分立',
    question: '日本の司法組織において、最高裁判所のトップである「最高裁判所長官」を【指名】するのはどこの機関ですか？',
    options: ['国会', '内閣', '天皇', '裁判官会議'],
    correctIndex: 1,
    explanation: '最高裁判所長官は、「内閣が指名」し、その指名に基づいて「天皇が任命」します（国会が指名するのは内閣総理大臣です）。'
  },
  {
    id: 'gov19',
    category: 'governance',
    scenario: '政治・野党',
    question: '野党が政権奪取に備えてあらかじめ組織しておく、各省の大臣に対応する政策担当者からなる「影の内閣」を何と呼びますか？',
    options: ['シャドウ・キャビネット', 'バックアップ・チーム', 'セカンド・ユニット', 'ゴースト・パネル'],
    correctIndex: 0,
    explanation: 'イギリスの発祥で、政権交代が起きた際に即座に政権運営ができるよう野党側が組織する体制を「シャドウ・キャビネット（影の内閣）」と呼びます。'
  },
  {
    id: 'gov20',
    category: 'governance',
    scenario: '地方自治',
    question: '日本の地方税（都道府県や市区町村が直接徴収する税金）の例として、正しいものはどれですか？',
    options: ['消費税', '所得税', '個人住民税', '贈与税'],
    correctIndex: 2,
    explanation: '住民税（個人都道府県民税・個人市区町村民税）は、地方自治体の行政サービスを支える代表的な地方税です（所得税や消費税、贈与税は国税です）。'
  },
  {
    id: 'gov21',
    category: 'governance',
    scenario: '行政制度',
    question: '行政機関や大企業の不祥事において、内部の人間が違法行為などを通報した際、解雇や降格などの不利益な扱いを受けないよう保護する法律は何ですか？',
    options: ['個人情報保護法', '公益通報者保護法', '労働基準法', '不正競争防止法'],
    correctIndex: 1,
    explanation: '「公益通報者保護法」により、組織の不正を内部告発した労働者が不当な処分を受けないよう国が保護しています。'
  },
  {
    id: 'gov22',
    category: 'governance',
    scenario: '国会',
    question: '国会において、衆議院が解散されたときから「何日以内」に衆議院議員総選挙を行わなければならないと憲法で定められていますか？',
    options: ['30日以内', '40日以内', '50日以内', '60日以内'],
    correctIndex: 1,
    explanation: '憲法第54条に基づき、衆議院が解散されたときは、解散の日から「40日以内」に総選挙を行い、選挙の日から「30日以内」に特別国会を召集しなければなりません。'
  },

  // ==========================================
  // --- 気象 (weather) : weather13 〜 weather22 ---
  // ==========================================
  {
    id: 'weather13',
    category: 'weather',
    scenario: '異常気象',
    question: '南米ペルー沖の赤道付近で、海面水温が平年より低くなり、日本を含めた世界中の気候に影響を及ぼす気象現象を何といいますか？',
    options: ['エルニーニョ現象', 'ラニーニャ現象', 'ヒートアイランド現象', 'ダイポールモード現象'],
    correctIndex: 1,
    explanation: '海面水温が平年より高くなるのが「エルニーニョ現象」、逆に低くなるのが「ラニーニャ現象」です。日本に猛暑や厳冬をもたらす傾向があります。'
  },
  {
    id: 'weather14',
    category: 'weather',
    scenario: '雲の分類',
    question: '世界気象機関（WMO）などの基準において、空に見られる雲の種類は「基本雲形」としていくつのパターンに分類されていますか？',
    options: ['5種類', '10種類', '12種類', '20種類'],
    correctIndex: 1,
    explanation: '巻雲、巻積雲、巻層雲、高積雲、高層雲、乱層雲、層積雲、層雲、積雲、積乱雲の「十種雲形（10種類）」に分類されています。'
  },
  {
    id: 'weather15',
    category: 'weather',
    scenario: '台風の性質',
    question: '北半球において、日本に接近する台風の進路の「東側（右側）」は、西側（左側）と比べて風が強くなりやすい性質があります。この右側の領域を何と呼びますか？',
    options: ['安全半円', '可航半円', '危険半円', '中心眼'],
    correctIndex: 2,
    explanation: '台風自身の風の向きと、台風を動かす上空の偏西風などの向きが重なり合って風速が増すため、進路の右側は「危険半円」と呼ばれます（左側は可航半円）。'
  },
  {
    id: 'weather16',
    category: 'weather',
    scenario: '光学現象',
    question: '強い日差しによって地表付近の空気が温められ、密度が変わることで、遠くの景色がゆらゆらと揺れて見える現象を何といいますか？',
    options: ['蜃気楼', '陽炎（かげろう）', 'ブロッケン現象', '逆転層'],
    correctIndex: 1,
    explanation: '地表が熱せられることで光の屈折が起こり、空気がゆらめいて見える現象を「陽炎（かげろう）」といいます。'
  },
  {
    id: 'weather17',
    category: 'weather',
    scenario: '梅雨のメカニズム',
    question: '初夏に日本の南側に居座る、暖かく湿った「小笠原気団」と、北側の冷たい「オホーツク海気団」が衝突することで形成される前線は何ですか？',
    options: ['温暖前線', '寒冷前線', '停滞前線（梅雨前線）', '閉塞前線'],
    correctIndex: 2,
    explanation: '勢力の拮抗した2つの気団がぶつかることで動きの遅い「停滞前線」ができ、これが日本列島に長雨をもたらす「梅雨前線」となります。'
  },
  {
    id: 'weather18',
    category: 'weather',
    scenario: '気象災害',
    question: '山を越えた風が、斜面を吹き降りる際に乾燥して急激に高温になり、麓の地域に猛暑や乾燥をもたらす現象を何といいますか？',
    options: ['フェーン現象', 'エルニーニョ現象', 'ダウンバースト', 'ヒートアイランド現象'],
    correctIndex: 0,
    explanation: '「フェーン現象」と呼ばれ、日本海側などで夏季に記録的な高温や大火災のリスクを高める原因となります。'
  },
  {
    id: 'weather19',
    category: 'weather',
    scenario: '大気構造',
    question: '地上から上空に向かうにつれて通常は気温が下がりますが、逆に上空の方が気温が高くなっている、大気が非常に安定した空気の層を何といいますか？',
    options: ['対流圏', '成層圏', '逆転層', '高気圧層'],
    correctIndex: 2,
    explanation: '通常とは上下の温度関係が逆転しているため「逆転層」と呼ばれます。上昇気流が起きにくくなるため、霧や大気汚染物質が地上付近に溜まりやすくなります。'
  },
  {
    id: 'weather20',
    category: 'weather',
    scenario: '気象観測',
    question: '日本において、雨量や気温、風向・風速、日照時間などを全国約1300ヶ所で自動観測している、気象庁のシステム（地域気象観測システム）の略称は何ですか？',
    options: ['AMeDAS（アメダス）', 'GPS', 'ひまわり', 'RADAR'],
    correctIndex: 0,
    explanation: '「Automated Meteorological Data Acquisition System」の略で、「AMeDAS（アメダス）」と呼ばれ、リアルタイムの天候監視に不可欠な網の目状の観測網です。'
  },
  {
    id: 'weather21',
    category: 'weather',
    scenario: '気圧配置',
    question: '日本の「夏」における代表的な気圧配置の特徴として、正しい説明はどれですか？',
    options: ['西高東低', '南高北低（または南東高北西低）', '北高南低', '移動性高気圧の連続'],
    correctIndex: 1,
    explanation: '夏は日本の南東にある「太平洋高気圧」が強まり、北西側に低気圧が配置されるため「南高北低」型の気圧配置になり、蒸し暑い晴天が続きます（西高東低は冬です）。'
  },
  {
    id: 'weather22',
    category: 'weather',
    scenario: '台風の定義',
    question: '台風の中心にある、雲がなく風も比較的弱い、すり鉢状に晴れ上がった領域を何と呼びますか？',
    options: ['台風の目', '危険半円', '熱帯低気圧域', '中心核'],
    correctIndex: 0,
    explanation: '非常に強い遠心力などの影響で、台風の中心部には強い下降気流が生じ、雲が消えて風が弱まる「台風の目（眼）」が形成されます。'
  },

  // ==========================================
  // --- 経済 (economy) : econ13 〜 econ22 ---
  // ==========================================
  {
    id: 'econ13',
    category: 'economy',
    scenario: '国際取引',
    question: '国際規格の一種で、企業などの「品質マネジメントシステム」や「環境マネジメント」に関する国際標準化機構が定める規格を何といいますか？',
    options: ['ISO', 'WTO', 'IMF', 'OECD'],
    correctIndex: 0,
    explanation: '「ISO（国際標準化機構）」が定める規格（ISO 9001やISO 14001など）は、行政や企業の信頼性を測る世界基準となっています。'
  },
  {
    id: 'econ14',
    category: 'economy',
    scenario: '税金・制度',
    question: '応援したい自治体に寄附をすることで、自己負担額2,000円を除いた金額が所得税や個人住民税から控除され、返礼品も受け取れる制度は何ですか？',
    options: ['ふるさと納税', 'NISA', 'iDeCo', '地方交付税'],
    correctIndex: 0,
    explanation: '「ふるさと納税」は、地方格差の是正や地域活性化を目的として導入された、実質的な地方自治体への寄附金控除制度です。'
  },
  {
    id: 'econ15',
    category: 'economy',
    scenario: '経済法・独占',
    question: '市場における公正かつ自由な競争を促すため、企業間のカルテルや独占的な価格支配を禁止している、日本の代表的な経済法は何ですか？',
    options: ['商法', '会社法', '独占禁止法', '不正競争防止法'],
    correctIndex: 2,
    explanation: '「独占禁止法（私的独占の禁止及び公正取引の確保に関する法律）」を運用するため、独立した行政委員会である「公正取引委員会」が設置されています。'
  },
  {
    id: 'econ16',
    category: 'economy',
    scenario: 'マクロ経済',
    question: '景気の現状や先行きを把握するため、内閣府が毎月公表する、生産や雇用など複数の景気指標を合成して作られた指標を何といいますか？',
    options: ['景気動向指数（CI・DI）', '日銀短観', 'GDP', '消費者物価指数'],
    correctIndex: 0,
    explanation: '「景気動向指数」は、景気に対して先行・一致・遅行する指標を統合したもので、政府の景気判断のベースになります（日銀短観は日本銀行が企業へアンケート調査するものです）。'
  },
  {
    id: 'econ17',
    category: 'economy',
    scenario: '金融知識',
    question: '日本の個人投資家向けの少額投資非課税制度で、株式や投資信託の運用益・配当金が非課税になる制度の略称は何ですか？',
    options: ['NISA（ニーサ）', 'iDeCo（イデコ）', 'REIT（リート）', 'ETF'],
    correctIndex: 0,
    explanation: '「NISA（少額投資非課税制度）」の説明です。「iDeCo」は個人型確定拠出年金のことで、老後資金のための積立制度です。'
  },
  {
    id: 'econ18',
    category: 'economy',
    scenario: '金融・中央銀行',
    question: '日本銀行が市場の国債などを買い取ることで、世の中に出回る通貨の量を増やし、金利を低下させて景気を刺激しようとする金融政策を何といいますか？',
    options: ['利上げ（引き締め政策）', '買いオペレーション（金融緩和）', '売りオペレーション', '増税政策'],
    correctIndex: 1,
    explanation: '日銀が市場から債券を買い入れることを「買いオペ（公開市場操作）」と呼び、世の中のお金の流通量を増やす強力な金融緩和策の一環です。'
  },
  {
    id: 'econ19',
    category: 'economy',
    scenario: '国際経済',
    question: '国の国際的な稼ぎを表す指標で、貿易の損益だけでなく、サービス、海外投資による配当・利息の受け取りなどを総合した収支を何といいますか？',
    options: ['貿易収支', '経常収支', '財政黒字', '資本収支'],
    correctIndex: 1,
    explanation: '「経常収支」は、貿易・サービス収支、第一次所得収支（配当や利息）、第二次所得収支をすべて合わせた、国の総合的な国際収支を示します。'
  },
  {
    id: 'econ20',
    category: 'economy',
    scenario: '労働経済',
    question: '正社員ではない、パートやアルバイト、契約社員、派遣社員などの雇用形態を総称して何と呼びますか？',
    options: ['非正規雇用', '正規雇用', 'フリーランス', 'ワークシェアリング'],
    correctIndex: 0,
    explanation: 'これらは「非正規雇用」と呼ばれ、労働市場の柔軟性を生む一方で、雇用の安定性や待遇格差が社会問題として議論され続けています。'
  },
  {
    id: 'econ21',
    category: 'economy',
    scenario: '金融市場',
    question: '市場で急激な株価の大暴落や混乱が起きた際、投資家のパニックを防ぐために、取引所のシステムが自動的に株式取引を一時中断させる措置を何といいますか？',
    options: ['サーキット・ブレーカー', 'インサイダー取引規制', '空売り規制', 'デッドロック'],
    correctIndex: 0,
    explanation: '電気の安全装置（ブレーカー）に例えて「サーキット・ブレーカー」と呼び、冷徹な取引停止期間を設けることで市場の過熱や連鎖暴落を抑えます。'
  },
  {
    id: 'econ22',
    category: 'economy',
    scenario: '経済思想・市場',
    question: '経済学の父とされるアダム・スミスが提唱した、市場で個人の自由な利益追求に任せれば、価格調整メカニズムによって社会全体の利益が最大化されるという概念を表現した比喩は何ですか？',
    options: ['神の見えざる手', '富の再分配', 'トリクルダウン', '比較生産費説'],
    correctIndex: 0,
    explanation: 'アダム・スミスが『国富論』の中で示した有名な概念で、市場の自動調節機能を「見えざる手（Invisible Hand）」と呼びました。'
  }
];

