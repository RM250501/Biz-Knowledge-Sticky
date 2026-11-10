// 連続ログイン日数と日付キーの計算チェック。`npm run check:streak` で実行する。
// 実行環境のタイムゾーンに左右されないよう、セクションごとに TZ を固定して検証する。
import { nextLoginStreak } from '../src/lib/streak';
import { diffInDays, toLocalDateKey } from '../shared/date';

let failures = 0;

function check(label: string, got: unknown, expected: unknown) {
  const ok = got === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'OK' : 'NG'}  ${label}: ${String(got)}${ok ? '' : `（期待値 ${String(expected)}）`}`);
}

// タイムゾーンを切り替え、本当に切り替わったかを確認してから検証する。
function withTimeZone(tz: string, verify: () => boolean, run: () => void) {
  const original = process.env.TZ;
  process.env.TZ = tz;
  try {
    if (!verify()) {
      failures += 1;
      console.error(`NG  タイムゾーン ${tz} に切り替えられませんでした`);
      return;
    }
    run();
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
}

// --- nextLoginStreak（日付文字列だけで計算するため TZ に依存しない）
const TODAY = '2026-11-11';
type StreakCase = [name: string, prev: Parameters<typeof nextLoginStreak>[0], expected: number];
const streakCases: StreakCase[] = [
  ['初回（前回ログインなし）', { loginStreak: 0, lastLoginDate: '' }, 1],
  ['新形式・昨日', { loginStreak: 3, lastLoginDate: '2026-11-10', dateKeyVersion: 2 }, 4],
  ['新形式・2日前（途切れ）', { loginStreak: 3, lastLoginDate: '2026-11-09', dateKeyVersion: 2 }, 1],
  ['新形式・同じ日', { loginStreak: 3, lastLoginDate: TODAY, dateKeyVersion: 2 }, 3],
  ['新形式・同じ日で連続日数が0', { loginStreak: 0, lastLoginDate: TODAY, dateKeyVersion: 2 }, 1],
  ['旧形式・朝8時(JST)に毎日使う人（UTC では2日前）', { loginStreak: 3, lastLoginDate: '2026-11-09' }, 4],
  ['旧形式・昨夜', { loginStreak: 3, lastLoginDate: '2026-11-10' }, 4],
  ['旧形式・同じ日', { loginStreak: 3, lastLoginDate: TODAY }, 3],
  ['旧形式・3日前（途切れ）', { loginStreak: 3, lastLoginDate: '2026-11-08' }, 1],
  ['旧形式・UTC が先行するタイムゾーン', { loginStreak: 3, lastLoginDate: '2026-11-12' }, 3],
  ['壊れた日付', { loginStreak: 3, lastLoginDate: 'garbage' }, 1],
];

console.log('nextLoginStreak');
for (const [name, prev, expected] of streakCases) check(name, nextLoginStreak(prev, TODAY), expected);

// --- diffInDays（米国東部時間に固定し、夏時間の切り替えを実際にまたぐ）
// 2026-03-08 に夏時間が始まり、その日は 23 時間しかない。
console.log('\ndiffInDays（America/New_York）');
withTimeZone(
  'America/New_York',
  () => new Date(2026, 2, 9).getTime() - new Date(2026, 2, 8).getTime() === 23 * 3_600_000,
  () => {
    const cases: Array<[from: string, to: string, expected: number]> = [
      ['2026-11-10', '2026-11-11', 1],
      ['2026-02-28', '2026-03-01', 1],
      ['2025-12-31', '2026-01-01', 1],
      ['2026-11-11', '2026-11-10', -1],
      ['2026-03-07', '2026-03-09', 2], // 夏時間開始をまたぐ
      ['2026-03-08', '2026-03-09', 1], // 23 時間しかない日
      ['2026-10-31', '2026-11-02', 2], // 夏時間終了（25 時間の日）をまたぐ
    ];
    for (const [from, to, expected] of cases) check(`${from} → ${to}`, diffInDays(from, to), expected);
  },
);

// --- toLocalDateKey（日本時間に固定。UTC の日付に戻すと、朝 9 時前とカレンダーで 1 日ずれる）
console.log('\ntoLocalDateKey（Asia/Tokyo）');
withTimeZone(
  'Asia/Tokyo',
  () => new Date('2026-11-10T23:00:00Z').getHours() === 8,
  () => {
    check('日本時間 11/11 8:00（UTC 11/10 23:00）', toLocalDateKey(new Date('2026-11-10T23:00:00Z')), '2026-11-11');
    check('日本時間 11/11 0:00 ちょうど', toLocalDateKey(new Date('2026-11-11T00:00:00+09:00')), '2026-11-11');
    check('日本時間 11/10 23:59', toLocalDateKey(new Date('2026-11-10T23:59:00+09:00')), '2026-11-10');
    check('カレンダーのマス new Date(2026, 10, 11)', toLocalDateKey(new Date(2026, 10, 11)), '2026-11-11');
    check('月初 new Date(2026, 11, 1)', toLocalDateKey(new Date(2026, 11, 1)), '2026-12-01');
  },
);

if (failures > 0) {
  console.error(`\n${failures} 件失敗しました`);
  process.exit(1);
}
console.log('\nOK');
