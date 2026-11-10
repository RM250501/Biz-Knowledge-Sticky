import { GoogleGenAI } from '@google/genai';

// すべての AI 呼び出しで使うモデル。
export const GEMINI_MODEL = 'gemini-2.0-flash';

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
