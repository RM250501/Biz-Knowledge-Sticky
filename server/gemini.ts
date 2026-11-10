import { GoogleGenAI } from '@google/genai';

// 既定のモデル。gemini-2.0-flash は 2026-06-01 に提供終了したため、後継の Flash モデルを使う。
// モデルは今後も入れ替わるので、環境変数 GEMINI_MODEL で上書きできるようにしている。
// 実際に使えるかは `npm run check:gemini` で確認できる。
export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';

// .env.local は server/index.ts の dotenv で読み込むため、モジュール読み込み時ではなく呼び出し時に参照する。
export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

let client: GoogleGenAI | null = null;

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY);
}

// API キーはサーバーの環境変数だけで扱い、クライアントには渡さない。
export function getGenAI() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}
