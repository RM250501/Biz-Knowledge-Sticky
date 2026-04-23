import { useState, useEffect } from 'react';

export function useGeolocation() {
  // 現在地の座標（初回取得時に設定）。
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  // 位置情報が取得できない場合のエラーメッセージ。
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ブラウザが Geolocation API に未対応なら即終了。
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // ブラウザ/OS の位置情報提供元から現在地を取得。
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // アプリ側で使いやすい形に正規化して保存。
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (err) => {
        // 権限拒否やタイムアウト等のネイティブエラーを反映。
        setError(err.message);
      }
    );
  }, []);

  return { location, error };
}
