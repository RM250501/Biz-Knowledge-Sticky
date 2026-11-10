// 連続ログイン日数の計算チェック。`npm run check:streak` で実行する。
import { nextLoginStreak } from '../src/lib/streak';
import { diffInDays } from '../shared/date';

const TODAY = '2026-11-11';

type Case = [name: string, prev: Parameters<typeof nextLoginStreak>[0], expected: number];

const streakCases: Case[] = [
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

const diffCases: Array<[from: string, to: string, expected: number]> = [
  ['2026-11-10', '2026-11-11', 1],
  ['2026-02-28', '2026-03-01', 1],
  ['2025-12-31', '2026-01-01', 1],
  ['2026-11-11', '2026-11-10', -1],
  ['2026-03-07', '2026-03-09', 2], // 米国の夏時間開始をまたぐ
];

let failures = 0;
const check = (label: string, got: number, expected: number) => {
  const ok = got === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'OK' : 'NG'}  ${label}: ${got}${ok ? '' : `（期待値 ${expected}）`}`);
};

console.log('nextLoginStreak');
for (const [name, prev, expected] of streakCases) check(name, nextLoginStreak(prev, TODAY), expected);

console.log('\ndiffInDays');
for (const [from, to, expected] of diffCases) check(`${from} → ${to}`, diffInDays(from, to), expected);

if (failures > 0) {
  console.error(`\n${failures} 件失敗しました`);
  process.exit(1);
}
console.log('\nOK');
