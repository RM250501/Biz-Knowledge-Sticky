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

// --- 利用枠超過（429）への対応 ---
// 枠を超えている間に呼び続けると、回復した枠をすぐまた使い切ってしまう。
// 429 を受けたら一定時間（クールダウン）は、雑学・レポートのどちらも Gemini を呼ばない。

const DEFAULT_QUOTA_COOLDOWN_MS = 10 * 60 * 1000;
const MIN_QUOTA_COOLDOWN_MS = 60 * 1000;

let quotaCooldownUntil = 0;

function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function isQuotaError(error: unknown) {
  const status = (error as { status?: unknown } | null)?.status;
  if (status === 429) return true;
  return /\b429\b|RESOURCE_EXHAUSTED/.test(errorText(error));
}

// 429 を記録し、クールダウンを始める。API が retryDelay（例: "37s"）を返していればそれに従う。
export function markQuotaExceeded(error: unknown) {
  const match = errorText(error).match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
  const retryMs = match ? Number(match[1]) * 1000 : DEFAULT_QUOTA_COOLDOWN_MS;
  const until = Date.now() + Math.max(retryMs, MIN_QUOTA_COOLDOWN_MS);
  quotaCooldownUntil = Math.max(quotaCooldownUntil, until);
  console.warn(`[gemini] quota exceeded; pausing AI calls until ${new Date(quotaCooldownUntil).toISOString()}`);
}

// クールダウン中なら、残りミリ秒を返す。中でなければ 0。
export function quotaCooldownRemainingMs() {
  return Math.max(0, quotaCooldownUntil - Date.now());
}

// テスト用: クールダウンを解除する。
export function resetQuotaCooldown() {
  quotaCooldownUntil = 0;
}
