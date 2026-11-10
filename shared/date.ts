// ローカル時刻の日付を YYYY-MM-DD で返す（UTC ではなく実行環境のタイムゾーン）。
export function toLocalDateKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// YYYY-MM-DD 形式の 2 つの日付の差（to − from）を日数で返す。
// タイムゾーンや夏時間の影響を受けないよう、UTC の暦日として計算する。
export function diffInDays(fromKey: string, toKey: string) {
  const toUtc = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(toKey) - toUtc(fromKey)) / 86_400_000);
}
