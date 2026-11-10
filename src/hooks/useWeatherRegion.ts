import { useCallback, useEffect, useState } from 'react';
import { useGeolocation } from './useGeolocation';
import { getCoordinatesByRegionName, getPrefCityLabel, getWeatherBundle } from '../services/weatherService';
import type { CurrentWeather, ForecastItem } from '../types';

export type RegionMode = 'gps' | 'custom';
type Coords = { lat: number; lon: number };

const FALLBACK_LOCATION: Coords = { lat: 35.6804, lon: 139.769 }; // 東京駅
const WEATHER_SETTINGS_KEY = 'biz_weather_settings_v1';

const INITIAL_WEATHER: CurrentWeather = {
  temp: 22,
  condition: '晴れ',
  humidity: 45,
  windSpeed: 2,
  precipitationProb: 0,
  precipitationMm: 0,
  updatedAt: new Date().toISOString(),
};

function persistSettings(mode: RegionMode, query: string, coords: Coords | null) {
  try {
    localStorage.setItem(
      WEATHER_SETTINGS_KEY,
      JSON.stringify({ mode, query, lat: coords?.lat ?? null, lon: coords?.lon ?? null }),
    );
  } catch (error) {
    console.warn('Failed to save weather settings:', error);
  }
}

// 表示地域（現在地 / 指定地域）の設定と、天気データの取得をまとめる。
export function useWeatherRegion() {
  const { location, error: geoError } = useGeolocation();
  const [address, setAddress] = useState('位置情報を取得中...');
  const [weather, setWeather] = useState<CurrentWeather>(INITIAL_WEATHER);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [regionMode, setRegionMode] = useState<RegionMode>('gps');
  const [customQuery, setCustomQuery] = useState('');
  const [customCoords, setCustomCoords] = useState<Coords | null>(null);
  const [isApplyingSettings, setIsApplyingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // 保存済みの地域設定を復元する。
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WEATHER_SETTINGS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { mode?: RegionMode; query?: string; lat?: number | null; lon?: number | null };
      if (saved.mode === 'custom') {
        setRegionMode('custom');
        setCustomQuery(saved.query || '');
        if (typeof saved.lat === 'number' && typeof saved.lon === 'number') {
          setCustomCoords({ lat: saved.lat, lon: saved.lon });
        }
      }
    } catch (error) {
      console.error('Failed to parse weather settings:', error);
    }
  }, []);

  const refreshData = useCallback(async (lat?: number, lon?: number, force = false, mode?: RegionMode) => {
    const activeMode = mode || regionMode;
    const selectedCoords = activeMode === 'custom' ? customCoords : null;
    const targetLat = typeof lat === 'number' ? lat : (selectedCoords?.lat ?? location?.lat ?? FALLBACK_LOCATION.lat);
    const targetLon = typeof lon === 'number' ? lon : (selectedCoords?.lon ?? location?.lon ?? FALLBACK_LOCATION.lon);

    setIsRefreshing(true);
    setFetchError(null);
    try {
      const [weatherData, regionLabel] = await Promise.all([
        getWeatherBundle(targetLat, targetLon, { force }),
        getPrefCityLabel(targetLat, targetLon),
      ]);
      setWeather(weatherData.current);
      setForecast(weatherData.forecast);
      setAddress(activeMode === 'custom' ? `${regionLabel}（設定地域）` : regionLabel);
    } catch (error) {
      console.error('Failed to fetch weather info:', error);
      setFetchError('天気情報の更新に失敗しました。時間をおいて再試行してください。');
    } finally {
      setIsRefreshing(false);
    }
  }, [location, regionMode, customCoords]);

  // タブ表示時・設定変更時は強制再取得する。位置情報が取れない場合は東京にフォールバックする。
  useEffect(() => {
    if (regionMode === 'custom' && customCoords) {
      refreshData(customCoords.lat, customCoords.lon, true, 'custom');
      return;
    }
    if (location || geoError) {
      refreshData(undefined, undefined, true, 'gps');
    }
  }, [location, geoError, regionMode, customCoords, refreshData]);

  const applyRegionSettings = useCallback(async () => {
    setIsApplyingSettings(true);
    setSettingsError(null);
    try {
      if (regionMode === 'gps') {
        setCustomCoords(null);
        persistSettings('gps', '', null);
        await refreshData(undefined, undefined, true, 'gps');
        return;
      }

      let nextCoords = customCoords;
      if (customQuery.trim()) {
        const resolved = await getCoordinatesByRegionName(customQuery);
        nextCoords = { lat: resolved.lat, lon: resolved.lon };
        setCustomCoords(nextCoords);
      }
      if (!nextCoords) {
        throw new Error('地域名を入力して検索してください。');
      }

      persistSettings('custom', customQuery.trim(), nextCoords);
      await refreshData(nextCoords.lat, nextCoords.lon, true, 'custom');
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : '地域設定の適用に失敗しました。');
    } finally {
      setIsApplyingSettings(false);
    }
  }, [regionMode, customCoords, customQuery, refreshData]);

  const isUsingCustomRegion = regionMode === 'custom' && !!customCoords;
  const regionLabel = isUsingCustomRegion
    ? address
    : geoError
      ? '東京都 千代田区（位置情報フォールバック）'
      : address;

  return {
    address,
    regionLabel,
    weather,
    forecast,
    isRefreshing,
    fetchError,
    geoFallback: !isUsingCustomRegion && !!geoError,
    regionMode,
    setRegionMode,
    customQuery,
    setCustomQuery,
    customCoords,
    isApplyingSettings,
    settingsError,
    refresh: () => refreshData(undefined, undefined, true),
    applyRegionSettings,
  };
}
