// Gemini API の接続チェック。`npm run check:gemini` で実行する（API キーが必要）。
// アプリと同じ設定（GEMINI_MODEL、構造化出力、Google 検索連携）で実際に呼び、使えるかを確かめる。
// モデルの提供終了やキーの不備に、本番で気づく前に気づくためのもの。CI では実行しない。
import dotenv from 'dotenv';
import { getGeminiModel, getGenAI, hasGeminiKey } from '../server/gemini';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

async function step(label: string, run: () => Promise<string>) {
  try {
    const detail = await run();
    console.log(`OK  ${label}${detail ? `: ${detail}` : ''}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`NG  ${label}: ${message.slice(0, 300)}`);
    return false;
  }
}

async function main() {
  if (!hasGeminiKey()) {
    console.error('NG  GEMINI_API_KEY が設定されていません（.env.local を確認してください）');
    process.exit(1);
  }

  const model = getGeminiModel();
  const ai = getGenAI();
  console.log(`モデル: ${model}${process.env.GEMINI_MODEL ? '（GEMINI_MODEL で指定）' : '（既定値）'}\n`);

  const results: boolean[] = [];

  results.push(await step('モデルが存在する', async () => {
    const info = await ai.models.get({ model });
    return info.displayName || info.name || '';
  }));

  // 雑学・クイズレポートと同じ、JSON スキーマ指定の構造化出力。
  results.push(await step('構造化出力（JSON スキーマ）', async () => {
    const response = await ai.models.generateContent({
      model,
      contents: '「承知いたしました」の意味を10文字程度で説明してください。',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: { answer: { type: 'STRING' } },
          required: ['answer'],
        },
      },
    });
    const parsed = JSON.parse(response.text || '{}');
    if (typeof parsed.answer !== 'string') throw new Error(`想定外の応答: ${response.text}`);
    return parsed.answer;
  }));

  // ニュース取得と同じ、Google 検索連携 + 構造化出力。
  results.push(await step('Google 検索連携 + 構造化出力（ニュース取得と同じ設定）', async () => {
    const response = await ai.models.generateContent({
      model,
      contents: '今日の日本の主要ニュースを1件、実在する記事の URL 付きで挙げてください。',
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: { title: { type: 'STRING' }, url: { type: 'STRING' } },
          required: ['title', 'url'],
        },
      },
    });
    const parsed = JSON.parse(response.text || '{}');
    if (typeof parsed.url !== 'string' || !/^https?:\/\//.test(parsed.url)) {
      throw new Error(`URL を含む応答が得られませんでした: ${response.text}`);
    }
    return parsed.title;
  }));

  const failed = results.filter((ok) => !ok).length;
  if (failed > 0) {
    console.error(`\n${failed} 件失敗しました。モデル名は GEMINI_MODEL で変更できます（例: GEMINI_MODEL=gemini-3.8-flash）。`);
    process.exit(1);
  }
  console.log('\nOK');
}

void main();
