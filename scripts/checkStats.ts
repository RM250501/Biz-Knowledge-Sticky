// カテゴリ別の正答率の計算チェック。`npm run check:stats` で実行する。
import { accuracyPercent, addAnswer, buildRadarData, QUIZ_CATEGORIES, strongestCategory } from '../src/lib/categoryStats';

let failures = 0;
function check(label: string, got: unknown, expected: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? 'OK' : 'NG'}  ${label}: ${JSON.stringify(got)}${ok ? '' : `（期待値 ${JSON.stringify(expected)}）`}`);
}

console.log('accuracyPercent');
check('未回答', accuracyPercent(undefined), null);
check('0問', accuracyPercent({ answered: 0, correct: 0 }), null);
check('3問中2問', accuracyPercent({ answered: 3, correct: 2 }), 67);
check('20問中20問', accuracyPercent({ answered: 20, correct: 20 }), 100);

console.log('\naddAnswer');
let stats = addAnswer(undefined, 'economy', true);
check('初回の正解', stats.economy, { answered: 1, correct: 1 });
stats = addAnswer(stats, 'economy', false);
check('続けて不正解', stats.economy, { answered: 2, correct: 1 });
stats = addAnswer(stats, 'kanji', false);
check('別カテゴリは独立', [stats.economy, stats.kanji], [{ answered: 2, correct: 1 }, { answered: 1, correct: 0 }]);
// 以前の XP 方式は 10 問正解で 100 点に頭打ちだった。15 問中 12 問正解なら 80% になる。
let many: ReturnType<typeof addAnswer> | undefined;
for (let i = 0; i < 15; i++) many = addAnswer(many, 'english', i < 12);
check('15問中12問正解（頭打ちにならない）', [many?.english, accuracyPercent(many?.english)], [{ answered: 15, correct: 12 }, 80]);

console.log('\nbuildRadarData');
const radar = buildRadarData({ categoryStats: { economy: { answered: 4, correct: 3 } } });
check('雑学を除く6分野', radar.length, QUIZ_CATEGORIES.length);
check('雑学は含まない', radar.some((p) => p.subject === '雑学'), false);
check('経済の正答率', radar.find((p) => p.subject === '経済'), { subject: '経済', accuracy: 75, answered: 4, correct: 3 });
check('未回答の分野は0', radar.find((p) => p.subject === '英語')?.accuracy, 0);
check('旧データ（categoryStats なし）', buildRadarData({}).every((p) => p.accuracy === 0 && p.answered === 0), true);

console.log('\nstrongestCategory');
check('データなし', strongestCategory({}), null);
check('回答が3問未満の分野は対象外', strongestCategory({ categoryStats: { english: { answered: 2, correct: 2 } } }), null);
check('正答率が高い分野', strongestCategory({ categoryStats: {
  english: { answered: 10, correct: 6 }, kanji: { answered: 4, correct: 4 }, economy: { answered: 2, correct: 2 },
} }), 'kanji');
check('正答率0%だけなら得意分野なし', strongestCategory({ categoryStats: { economy: { answered: 5, correct: 0 } } }), null);
check('同率なら回答数が多い分野', strongestCategory({ categoryStats: {
  english: { answered: 4, correct: 2 }, kanji: { answered: 10, correct: 5 },
} }), 'kanji');

if (failures > 0) {
  console.error(`\n${failures} 件失敗しました`);
  process.exit(1);
}
console.log('\nOK');
