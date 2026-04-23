// 4択クイズ1問分のデータ構造。
export interface Question {
  id: string;
  category: 'english' | 'kanji' | 'manners' | 'politics' | 'weather' | 'admin';
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
  politics: '政治',
  weather: '気象',
  admin: '行政',
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
    politics: 0,
    weather: 0,
    admin: 0,
    trivia: 0,
  },
  learningLog: [],
  knowledgeLevel: 0,
  triviaLogs: [],
  loginStreak: 0,
  lastLoginDate: '',
};

// 日替わり表示用の固定雑学データ。
export const STATIC_TRIVIA: Trivia[] = [
  {
    id: '1',
    category: '言葉の由来',
    title: '「サボる」の語源はフランス語',
    explanation: 'フランス語で「木靴」を意味する「サボ（sabot）」が語源です。労働者が木靴で機械を壊して仕事を妨害した「サボタージュ」が、日本語で「サボる」となりました。',
    doyaPoint: '「サボる」って実はフランス語由来なんだよ、という意外性。',
    starter: '最近仕事が忙しいけど、たまにはサボりたくなるよね。ところで「サボる」の語源って知ってる？',
    target: ['同僚', '友人'],
    date: '2024-04-15'
  },
  {
    id: '2',
    category: '生き物の不思議',
    title: 'パンダの指は実は7本ある？',
    explanation: 'パンダには5本の指のほかに、手首の骨が突き出した「第6の指」と、さらにもう一つの突起があります。これらを使って竹を上手に掴んでいます。',
    doyaPoint: '指の数という、誰もが知っている動物の意外な身体的特徴。',
    starter: 'パンダって可愛いよね。実は竹を食べるために、指が普通の動物より多いって知ってた？',
    target: ['家族', '友人'],
    date: '2024-04-16'
  },
  {
    id: '3',
    category: '食べ物・料理',
    title: 'イチゴの表面の粒々は「果実」',
    explanation: '私たちが果実だと思って食べている赤い部分は「花托（かたく）」という茎の変化したもので、表面の粒々一つひとつが独立した「果実（種子を包む部分）」です。',
    doyaPoint: '「食べている部分は実じゃない」という、身近な食べ物の衝撃の事実。',
    starter: 'イチゴが美味しい季節だね。実はイチゴの本当の「実」って、あのツブツブの方なんだよ。',
    target: ['家族', '同僚'],
    date: '2024-04-17'
  }
];

// QuizModule が参照する問題データ本体。
export const QUESTIONS: Question[] = [
  // --- 英語 ---
  {
    id: 'e1',
    category: 'english',
    scenario: '日常的なビジネス英語の文法。',
    question: '"I am looking forward to (  ) you soon." の（）に入る適切なものは？',
    options: ['see', 'saw', 'seeing', 'seen'],
    correctIndex: 2,
    explanation: 'look forward to の to は前置詞なので、後ろには動名詞（ing形）が来ます。'
  },
  {
    id: 'e2',
    category: 'english',
    scenario: 'ビジネスシーンでの返答。',
    question: '「承知いたしました」と伝える際、最も自然な表現はどれですか？',
    options: ['Certainly.', 'Maybe.', 'I don\'t know.', 'Welcome.'],
    correctIndex: 0,
    explanation: 'Certainly は「かしこまりました」「承知いたしました」という丁寧な肯定の返答です。'
  },
  {
    id: 'e3',
    category: 'english',
    scenario: 'ビジネス用語。',
    question: '「提出期限」を意味する単語はどれですか？',
    options: ['Baseline', 'Deadline', 'Guideline', 'Headline'],
    correctIndex: 1,
    explanation: 'Deadline は「締め切り」「提出期限」を意味します。'
  },
  {
    id: 'e4',
    category: 'english',
    scenario: '逆説の接続詞。',
    question: '"We decided to go on a picnic (  ) it was raining." の（）に入る適切なものは？',
    options: ['because', 'despite', 'although', 'unless'],
    correctIndex: 2,
    explanation: 'although は「〜だけれども」という逆説の接続詞です。despite は前置詞なので後ろに文（S+V）は来ません。'
  },
  {
    id: 'e5',
    category: 'english',
    scenario: 'ビジネスの挨拶。',
    question: '「〜によろしくお伝えください」という定番の挨拶はどれですか？',
    options: ['Please tell me your name.', 'Say hello to your boss for me.', 'Good luck with your job.', 'I\'m sorry to hear that.'],
    correctIndex: 1,
    explanation: 'Say hello to ... for me は「〜によろしくお伝えください」という定番の表現です。'
  },
  {
    id: 'e6',
    category: 'english',
    scenario: '会議用語。',
    question: '会議の「議題」を意味する英単語はどれですか？',
    options: ['Schedule', 'Agenda', 'Minute', 'Summary'],
    correctIndex: 1,
    explanation: 'Agenda は「議題」「協議事項」を意味します。Minute は「議事録」です。'
  },
  {
    id: 'e7',
    category: 'english',
    scenario: 'ビジネス略語。',
    question: '"ASAP" とはどういう意味ですか？',
    options: ['可能な限り早く', 'できるだけ安く', '準備が整い次第', 'おそらく'],
    correctIndex: 0,
    explanation: 'As Soon As Possible の略で、「可能な限り早く」という意味です。'
  },
  {
    id: 'e8',
    category: 'english',
    scenario: 'ビジネス表現。',
    question: '「出張に行く」の表現として正しいものはどれですか？',
    options: ['Go to a business trip', 'Go for a business trip', 'Go on a business trip', 'Go in a business trip'],
    correctIndex: 2,
    explanation: 'go on a trip で「旅行に行く」となります。出張の場合は go on a business trip です。'
  },
  {
    id: 'e9',
    category: 'english',
    scenario: '前置詞の使い分け。',
    question: '"This song reminds me (  ) my childhood." の（）に入る適切なものは？',
    options: ['in', 'with', 'of', 'to'],
    correctIndex: 2,
    explanation: 'remind A of B で「AにBを思い出させる」という重要熟語です。'
  },
  {
    id: 'e10',
    category: 'english',
    scenario: 'カジュアルな了解。',
    question: '仕事を引き受ける際の「承知いたしました（了解しました）」として、最もカジュアルなものはどれですか？',
    options: ['I understood.', 'Roger that.', 'Noted.', 'Understood.'],
    correctIndex: 1,
    explanation: 'Roger that はもともと無線用語ですが、ビジネスチャット等で「了解！」とカジュアルに伝える際に使われます。Noted は「了解しました（記録しました）」というニュアンスです。'
  },
  {
    id: 'e11',
    category: 'english',
    scenario: 'スペリング。',
    question: '「領収書」を意味する単語の綴りとして正しいものはどれですか？',
    options: ['Recipt', 'Receipt', 'Reseit', 'Reciept'],
    correctIndex: 1,
    explanation: 'Receipt（レシート）は p が入るのがスペリングのポイントです。'
  },
  {
    id: 'e12',
    category: 'english',
    scenario: '福利厚生。',
    question: '「有給休暇」を意味する表現はどれですか？',
    options: ['Paid holiday', 'Free vacation', 'Salary break', 'Money leave'],
    correctIndex: 0,
    explanation: 'Paid holiday や Paid leave で「有給休暇」を意味します。'
  },
  {
    id: 'e13',
    category: 'english',
    scenario: 'ビジネスメール。',
    question: 'ビジネスメールで「〜を添付しました」と伝える際によく使われる単語はどれですか？',
    options: ['Connected', 'Linked', 'Attached', 'Joined'],
    correctIndex: 2,
    explanation: 'Attached file（添付ファイル）のように、Attached が「添付された」という意味で使われます。'
  },
  // --- 漢字 ---
  {
    id: 'k1',
    category: 'kanji',
    scenario: '読み間違いやすい漢字。',
    question: '「重複」の正しい読み方は？',
    options: ['じゅうふく', 'ちょうふく', 'じゅうぶく', 'ちょうぷく'],
    correctIndex: 1,
    explanation: '本来は「ちょうふく」と読みます。現在は「じゅうふく」も慣用読みとして認められていますが、正式には「ちょうふく」です。'
  },
  {
    id: 'k2',
    category: 'kanji',
    scenario: '漢字の表記。',
    question: '「とどこおる」の漢字表記として正しいものはどれですか？',
    options: ['溜まる', '停まる', '滞る', '止まる'],
    correctIndex: 2,
    explanation: '「滞る（とどこおる）」は、物事が順調に進まない状態を指します。'
  },
  {
    id: 'k3',
    category: 'kanji',
    scenario: '四字熟語。',
    question: '意味が「物事の根本」である四字熟語を完成させてください。「〇〇工作」',
    options: ['根底', '土台', '根本', '根回'],
    correctIndex: 3,
    explanation: '「根回し（ねまわし）工作」などの文脈で使われますが、ここでは「根回し」が正解です。'
  },
  {
    id: 'k4',
    category: 'kanji',
    scenario: '読み間違いやすい漢字。',
    question: '「懸念」の正しい読み方は？',
    options: ['けいねん', 'けんねん', 'けねん', 'かねん'],
    correctIndex: 2,
    explanation: '「懸念（けねん）」は、気にかかって不安に思うこと、心配することを指します。'
  },
  {
    id: 'k5',
    category: 'kanji',
    scenario: '言葉の意味と漢字。',
    question: '「おもむろに」の正しい漢字と使い方はどれですか？',
    options: ['露に（急に動き出す）', '徐に（ゆっくりと動き出す）', '趣に（趣向を凝らす）', '凡に（平凡な様子）'],
    correctIndex: 1,
    explanation: '「徐に（おもむろに）」は、落ち着いてゆっくりと行動を起こす様子を指します。「急に」と誤解されやすい言葉です。'
  },
  {
    id: 'k6',
    category: 'kanji',
    scenario: '送り仮名の使い分け。',
    question: '「姿を見せる」という意味で、送り仮名が正しいものはどれですか？',
    options: ['表わす', '表す', '現わす', '現す'],
    correctIndex: 1,
    explanation: '「表す（あらわす）」は、感情や考えを外に出すことなどを指します。'
  },
  {
    id: 'k7',
    category: 'kanji',
    scenario: '同訓異義語。',
    question: '「役職に就く」の「つく」として正しい漢字はどれですか？',
    options: ['付く', '着く', '就く', '即く'],
    correctIndex: 2,
    explanation: '「就く（つく）」は、ある役職や地位に身を置く、仕事に従事することを指します。'
  },
  {
    id: 'k8',
    category: 'kanji',
    scenario: '慣用句の読み。',
    question: '「相手の琴線に触れる」の「琴線」の読み方は？',
    options: ['ことせん', 'きんせん', 'きんぜん', 'こんせん'],
    correctIndex: 1,
    explanation: '「琴線（きんせん）」と読みます。良いものに触れて感動することを指します。'
  },
  {
    id: 'k9',
    category: 'kanji',
    scenario: '読み間違いやすい漢字。',
    question: '「初々しい」の正しい読み方は？',
    options: ['はつはつしい', 'ういういしい', 'しょしょしい', 'なまなましい'],
    correctIndex: 1,
    explanation: '「初々しい（ういういしい）」は、若々しく、純真な様子を指します。'
  },
  {
    id: 'k10',
    category: 'kanji',
    scenario: '本来の読み。',
    question: '「独壇場」という言葉の、本来の正しい表記と読みは何ですか？',
    options: ['独段場（どくだんじょう）', '特壇場（とくだんじょう）', '独擅場（どくせんじょう）', '独善場（どくぜんじょう）'],
    correctIndex: 2,
    explanation: '本来は「独擅場（どくせんじょう）」でしたが、「擅」を「壇」と見間違えたことから「独壇場（どくだんじょう）」が広く使われるようになりました。'
  },
  {
    id: 'k11',
    category: 'kanji',
    scenario: '副詞の漢字。',
    question: '「あらかじめ」を漢字で書く際、正しいものはどれですか？',
    options: ['予め', '既め', '先め', '前め'],
    correctIndex: 0,
    explanation: '「予め（あらかじめ）」は、物事が起こる前に、前もって準備することを指します。'
  },
  {
    id: 'k12',
    category: 'kanji',
    scenario: '語彙力。',
    question: '「饒舌」の正しい読み方は？',
    options: ['ぎょうぜつ', 'じょうぜつ', 'びょうぜつ', 'れつぜつ'],
    correctIndex: 1,
    explanation: '「饒舌（じょうぜつ）」は、よくしゃべること、口数が多いことを指します。'
  },
  {
    id: 'k13',
    category: 'kanji',
    scenario: '常用漢字。',
    question: '「さまたげる」の漢字表記として正しいものはどれですか？',
    options: ['妨げる', '阻げる', '害げる', '拒げる'],
    correctIndex: 0,
    explanation: '「妨げる（さまたげる）」は、進行を邪魔することを指します。'
  },
  // --- ビジネスマナー ---
  {
    id: 'm1',
    category: 'manners',
    scenario: 'タクシーでの席次。',
    question: 'タクシー（運転手付き）において最も上座とされるのはどこですか？',
    options: ['助手席', '後部座席の右側（運転手の後ろ）', '後部座席の左側', '後部座席の中央'],
    correctIndex: 1,
    explanation: 'タクシーでは運転手の真後ろが最も安全で上座とされます。'
  },
  {
    id: 'm2',
    category: 'manners',
    scenario: '他社訪問時のマナー。',
    question: '他社を訪問した際、名刺を出すタイミングとして適切なのはいつですか？',
    options: ['挨拶をしてすぐ（着席前）', '相手が話し始めてから', '会議が終わって帰る間際', '相手にお茶が出された後'],
    correctIndex: 0,
    explanation: '名刺交換は、挨拶をしてすぐ、お互いに立った状態で行うのが基本です。'
  },
  {
    id: 'm3',
    category: 'manners',
    scenario: '敬語の使い分け。',
    question: '敬語の使い方として「正しい」ものはどれですか？',
    options: [
      '部長、どちらへ参られますか？',
      '外回りから戻られた田中社長がおっしゃっていました。',
      '担当の者に申し伝えます。',
      'どうぞ、お座りになられてください。'
    ],
    correctIndex: 2,
    explanation: '「申し伝える（もうしつたえる）」は謙譲語であり、社内の人間の行動を社外の人に伝える際に適切です。1は謙譲語と尊敬語の混同（参られる）、2は社内の人に尊敬語（おっしゃる）を使用、4は二重敬語（お座りになる＋られる）の誤りです。'
  },
  {
    id: 'm4',
    category: 'manners',
    scenario: '電話応対のマナー。',
    question: '電話応対で、相手の声が聞き取りにくい時のマナーとして適切なのは？',
    options: [
      '「声が小さいので、もっと大きな声でお願いします」',
      '「電話が遠いようですので、もう一度お伺いしてもよろしいでしょうか」',
      '「聞こえないので、かけ直してください」',
      'そのまま聞き流して、後でメールで確認する'
    ],
    correctIndex: 1,
    explanation: '相手のせいにせず「電話が遠い」と表現するのがクッション言葉としてのマナーです。'
  },
  {
    id: 'm5',
    category: 'manners',
    scenario: '冠婚葬祭のマナー。',
    question: 'お通夜に持参する香典袋の表書きとして適切なのは？',
    options: ['御祝', '御霊前', '御花料', '御見舞'],
    correctIndex: 1,
    explanation: '仏式のお通夜や告別式では「御霊前」とするのが一般的です（宗派により「御仏前」の場合もあります）。'
  },
  {
    id: 'm6',
    category: 'manners',
    scenario: '指示の受け方。',
    question: '上司に指示を受けた際、最初に行うべきことは何ですか？',
    options: [
      'すぐに作業に取り掛かる',
      '内容をメモし、最後に復唱して確認する',
      '自分のやり方で進めて、終わってから報告する',
      '同僚に内容を相談する'
    ],
    correctIndex: 1,
    explanation: '聞き間違いを防ぐため、メモを取り、最後に要点を復唱して確認することが重要です。'
  },
  {
    id: 'm7',
    category: 'manners',
    scenario: '訪問のマナー。',
    question: '訪問先でコートを脱ぐタイミングはいつが適切ですか？',
    options: ['建物に入る前', '建物に入ってすぐ（受付の前）', '応接室に通された後', '相手と対面した直後'],
    correctIndex: 0,
    explanation: 'コートは外の埃を室内に持ち込まないよう、建物に入る前に脱ぐのが正式なマナーです。'
  },
  {
    id: 'm8',
    category: 'manners',
    scenario: 'メールのマナー。',
    question: 'メールの件名として最も望ましいのはどれですか？',
    options: [
      'お世話になっております',
      '先日はありがとうございました',
      '【ご相談】10月定例会議の日程変更について',
      '田中よりご連絡です'
    ],
    correctIndex: 2,
    explanation: '件名だけで内容が推測できるよう、具体的かつ簡潔に記載するのがマナーです。'
  },
  {
    id: 'm9',
    category: 'manners',
    scenario: 'エレベーターの席次。',
    question: 'エレベーター内での立ち位置で、最も下座（若手や案内役が立つべき場所）はどこですか？',
    options: ['奥の右側（操作盤の前）', '奥の左側', '入り口付近の操作盤の前', '入り口付近の操作盤の反対側'],
    correctIndex: 2,
    explanation: 'エレベーターでは入り口付近の操作盤の前が下座とされ、若手や案内役がボタン操作を行います。'
  },
  {
    id: 'm10',
    category: 'manners',
    scenario: '職位の順。',
    question: '序列が高い順（役職が上）の並びとして正しいものはどれですか？',
    options: ['会長 ＞ 社長 ＞ 専務 ＞ 常務', '会長 ＞ 社長 ＞ 常務 ＞ 専務', '社長 ＞ 会長 ＞ 専務 ＞ 常務', '社長 ＞ 専務 ＞ 会長 ＞ 常務'],
    correctIndex: 0,
    explanation: '一般的な企業では、会長、社長、専務、常務の順で序列が決まっています。'
  },
  {
    id: 'm11',
    category: 'manners',
    scenario: '途中入室。',
    question: '進行中の会議に遅れて入室する際のマナーとして適切なのは？',
    options: [
      '大きな声で「失礼します！」と言って入る',
      '無言で素早く空いている席に座る',
      '軽く会釈をし、できるだけ音を立てずに入室する',
      '入室後、全員に向かって遅刻の理由を詳しく説明する'
    ],
    correctIndex: 2,
    explanation: '進行を妨げないよう、静かに会釈をして入室し、手近な席に座るのがマナーです。'
  },
  {
    id: 'm12',
    category: 'manners',
    scenario: '贈答の言葉。',
    question: '贈り物（手土産）を渡す際の言葉として、現在は「つまらないものですが」よりも好まれる表現はどれですか？',
    options: ['「お口に合うか分かりませんが」', '「心ばかりの品ですが」', '「私の好物ですので」', '「非常に高価なものですが」'],
    correctIndex: 1,
    explanation: '「つまらない」という謙遜すぎない「心ばかりの品ですが」や「お口に合えば嬉しいのですが」といった表現が好まれます。'
  },
  {
    id: 'm13',
    category: 'manners',
    scenario: '電話の取り次ぎ。',
    question: '取引先から電話がかかってきたが、担当者が外出している場合の対応として最も適切なのは？',
    options: [
      '「今いませんので、明日またかけてください」',
      '「外出しております。戻りましたらこちらからお電話差し上げましょうか？」',
      '「どこへ行ったか分かりません」',
      '「お急ぎでしたら携帯電話の番号をお教えします」'
    ],
    correctIndex: 1,
    explanation: '不在を伝え、折り返しの提案をするのが基本です。個人情報の観点から不用意に携帯番号を教えてはいけません。'
  },
  // --- 政治 ---
  {
    id: 'p1',
    category: 'politics',
    scenario: '衆議院の優越。',
    question: '日本の国会において、衆議院の優越が認められていないものはどれですか？',
    options: ['法律案の議決', '予算の議決', '条約の承認', '憲法改正の発議'],
    correctIndex: 3,
    explanation: '憲法改正の発議には、衆参両議院それぞれの3分の2以上の賛成が必要であり、衆議院の優越は認められません。'
  },
  {
    id: 'p2',
    category: 'politics',
    scenario: '参議院の任期。',
    question: '日本の選挙制度において、参議院議員の任期は何年ですか？',
    options: ['4年', '5年', '6年', '10年'],
    correctIndex: 2,
    explanation: '参議院議員の任期は6年で、3年ごとに半数が改選されます。'
  },
  {
    id: 'p3',
    category: 'politics',
    scenario: '三権分立。',
    question: '三権分立における「三権」の組み合わせとして正しいものはどれですか？',
    options: ['立法・行政・司法', '政治・経済・文化', '衆議院・参議院・内閣', '裁判所・警察・検察'],
    correctIndex: 0,
    explanation: '権力の集中を防ぐため、立法（国会）、行政（内閣）、司法（裁判所）の三権に分けられています。'
  },
  {
    id: 'p4',
    category: 'politics',
    scenario: '内閣総理大臣の指名。',
    question: '日本の総理大臣を指名するのはどこですか？',
    options: ['国民（直接投票）', '天皇陛下', '国会', '最高裁判所'],
    correctIndex: 2,
    explanation: '国会議員の中から国会の議決で指名されます（天皇陛下は任命を行います）。'
  },
  {
    id: 'p5',
    category: 'politics',
    scenario: '政権公約。',
    question: '選挙において、特定の政党が掲げる「公約（政権公約）」を何と呼びますか？',
    options: ['マニフェスト', 'プロトコル', 'プレスリリース', 'アジェンダ'],
    correctIndex: 0,
    explanation: '政権を担当した際に実施する具体的な政策や期限を明記したものをマニフェストと呼びます。'
  },
  {
    id: 'p6',
    category: 'politics',
    scenario: '地方自治の権利。',
    question: '地方自治体において、住民が条例の制定や改廃を求めることができる権利を何といいますか？',
    options: ['直接請求権', '拒否権', '統治権', '抵抗権'],
    correctIndex: 0,
    explanation: '住民が直接、政治に参加するための権利の一つで、署名を集めて請求することができます。'
  },
  {
    id: 'p7',
    category: 'politics',
    scenario: '最高裁判所のチェック。',
    question: '日本の最高裁判所の裁判官がふさわしいかどうか、国民が直接チェックする仕組みは何ですか？',
    options: ['国民投票', '住民投票', '国民審査', '弾劾裁判'],
    correctIndex: 2,
    explanation: '衆議院議員総選挙の際に行われる「最高裁判所裁判官国民審査」のことです。'
  },
  {
    id: 'p8',
    category: 'politics',
    scenario: '被選挙権。',
    question: '衆議院議員の被選挙権（立候補できる年齢）は何歳からですか？',
    options: ['18歳', '20歳', '25歳', '30歳'],
    correctIndex: 2,
    explanation: '衆議院議員と市区町村長は25歳以上、参議院議員と都道府県知事は30歳以上です。'
  },
  {
    id: 'p9',
    category: 'politics',
    scenario: '最高裁判所。',
    question: '日本の最高裁判所の長（最高裁判所長官）を指名するのは誰ですか？',
    options: ['国会', '内閣', '天皇', '前の長官'],
    correctIndex: 1,
    explanation: '最高裁判所長官は内閣が指名し、天皇が任命します（他の裁判官は内閣が任命します）。'
  },
  {
    id: 'p10',
    category: 'politics',
    scenario: '安全保障理事会。',
    question: '国際連合（UN）の安全保障理事会において、拒否権を持つ常任理事国の数はいくつですか？',
    options: ['3カ国', '5カ国', '7カ国', '10カ国'],
    correctIndex: 1,
    explanation: 'アメリカ、イギリス、フランス、ロシア、中国の5カ国です。'
  },
  {
    id: 'p11',
    category: 'politics',
    scenario: '地方自治。',
    question: '日本の地方自治における「二元代表制」とは、住民が何と何を直接選ぶことを指しますか？',
    options: ['知事（首長）と議会の議員', '与党と野党', '国会議員と地方議員', '裁判官と警察署長'],
    correctIndex: 0,
    explanation: '住民が首長と議員の両方を直接選ぶため、二元代表制と呼ばれます（国政は議院内閣制）。'
  },
  {
    id: 'p12',
    category: 'politics',
    scenario: '国会の役割。',
    question: '法律案が成立するために必要な工程はどれですか？',
    options: ['天皇の承認を得ること', '衆参両議院で可決されること', '最高裁判所の許可を得ること', '国民投票で過半数を得ること'],
    correctIndex: 1,
    explanation: '原則として衆参両議院で可決されることで法律が成立します。'
  },
  {
    id: 'p13',
    category: 'politics',
    scenario: '住民票と選挙。',
    question: '「一票の格差」とは何に関する問題ですか？',
    options: ['選挙権の年齢制限の差', '議員の報酬の差', '選挙区ごとの議員1人あたりの有権者数の差', '投票率の男女差'],
    correctIndex: 2,
    explanation: '選挙区によって議員1人を当選させるのに必要な票の数に差があることで、一票の重みが不平等になる問題です。'
  },
  // --- 気象 ---
  {
    id: 'w1',
    category: 'weather',
    scenario: '雲の種類。',
    question: '夏の暑い日に、上昇気流によって発生する、いわゆる「入道雲」は何ですか？',
    options: ['巻雲', '積乱雲', '層雲', '高層雲'],
    correctIndex: 1,
    explanation: '積乱雲（せきらんうん）は、強い上昇気流によって垂直方向に発達した雲で、激しい雨や雷をもたらします。'
  },
  {
    id: 'w2',
    category: 'weather',
    scenario: '台風の定義。',
    question: '台風の定義として正しいものは、最大風速が約何m/s以上になったものですか？',
    options: ['約10m/s', '約17m/s', '約25m/s', '約33m/s'],
    correctIndex: 1,
    explanation: '熱帯低気圧のうち、北西太平洋または南シナ海にあり、最大風速が17.2m/s以上になったものを台風と呼びます。'
  },
  {
    id: 'w3',
    category: 'weather',
    scenario: '気圧配置。',
    question: '春や秋に交互にやってきて天気を周期的に変える気圧配置は何ですか？',
    options: ['西高東低', '南高北低', '移動性高気圧', '太平洋高気圧'],
    correctIndex: 2,
    explanation: '移動性高気圧と低気圧が交互に通過するため、春や秋の天気は数日周期で変化します。'
  },
  {
    id: 'w4',
    category: 'weather',
    scenario: '冬の気象。',
    question: '冬の「西高東低」の気圧配置において、日本海側に雪を降らせる風はどこから吹きますか？',
    options: ['北東', '北西', '南東', '南西'],
    correctIndex: 1,
    explanation: 'シベリア高気圧から吹き出す冷たい北西の季節風が、日本海で水蒸気を補給して雪を降らせます。'
  },
  {
    id: 'w5',
    category: 'weather',
    scenario: '降水確率の定義。',
    question: '降水確率50%の意味として正しいものはどれですか？',
    options: [
      'その地域の面積の50%に雨が降る',
      'その時間の50%（30分間）だけ雨が降る',
      '同じ気象条件が100回あったら、50回は雨が降る',
      '雨の強さが最大値の50%である'
    ],
    correctIndex: 2,
    explanation: '降水確率は「雨の降る範囲」や「強さ」ではなく、あくまで「降るか降らないかの可能性」を示します。'
  },
  {
    id: 'w6',
    category: 'weather',
    scenario: '湿度の定義。',
    question: '湿度が100%の状態とはどのような状態ですか？',
    options: [
      '空気中の半分が水になっている',
      'その温度で空気が含むことのできる最大量の水蒸気を含んでいる',
      '水中で計測している',
      '雨が降っている時は必ず100%になる'
    ],
    correctIndex: 1,
    explanation: 'これを「飽和状態」と呼びます。これ以上水蒸気を含めなくなると、水滴（霧や雲）になります。'
  },
  {
    id: 'w7',
    category: 'weather',
    scenario: '集中豪雨の要因。',
    question: '「線状降水帯」の説明として正しいものはどれですか？',
    options: [
      '広い範囲に薄く広がる雲の集まり',
      '次々に発生した積乱雲が列をなし、同じ場所に大雨を降らせるもの',
      '海上で発生する巨大な渦巻き',
      '砂漠で見られる砂嵐の帯'
    ],
    correctIndex: 1,
    explanation: '積乱雲が線状に並び、数時間にわたってほぼ同じ場所に停滞することで甚大な被害をもたらします。'
  },
  {
    id: 'w8',
    category: 'weather',
    scenario: '夏の風。',
    question: '夏に太平洋高気圧に覆われることで吹く、蒸し暑い南寄りの風を何と呼びますか？',
    options: ['季節風', '貿易風', '偏西風', '卓越風'],
    correctIndex: 0,
    explanation: '季節によって決まった方向に吹く風を季節風（モノスーン）と呼びます。夏は南東、冬は北西から吹きます。'
  },
  {
    id: 'w9',
    category: 'weather',
    scenario: '光の現象。',
    question: '太陽の周りに虹のような光の輪が見える現象を何と呼びますか？',
    options: ['ハロー（暈）', 'オーロラ', '蜃気楼', 'ブロッケン現象'],
    correctIndex: 0,
    explanation: 'ハロー（日暈）は、雲の中の氷の粒で太陽光が屈折して見える現象で、天気が下り坂になるサインとされることもあります。'
  },
  {
    id: 'w10',
    category: 'weather',
    scenario: '天気用語。',
    question: '日本の天気予報で「一時雨」と言った場合、雨が降る時間は予報期間のどのくらいですか？',
    options: ['4分の1未満', '2分の1未満', '2分の1以上', 'ずっと'],
    correctIndex: 0,
    explanation: '「一時」は予報期間の4分の1未満、「時々」は2分の1未満の時間を指します。'
  },
  {
    id: 'w11',
    category: 'weather',
    scenario: '海陸風。',
    question: '海岸付近で、昼間に海から陸に向かって吹く風を何といいますか？',
    options: ['陸風', '海風', '季節風', '山風'],
    correctIndex: 1,
    explanation: '昼間は陸地の方が海より温まりやすいため、上昇気流が発生し海から陸へと風が吹きます。夜は逆になります。'
  },
  {
    id: 'w12',
    category: 'weather',
    scenario: '震度。',
    question: '地震の揺れの大きさを表す「震度」は、日本では何段階に分かれていますか？',
    options: ['7段階', '10段階', '12段階', '無制限'],
    correctIndex: 1,
    explanation: '0, 1, 2, 3, 4, 5弱, 5強, 6弱, 6強, 7の計10段階です。'
  },
  {
    id: 'w13',
    category: 'weather',
    scenario: '低気圧。',
    question: '北半球において、低気圧の周りの風はどちら向きに吹き込みますか？',
    options: ['時計回り', '反時計回り', '上から下へ垂直に', '決まっていない'],
    correctIndex: 1,
    explanation: '北半球では、低気圧は中心に向かって「反時計回り」に吹き込みます。高気圧は時計回りに吹き出します。'
  },
  // --- 行政 ---
  {
    id: 'a1',
    category: 'admin',
    scenario: '地方自治。',
    question: '地方自治体の長（知事や市町村長）を直接選ぶ権利は何と呼ばれますか？',
    options: ['罷免権', '参政権（公選）', '請求権', '議決権'],
    correctIndex: 1,
    explanation: '地方自治体の長や議員を住民が直接投票で選ぶことを公選（直接選挙）と呼びます。'
  },
  {
    id: 'a2',
    category: 'admin',
    scenario: '行政窓口。',
    question: '住民票の写しの交付など、最も身近な行政サービス窓口となるのはどこですか？',
    options: ['都道府県庁', '市区町村役場', '警察署', '税務署'],
    correctIndex: 1,
    explanation: '住民票、印鑑証明、戸籍などの身近な手続きは市区町村役場（役所・役場）で行います。'
  },
  {
    id: 'a3',
    category: 'admin',
    scenario: '行政の法執行。',
    question: '行政機関が国民に対して、特定の行為を求めたり禁止したりする法執行を何と呼びますか？',
    options: ['行政処分', '司法判決', '立法措置', '閣議決定'],
    correctIndex: 0,
    explanation: '行政庁が特定の個人や団体に対して、権利を制限したり義務を課したりすることを行政処分と呼びます。'
  },
  {
    id: 'a4',
    category: 'admin',
    scenario: '憲法改正手続き。',
    question: '憲法改正の手続きにおいて、国会で衆参各議院のどの程度の賛成が必要ですか？',
    options: ['過半数', '3分の1以上', '3分の2以上', '全会一致'],
    correctIndex: 2,
    explanation: '各議院の総議員の3分の2以上の賛成で発議され、その後国民投票で過半数の賛成が必要です。'
  },
  {
    id: 'a5',
    category: 'admin',
    scenario: '政府の意思決定。',
    question: '日本の行政機関のトップが集まり、政府の方針を決定する会議を何といいますか？',
    options: ['御前会議', '閣議', '役員会', '理事会'],
    correctIndex: 1,
    explanation: '内閣総理大臣とその他の国務大臣で構成される内閣の最高意思決定機関です。'
  },
  {
    id: 'a6',
    category: 'admin',
    scenario: '公務員の原則。',
    question: '公務員の職務において、特定の個人や企業を優遇せず、平等に扱う原則を何といいますか？',
    options: ['守秘義務', '公平・中立の原則', '職務専念義務', '法令遵守'],
    correctIndex: 1,
    explanation: '全体の奉仕者として、一部の利益ではなく公共の利益のために働くことが求められます。'
  },
  {
    id: 'a7',
    category: 'admin',
    scenario: '会計年度。',
    question: '国の会計年度（予算が使われる期間）はいつからいつまでですか？',
    options: ['1月1日 〜 12月31日', '4月1日 〜 翌年3月31日', '9月1日 〜 翌年8月31日', '10月1日 〜 翌年9月30日'],
    correctIndex: 1,
    explanation: '日本の官公庁や多くの企業では、4月から翌年3月までを一つの年度としています。'
  },
  {
    id: 'a8',
    category: 'admin',
    scenario: '行政救済制度。',
    question: '行政の決定に対して不服がある場合に、行政庁に対して見直しを求める制度を何といいますか？',
    options: ['行政不服申立て', '公聴会', '住民訴訟', '監査請求'],
    correctIndex: 0,
    explanation: '行政庁の違法または不当な処分によって権利を侵害された場合に、簡易迅速に救済を求める制度です。'
  },
  {
    id: 'a9',
    category: 'admin',
    scenario: '情報公開。',
    question: '行政機関が保有する情報の公開を求めることができる制度を何といいますか？',
    options: ['個人情報保護制度', '情報公開制度', '秘密保持制度', '公文書管理制度'],
    correctIndex: 1,
    explanation: '透明な行政と国民の「知る権利」を保障するための制度です。'
  },
  {
    id: 'a10',
    category: 'admin',
    scenario: '人事管理。',
    question: '日本の国家公務員の任命権を実質的に管理し、人事行政の中立性を保つ機関はどこですか？',
    options: ['人事院', '総務省', '内閣法制局', '会計検査院'],
    correctIndex: 0,
    explanation: '「中立的・第三者的機関」として、公務員の人事改善勧告なども行います。'
  },
  {
    id: 'a11',
    category: 'admin',
    scenario: '決算の検査。',
    question: '国の収入や支出が正しく行われているかをチェックし、決算を検査する独立した機関はどこですか？',
    options: ['日本銀行', '財務省', '会計検査院', '国税庁'],
    correctIndex: 2,
    explanation: '会計検査院は、国民の税金が正しく使われているかを独立した立場でチェックします。'
  },
  {
    id: 'a12',
    category: 'admin',
    scenario: '行政運営の基本。',
    question: '行政手続きを簡素化し、公平性を確保するために定められた法律は何ですか？',
    options: ['行政手続法', '地方自治法', '国家公務員法', '刑法'],
    correctIndex: 0,
    explanation: '行政庁の処分や行政指導の手続きをルール化した法律です。'
  },
  {
    id: 'a13',
    category: 'admin',
    scenario: '地方税。',
    question: '都道府県が徴収する税金（地方税）の例として正しいものはどれですか？',
    options: ['消費税', '所得税', '住民税（個人都道府県民税）', '贈与税'],
    correctIndex: 2,
    explanation: '住民税のうち「都道府県民税」は都道府県が徴収します。消費税や所得税は国税です。'
  },
  // --- 英語 Part 2 ---
  {
    id: 'e14',
    category: 'english',
    scenario: 'ビジネスで必須の単語。',
    question: '「予算」を意味するビジネスで必須の単語はどれですか？',
    options: ['Profit', 'Budget', 'Cost', 'Asset'],
    correctIndex: 1,
    explanation: 'Budget（バジェット）は予算を意味します。Profitは利益、Costは費用、Assetは資産です。'
  },
  {
    id: 'e15',
    category: 'english',
    scenario: '経験を表す完了形。',
    question: '次の（　）に入れるのに最も適切なものはどれですか？ "I have (  ) to London three times."',
    options: ['gone', 'been', 'stayed', 'arrived'],
    correctIndex: 1,
    explanation: 'have been to ... で「〜へ行ったことがある（経験）」を表します。have gone to は「〜へ行ってしまった（結果、今はいない）」となります。'
  },
  {
    id: 'e16',
    category: 'english',
    scenario: '提案の表現。',
    question: '相手に提案をする際、「〜しませんか？」と丁寧に誘う表現はどれですか？',
    options: ['Why don\'t we...?', 'What do you do?', 'How about...?', '1と3の両方'],
    correctIndex: 3,
    explanation: 'Why don\'t we...? も How about...? も提案や勧誘で使われる定番の表現です。'
  },
  {
    id: 'e17',
    category: 'english',
    scenario: '機密保持。',
    question: '"Confidential" と書かれた書類はどう扱うべきですか？',
    options: ['自由に配布する', '至急返信する', '機密情報として扱う', '破棄する'],
    correctIndex: 2,
    explanation: 'Confidential（コンフィデンシャル）は「機密」「秘密」を意味し、取り扱いに注意が必要な書類に記されます。'
  },
  {
    id: 'e18',
    category: 'english',
    scenario: '丁寧な挨拶。',
    question: '「お会いできて光栄です」の、より丁寧な表現はどれですか？',
    options: ['Nice to meet you.', 'It\'s a pleasure to meet you.', 'Good to see you.', 'I\'m happy now.'],
    correctIndex: 1,
    explanation: 'It\'s a pleasure to meet you. は、初対面の相手に対する非常に丁寧でビジネスに適した挨拶です。'
  },
  // --- 漢字 Part 2 ---
  {
    id: 'k14',
    category: 'kanji',
    scenario: '読み間違いやすい漢字。',
    question: '下線部の読みとして正しいものはどれですか？「計画を画策する。」',
    options: ['がさく', 'かくさく', 'がかく', 'かくさ'],
    correctIndex: 1,
    explanation: '「画策（かくさく）」と読みます。ひそかに計画を立てることを指します。'
  },
  {
    id: 'k15',
    category: 'kanji',
    scenario: 'ビジネス頻出漢字。',
    question: '「相殺」の正しい読み方はどれですか？',
    options: ['そうさい', 'あいさつ', 'そうさつ', 'あいさい'],
    correctIndex: 0,
    explanation: '「相殺（そうさい）」と読みます。差し引いて帳消しにすることを指します。'
  },
  {
    id: 'k16',
    category: 'kanji',
    scenario: '漢字の知識。',
    question: '次のうち、漢字の書き順として「一画目が左払いでない」ものはどれですか？',
    options: ['有', '右', '左', '希'],
    correctIndex: 2,
    explanation: '「左」の一画目は横棒です。「右」「有」「希」の一画目はすべて左払いです。同様に「在」「友」「布」なども一画目は横棒から始まります。'
  },
  {
    id: 'k17',
    category: 'kanji',
    scenario: '熟語の表記。',
    question: '「ふぜい」という言葉の正しい漢字はどれですか？（例：風情がある）',
    options: ['風静', '風景', '風勢', '風情'],
    correctIndex: 3,
    explanation: '「風情（ふぜい）」はその場の雰囲気や味わいを指します。'
  },
  {
    id: 'k18',
    category: 'kanji',
    scenario: 'ビジネス頻出漢字。',
    question: '「進捗」の正しい読み方はどれですか？',
    options: ['しんぽ', 'しんちょく', 'しんあゆ', 'しんしゅう'],
    correctIndex: 1,
    explanation: '「進捗（しんちょく）」と読みます。物事の進み具合を指します。'
  },
  // --- ビジネスマナー Part 2 ---
  {
    id: 'm14',
    category: 'manners',
    scenario: '席次。',
    question: '応接室で、入り口から最も遠い奥の席を何と呼びますか？',
    options: ['下座', '上座', '中座', '貴賓席'],
    correctIndex: 1,
    explanation: '入り口から最も遠い席が、敬意を表す「上座（かみざ）」となります。'
  },
  {
    id: 'm15',
    category: 'manners',
    scenario: '茶菓子の出し方。',
    question: '来客に茶菓子を出す際、正しい配置はどれですか？（客から見て）',
    options: ['左にお茶、右に菓子', '右にお茶、左に菓子', '両方中央に並べる', 'お茶だけで菓子は出さない'],
    correctIndex: 1,
    explanation: '基本は、客から見て右にお茶、左にお菓子を配置します。'
  },
  {
    id: 'm16',
    category: 'manners',
    scenario: '弔辞の言葉。',
    question: '弔辞の際に避けるべき「忌み言葉」はどれですか？',
    options: ['たびたび', '重ね重ね', 'ますます', '上記すべて'],
    correctIndex: 3,
    explanation: '不幸が重なることを連想させる「重ね言葉」は、弔辞では避けるのがマナーです。'
  },
  {
    id: 'm17',
    category: 'manners',
    scenario: '名刺交換。',
    question: '名刺交換の際、相手の名刺のどこを持つのがマナーですか？',
    options: ['相手の社名やロゴの上', '相手の名前の上', '余白部分（文字にかからないように）', 'どこでも良い'],
    correctIndex: 2,
    explanation: '相手のロゴや氏名に指がかからないよう、余白の部分を持つのがマナーです。'
  },
  {
    id: 'm18',
    category: 'manners',
    scenario: '言葉の使い分け。',
    question: '「ご教授ください」と「ご教示ください」の使い分けで、一般的な業務のやり方を聞く際に適切なのは？',
    options: ['ご教授（専門的な技術や学問を学ぶ場合）', 'ご教示（情報や手順を教えてもらう場合）', 'どちらでも完全に同じ', '仕事では「ご教授」しか使わない'],
    correctIndex: 1,
    explanation: '「ご教示（ごきょうじ）」は方法や手順を教わる際に使い、「ご教授（ごきょうじゅ）」は学問や芸術などを長期間習う際に使います。'
  },
  // --- 政治 Part 2 ---
  {
    id: 'p14',
    category: 'politics',
    scenario: '衆議院議員。',
    question: '日本の国会において、衆議院議員の任期は何年ですか？（解散がない場合）',
    options: ['2年', '4年', '6年', '制限なし'],
    correctIndex: 1,
    explanation: '衆議院議員の任期は4年です。ただし、解散がある場合はその時点で任期終了となります。'
  },
  {
    id: 'p15',
    category: 'politics',
    scenario: '首相の要件。',
    question: '日本の行政の最高責任者である内閣総理大臣は、どのような資格が必要ですか？',
    options: ['文民（軍人でないこと）であること', '国会議員であること', '35歳以上であること', '1と2の両方'],
    correctIndex: 3,
    explanation: '内閣総理大臣は「文民」かつ「国会議員」でなければならないと憲法で定められています。'
  },
  {
    id: 'p16',
    category: 'politics',
    scenario: '選挙制度。',
    question: '日本の国政選挙の投票方式で、候補者名ではなく「政党名」を書いて投票する制度は何ですか？',
    options: ['小選挙区制', '比例代表制', '中選挙区制', '記名投票制'],
    correctIndex: 1,
    explanation: '比例代表制（ひれいだいひょうせい）は、政党の得票数に応じて議席を割り当てる制度です。'
  },
  {
    id: 'p17',
    category: 'politics',
    scenario: '憲法第9条。',
    question: '憲法第9条で放棄されているものは何ですか？',
    options: ['自衛権', '戦争', '警察力', '納税の義務'],
    correctIndex: 1,
    explanation: '憲法第9条では、戦争の放棄、戦力の不保持、国の交戦権の否認を定めています。'
  },
  {
    id: 'p18',
    category: 'politics',
    scenario: '影の内閣。',
    question: '「影の内閣」とも呼ばれ、野党が政権交代に備えて組織する体制を何と言いますか？',
    options: ['シャドウ・キャビネット', 'バックアップ・チーム', 'セカンド・ユニット', 'ゴースト・パネル'],
    correctIndex: 0,
    explanation: 'シャドウ・キャビネットは、野党が閣僚に相当する担当者を決めておく体制です。'
  },
  // --- 気象 Part 2 ---
  {
    id: 'w14',
    category: 'weather',
    scenario: '夕立の原因。',
    question: '日本で夏によく発生する「夕立」の主な原因は何ですか？',
    options: ['台風の接近', '寒冷前線の通過', '強い日射による上昇気流（熱雷）', '季節風の交代'],
    correctIndex: 2,
    explanation: '夏の強い日差しで熱せられた空気が上昇気流となり、積乱雲が発生して降る雨を夕立（ゆうだち）と呼びます。'
  },
  {
    id: 'w15',
    category: 'weather',
    scenario: '雲の分類。',
    question: '雲の高さや種類を分類する際、全部でいくつの「基本雲形（十種雲形）」に分けられますか？',
    options: ['5種類', '10種類', '12種類', '20種類'],
    correctIndex: 1,
    explanation: '世界気象機関により、雲はその高さと形から10種類の「基本雲形」に分類されています。'
  },
  {
    id: 'w16',
    category: 'weather',
    scenario: '光の現象。',
    question: '強い日差しによって地表付近の空気がゆらゆらと揺れて見える現象を何と言いますか？',
    options: ['蜃気楼', '陽炎（かげろう）', '霧', '逆転層'],
    correctIndex: 1,
    explanation: '日光で熱せられた地表付近の空気の密度に差ができ、光が屈折してゆらゆら見える現象です。'
  },
  {
    id: 'w17',
    category: 'weather',
    scenario: '台風の強風。',
    question: '台風が日本に接近する際、進路の「右側（東側）」と「左側（西側）」では、どちらが風が強くなりやすいですか？',
    options: ['右側（危険半円）', '左側（可航半円）', 'どちらも同じ', '中心部のみ強い'],
    correctIndex: 0,
    explanation: '台風の進行速度と渦巻く風向きが合わさる右側（北上する場合は東側）は風が強まりやすく「危険半円」と呼ばれます。'
  },
  {
    id: 'w18',
    category: 'weather',
    scenario: 'エルニーニョ。',
    question: '「エルニーニョ現象」が発生すると、日本の夏はどうなる傾向がありますか？',
    options: ['猛暑になる', '冷夏になる', '雨が全く降らなくなる', '変化はない'],
    correctIndex: 1,
    explanation: '太平洋赤道域の海水温の変化が気圧配置に影響し、日本の夏は太平洋高気圧の張り出しが弱まって「冷夏」や「長雨」になりやすくなります。'
  },
  // --- 行政 Part 2 ---
  {
    id: 'a14',
    category: 'admin',
    scenario: '国際標準。',
    question: '国際的な標準規格（品質管理など）として、日本の行政や企業も重視する「ISO」は何の略ですか？',
    options: ['国際標準化機構', '国際労働機関', '国際通貨基金', '世界保健機関'],
    correctIndex: 0,
    explanation: 'International Organization for Standardization（国際標準化機構）の略称です。'
  },
  {
    id: 'a15',
    category: 'admin',
    scenario: 'パブコメ。',
    question: '行政機関が特定の政策について、事前に広く国民から意見を募る手続きを何と言いますか？',
    options: ['世論調査', 'アンケート', 'パブリック・コメント', '住民説明会'],
    correctIndex: 2,
    explanation: '政策決定の透明性を高め、国民の意見を反映させるための制度です。'
  },
  {
    id: 'a16',
    category: 'admin',
    scenario: '防災。',
    question: '市町村が作成する、災害時の被害予測や避難場所を記した地図を何と言いますか？',
    options: ['ガイドマップ', 'ハザードマップ', 'ロードマップ', 'トポグラフィックマップ'],
    correctIndex: 1,
    explanation: '地震、洪水、土砂災害などのリスクと避難経路等をまとめた地図です。'
  },
  {
    id: 'a17',
    category: 'admin',
    scenario: '税金。',
    question: '「ふるさと納税」制度において、寄附金のうち自己負担額を除いた額が控除される対象となる税金は？',
    options: ['消費税と所得税', '所得税と個人住民税', '法人税と固定資産税', '自動車税'],
    correctIndex: 1,
    explanation: 'ふるさと納税の実質的な控除は、所得税と翌年度の住民税から行われます。'
  },
  {
    id: 'a18',
    category: 'admin',
    scenario: 'マイナンバー。',
    question: '日本の行政において、国民一人ひとりに割り振られている12桁の番号を何と言いますか？',
    options: ['マイナンバー（個人番号）', '基礎年金番号', '住民票コード', '健康保険証番号'],
    correctIndex: 0,
    explanation: '税、社会保障、災害対策の3分野で効率的に個人の情報を管理するために導入された12桁の番号です。'
  }
];
