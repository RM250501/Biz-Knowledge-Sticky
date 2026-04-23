import { useState, useEffect } from 'react';

export function useCurrentTime() {
  // 現在時刻を state で保持し、1 秒ごとに UI を再描画できるようにする。
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // 1 秒ごとに時刻を更新。
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    // アンマウント時にタイマーを解放してリークを防止。
    return () => clearInterval(timer);
  }, []);

  return currentTime;
}
