// ローカル時刻の日付を YYYY-MM-DD で返す（UTC ではなく実行環境のタイムゾーン）。
export function toLocalDateKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
