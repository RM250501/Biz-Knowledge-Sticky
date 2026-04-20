import { GoogleGenAI } from "@google/genai";

let genAI: any = null;

function getGenAI() {
  if (!genAI) {
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
    const prompt = `現在地（緯度: ${lat}, 経度: ${lon}）周辺の「実際の」最新情報を教えてください。住所は座標から推測される具体的な地名にしてください。ニュースはその地域に関連する実在する主要な地域トピックにしてください。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
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
    console.log("Gemini News Response:", text); // Debug log
    return JSON.parse(text || "[]");
  } catch (error) {
    console.error("Gemini News Error:", error);
    return null;
  }
}

export async function getDailyTrivia(dayOfWeek: number) {
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

  try {
    const ai = getGenAI();

    const prompt = `
      あなたは『明日のランチで話せるネタ帳』の編集者です。
      今日のカテゴリー「${category}」に沿った、思わず「へぇ〜」と言ってしまうような雑学を1つ生成してください。
      
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
      - 日本語で出力してください。
    `;

    const response = await ai.models.generateContent({
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
