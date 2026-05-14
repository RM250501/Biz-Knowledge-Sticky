import { GoogleGenAI } from "@google/genai";

// クライアント再生成を避けるため、呼び出し間で使い回すシングルトン。
let genAI: any = null;

function getGenAI() {
  if (!genAI) {
    // API キーは環境変数を Vite define で埋め込んで参照する。
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function getAIExplanation(question: string, userAnswer: string, isCorrect: boolean, context: string) {
  try {
    const ai = getGenAI();
    
    // ビジネス学習向けに、短く実用的な解説を返すプロンプト。
    const prompt = `
      あなたはプロのビジネスコンサルタントです。
      ユーザーが一般常識を学習しています。
      
      問題: ${question}
      ユーザーの回答: ${userAnswer}
      結果: ${isCorrect ? '正解' : '不正解'}
      コンテキスト: ${context}
      
      なぜその回答が${isCorrect ? '正解' : '不正解'}なのか、簡潔かつプロフェッショナルに解説してください。
      ビジネスの文脈や実用的な応用に焦点を当ててください。
      100文字程度で、日本語で回答してください。
    `;

    // 短文フィードバック生成には高速モデルを利用。
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text;
    return text || "解説を取得できませんでした。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI解説の取得中にエラーが発生しました。";
  }
}

export async function getActualLocalInfo(lat: number, lon: number) {
  try {
    const ai = getGenAI();
    // 現在地座標を基準に、実用的なローカル情報を取得。
    const prompt = `現在地（緯度: ${lat}, 経度: ${lon}）周辺の「実際の」最新情報を教えてください。住所は座標から推測される具体的な地名にしてください。ニュースはその地域に関連する実在する主要な地域トピックにしてください。`;

    const response = await ai.models.generateContent({
      // 構造化出力と検索を伴うため、より高性能なモデルを利用。
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        // Google Search による根拠付き生成を許可。
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
        // UI で扱いやすいよう、JSON 形をスキーマで固定。
        responseSchema: {
          type: "OBJECT",
          properties: {
            address: { type: "STRING" },
            weather: {
              type: "OBJECT",
              properties: {
                temp: { type: "NUMBER" },
                condition: { type: "STRING" },
                humidity: { type: "NUMBER" }
              },
              required: ["temp", "condition", "humidity"]
            },
            news: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  source: { type: "STRING" }
                },
                required: ["title", "source"]
              }
            }
          },
          required: ["address", "weather", "news"]
        }
      }
    });

    const text = response.text;
    return JSON.parse(text || "{}");
  } catch (error) {
    console.error("Gemini Local Info Error:", error);
    return null;
  }
}

export async function getActualNewsTopics() {
  try {
    const ai = getGenAI();
    const today = new Date().toLocaleDateString('ja-JP');
    // カテゴリ別抽出と URL 品質要件を明示したプロンプト。
    const prompt = `あなたはプロのニュースキュレーターです。本日（${today}時点）の日本および世界の主要ニュース・業界動向を調査し、以下のカテゴリーごとに実在する最新記事をピックアップしてください：
    1. IT・テクノロジー
    2. 経済・ビジネス
    3. 政治・社会
    
    各カテゴリーにつき2〜3件の記事を提供してください。
    【最重要】URLは必ず、検索結果から得られた「現在アクセス可能な実際の個別記事のURL」を正確に記載してください。トップページのURLや、存在しないパス、存在しない記事IDを含む嘘のURL（ハルシネーション）は絶対に含めないでください。
    信頼できるソース（日本経済新聞、ITmedia、ロイター、読売新聞、東洋経済オンラインなど）の記事を優先してください。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
        // カテゴリ配列 + 記事オブジェクトの構造化出力。
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              name: { type: "STRING" },
              articles: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    source: { type: "STRING" },
                    url: { type: "STRING" }
                  },
                  required: ["title", "source", "url"]
                }
              }
            },
            required: ["id", "name", "articles"]
          }
        }
      }
    });

    const text = response.text;
    console.log("Gemini News Response:", text); // デバッグ用ログ
    return JSON.parse(text || "[]");
  } catch (error) {
    console.error("Gemini News Error:", error);
    return null;
  }
}

type DailyTriviaOptions = {
  browserSeed?: string;
  avoidTitles?: string[];
  variantIndex?: number;
};

export async function getDailyTrivia(dayOfWeek: number, options: DailyTriviaOptions = {}) {
  // 曜日ごとのテーマ定義（生成ネタの方向性を固定）。
  const categories = [
    "日：難読・雑学クイズ",
    "月：言葉の由来",
    "火：生き物の不思議",
    "水：食べ物・料理",
    "木：歴史・偉人",
    "金：週末の娯楽",
    "土：難読・雑学クイズ"
  ];
  const category = categories[dayOfWeek];
  const avoidTitlesText = (options.avoidTitles || []).slice(-20).join(' / ');
  const browserSeed = options.browserSeed || 'default-seed';
  const triviaThemes = [
    '数字の意外性',
    '語源と歴史',
    '人体の不思議',
    '動物の行動',
    '食文化の背景',
    '科学の逆説',
    '仕事で使える会話ネタ',
    '身近な道具の豆知識',
    '地理・地名の由来',
    '法律・制度のトリビア',
    '心理学の小ネタ',
    'ことわざ・慣用句の由来',
  ];
  const normalizedVariant = Math.abs(options.variantIndex ?? 0) % triviaThemes.length;
  const selectedTheme = triviaThemes[normalizedVariant];

  try {
    const ai = getGenAI();

    // そのまま UI に渡せる雑学 JSON を生成するプロンプト。
    const prompt = `
      あなたは『明日のランチで話せるネタ帳』の編集者です。
      今日のカテゴリー「${category}」に沿った、思わず「へぇ〜」と言ってしまうような雑学を1つ生成してください。
      ブラウザ識別シード: ${browserSeed}
      バリアント番号: ${normalizedVariant}
      必須テーマ: ${selectedTheme}
      既出タイトル（再利用禁止）: ${avoidTitlesText || 'なし'}
      
      以下のJSON形式で出力してください：
      {
        "title": "インパクトのあるタイトル（例：実は、イチゴの表面の粒々は『果実』ではない）",
        "explanation": "3行程度の簡潔な解説",
        "doyaPoint": "その話をするときの「一番の盛り上がりどころ」を強調した一言",
        "starter": "自然な会話の切り出し例（例：そういえばさ、イチゴ食べてて気づいたんだけど…）",
        "target": ["家族", "同僚", "友人"] から適したものを複数選択
      }
      
      制約：
      - 専門的すぎず、直感的に驚きがあるもの。
      - 出典がはっきりしている、または一般的に認められている事実であること。
      - 必須テーマ「${selectedTheme}」に必ず沿うこと。
      - タイトルには必須テーマに対応するキーワードを自然な形で含めること。
      - 既出タイトル（再利用禁止）と同一・類似表現は避けること。
      - ブラウザ識別シードを考慮し、同じ日の別ブラウザとネタが重なりにくい観点で選ぶこと。
      - 日本語で出力してください。
    `;

    const response = await ai.models.generateContent({
      // 短い創作生成のため高速モデルを利用。
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            explanation: { type: "STRING" },
            doyaPoint: { type: "STRING" },
            starter: { type: "STRING" },
            target: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["title", "explanation", "doyaPoint", "starter", "target"]
        }
      }
    });

    const text = response.text;
    return JSON.parse(text || "{}");
  } catch (error) {
    console.error("Gemini Trivia Error:", error);
    return null;
  }
}

// セッション単位のクイズ結果からレポート（正誤表・傾向・原因・学習提案）を生成する。
export async function generateQuizReport(sessionLog: Array<any>) {
  try {
    // テスト環境で API キーが未設定の場合はローカルでモックレポートを返す
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const wrongByCategory: Record<string, number> = {};
      sessionLog.forEach((s: any) => {
        if (!s.isCorrect) wrongByCategory[s.category] = (wrongByCategory[s.category] || 0) + 1;
      });
      const total = sessionLog.length;
      const correct = sessionLog.filter((s:any)=>s.isCorrect).length;
      const topWrong = Object.entries(wrongByCategory).sort((a,b)=>b[1]-a[1])[0];
      const topCategoryNote = topWrong ? `${topWrong[0]}で${topWrong[1]}件間違い` : '';
      const comment = correct === 0 ? '今は基礎から丁寧に復習しましょう。' : (correct === total ? 'よくできました！引き続き維持しましょう。' : `${correct}/${total}問正解。${topCategoryNote}`);
      return {
        summary: `全${total}問中 ${correct}問正解。`,
        correctnessTable: sessionLog.map((s: any) => ({ id: s.questionId, question: s.question, userAnswer: s.userAnswer, correctAnswer: s.correctAnswer, isCorrect: s.isCorrect, category: s.category })),
        comment
      };
    }

    const ai = getGenAI();

    const summaryItems = sessionLog.map((s: any, idx: number) => {
      return `${idx + 1}. 問題ID: ${s.questionId}｜カテゴリ: ${s.category}｜正解: ${s.correctAnswer}｜回答: ${s.userAnswer}｜結果: ${s.isCorrect ? '正解' : '不正解'}`;
    }).join('\n');

    const prompt = `
      あなたはビジネス学習支援の専門家です。以下はユーザーのクイズセッションの回答ログです。ログを読み、以下のJSON形式で応答してください。
      1) summary: セッション全体の短い要約（日本語、~60文字）
      2) correctnessTable: 各問題の要約（配列）
      3) comment: 正答数や分野に応じた短い一言コメント（日本語、20〜60文字）

      入力ログ:
      ${summaryItems}

      出力JSONのスキーマ:
      {
        "summary": "STRING",
        "correctnessTable": [{"id":"STRING","question":"STRING","userAnswer":"STRING","correctAnswer":"STRING","isCorrect":"BOOLEAN","category":"STRING"}],
        "comment": "STRING"
      }

      制約:
      - 日本語で出力すること。
      - JSONのみを返すこと。他の説明文は含めないでください。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // 応答をスキーマに沿ったJSONで受け取る
        responseSchema: {
          type: "OBJECT",
          properties: {
            summary: { type: "STRING" },
            correctnessTable: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "STRING" },
                  question: { type: "STRING" },
                  userAnswer: { type: "STRING" },
                  correctAnswer: { type: "STRING" },
                  isCorrect: { type: "BOOLEAN" },
                  category: { type: "STRING" }
                }
              }
            },
            comment: { type: "STRING" }
          },
          required: ["summary", "correctnessTable", "comment"]
        }
      }
    });

    const text = response.text;
    return JSON.parse(text || "{}");
  } catch (error) {
    console.error("generateQuizReport Error:", error);
    // フォールバック: AI呼び出しに失敗した場合でもモックレポートを返す
    try {
      const wrongByCategory: Record<string, number> = {};
      sessionLog.forEach((s: any) => {
        if (!s.isCorrect) wrongByCategory[s.category] = (wrongByCategory[s.category] || 0) + 1;
      });
      const total = sessionLog.length;
      const correct = sessionLog.filter((s:any)=>s.isCorrect).length;
      const topWrong = Object.entries(wrongByCategory).sort((a,b)=>b[1]-a[1])[0];
      const topCategoryNote = topWrong ? `${topWrong[0]}で${topWrong[1]}件間違い` : '';
      const comment = correct === 0 ? '今は基礎から丁寧に復習しましょう。' : (correct === total ? 'よくできました！引き続き維持しましょう。' : `${correct}/${total}問正解。${topCategoryNote}`);
      return {
        summary: `全${total}問中 ${correct}問正解。（AI呼び出しエラーで代替生成）`,
        correctnessTable: sessionLog.map((s: any) => ({ id: s.questionId, question: s.question, userAnswer: s.userAnswer, correctAnswer: s.correctAnswer, isCorrect: s.isCorrect, category: s.category })),
        comment
      };
    } catch (e) {
      return null;
    }
  }
}
