// 固定の雑学（AI を使えないときの予備）のチェック。`npm run check:trivia` で実行する。
import { FALLBACK_TRIVIA } from '../server/trivia/fallback';
import { buildFallbackTrivia, normalizeTitle } from '../server/trivia/generator';

const MIN_COUNT = 40;
const TARGETS = new Set(['家族', '同僚', '友人']);
const LIMITS = { category: 10, title: 24, doyaPoint: 40, starter: 40, explanationMin: 30, explanationMax: 140 };

const errors: string[] = [];
const titles = new Set<string>();

FALLBACK_TRIVIA.forEach((t, i) => {
  const where = `[${i + 1}] ${t.title}`;
  for (const field of ['category', 'title', 'explanation', 'doyaPoint', 'starter'] as const) {
    if (!t[field]?.trim()) errors.push(`${where}: ${field} が空です`);
  }
  if (t.category.length > LIMITS.category) errors.push(`${where}: カテゴリ名が長すぎます（${t.category.length}文字）`);
  if (t.title.length > LIMITS.title) errors.push(`${where}: タイトルが長すぎます（${t.title.length}文字）`);
  if (t.doyaPoint.length > LIMITS.doyaPoint) errors.push(`${where}: ドヤ顔ポイントが長すぎます（${t.doyaPoint.length}文字）`);
  if (t.starter.length > LIMITS.starter) errors.push(`${where}: 切り出しが長すぎます（${t.starter.length}文字）`);
  if (t.explanation.length < LIMITS.explanationMin || t.explanation.length > LIMITS.explanationMax) {
    errors.push(`${where}: 解説の長さが範囲外です（${t.explanation.length}文字）`);
  }
  if (t.target.length === 0 || t.target.some((x) => !TARGETS.has(x))) errors.push(`${where}: おすすめの相手が不正です`);
  const key = normalizeTitle(t.title);
  if (titles.has(key)) errors.push(`${where}: タイトルが重複しています`);
  titles.add(key);
});

if (FALLBACK_TRIVIA.length < MIN_COUNT) errors.push(`件数が ${MIN_COUNT} 件未満です（${FALLBACK_TRIVIA.length} 件）`);

// 同じ日に配るとき：配り済みのタイトルとは重ならない。すべて配り終えたら重複を許す。
const used: string[] = [];
for (let i = 0; i < FALLBACK_TRIVIA.length; i += 1) {
  used.push(buildFallbackTrivia('2026-11-17', `browser-${i}`, used).title);
}
if (new Set(used).size !== FALLBACK_TRIVIA.length) errors.push('同じ日に配った雑学が重複しています');
const extra = buildFallbackTrivia('2026-11-17', 'browser-extra', used);
if (!extra.title) errors.push('すべて配り終えたあとに雑学を選べません');
// 同じ日・同じブラウザなら、同じ雑学になる（配り済みがない場合）
if (buildFallbackTrivia('2026-11-17', 'same').title !== buildFallbackTrivia('2026-11-17', 'same').title) {
  errors.push('同じ日・同じブラウザで選ばれる雑学が変わります');
}

const categories = new Map<string, number>();
for (const t of FALLBACK_TRIVIA) categories.set(t.category, (categories.get(t.category) ?? 0) + 1);
console.log(`固定の雑学: ${FALLBACK_TRIVIA.length} 件`);
for (const [name, count] of categories) console.log(`  ${name}: ${count}`);
console.log(`同じ日に ${FALLBACK_TRIVIA.length} 人へ配ったときの重複: ${used.length - new Set(used).size} 件`);

if (errors.length > 0) {
  console.error(`\n${errors.length} 件のエラー:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log('OK');
