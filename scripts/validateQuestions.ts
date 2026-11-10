// 問題データの形式チェック。`npm run check:questions` で実行する。
import { QUESTIONS } from '../src/data/questions';
import { CATEGORY_LABELS } from '../src/types';

const errors: string[] = [];
const seenIds = new Set<string>();
const seenQuestions = new Set<string>();

for (const q of QUESTIONS) {
  const where = `[${q.id}]`;
  if (seenIds.has(q.id)) errors.push(`${where} id が重複しています`);
  seenIds.add(q.id);

  if (!CATEGORY_LABELS[q.category] || q.category === ('trivia' as string)) {
    errors.push(`${where} 不明なカテゴリ: ${q.category}`);
  }
  if (q.options.length !== 4) errors.push(`${where} 選択肢は4つ必要です（${q.options.length}個）`);
  if (new Set(q.options).size !== q.options.length) errors.push(`${where} 選択肢が重複しています`);
  if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
    errors.push(`${where} correctIndex が範囲外です: ${q.correctIndex}`);
  }
  for (const [field, value] of Object.entries({ scenario: q.scenario, question: q.question, explanation: q.explanation })) {
    if (!value || !value.trim()) errors.push(`${where} ${field} が空です`);
  }
  if (seenQuestions.has(q.question)) errors.push(`${where} 同じ問題文が既にあります`);
  seenQuestions.add(q.question);
}

const counts: Record<string, number> = {};
for (const q of QUESTIONS) {
  counts[q.category] = (counts[q.category] || 0) + 1;
}

console.log(`問題数: ${QUESTIONS.length}`);
for (const [category, count] of Object.entries(counts)) {
  console.log(`  ${CATEGORY_LABELS[category] || category}: ${count}`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} 件のエラー:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log('OK');
