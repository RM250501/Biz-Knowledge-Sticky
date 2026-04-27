import React, { useState, useEffect, useCallback } from 'react';
import {
  Navigation,
  CloudSun,
  RefreshCw,
  AlertTriangle,
  Settings2,
  LocateFixed,
  MapPin,
  Search,
  Wind,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
  ExternalLink,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGeolocation } from '../hooks/useGeolocation';
import { cn } from '../lib/utils';
import { getCoordinatesByRegionName, getPrefCityLabel, getWeatherBundle } from '../services/weatherService';
import { CurrentWeather, ForecastItem } from '../types';

const FALLBACK_LOCATION = { lat: 35.6804, lon: 139.769 }; // 東京駅
const WEATHER_SETTINGS_KEY = 'biz_weather_settings_v1';

export const LocalModule = () => {
  // ブラウザから取得した座標（または取得エラー）。
  const { location, error: geoError } = useGeolocation();
  // 表示中の地域ラベル。
  const [address, setAddress] = useState<string>("位置情報を取得中...");
  const [weather, setWeather] = useState<CurrentWeather>({
    temp: 22,
    condition: '晴れ',
    humidity: 45,
    windSpeed: 2,
    precipitationProb: 0,
    precipitationMm: 0,
    updatedAt: new Date().toISOString(),
  });
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [regionMode, setRegionMode] = useState<'gps' | 'custom'>('gps');
  const [customQuery, setCustomQuery] = useState('');
  const [customCoords, setCustomCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isApplyingSettings, setIsApplyingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const persistSettings = useCallback(
    (nextMode: 'gps' | 'custom', query: string, coords: { lat: number; lon: number } | null) => {
      const payload = {
        mode: nextMode,
        query,
        lat: coords?.lat ?? null,
        lon: coords?.lon ?? null,
      };
      localStorage.setItem(WEATHER_SETTINGS_KEY, JSON.stringify(payload));
    },
    []
  );

  useEffect(() => {
    const raw = localStorage.getItem(WEATHER_SETTINGS_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as {
        mode?: 'gps' | 'custom';
        query?: string;
        lat?: number | null;
        lon?: number | null;
      };
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

  const refreshData = useCallback(async (lat?: number, lon?: number, force = false, mode?: 'gps' | 'custom') => {
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

  useEffect(() => {
    if (regionMode === 'custom' && customCoords) {
      // タブ表示時は手動更新ボタンと同等の強制再取得を行う。
      refreshData(customCoords.lat, customCoords.lon, true, 'custom');
      return;
    }
    if (location || geoError) {
      // 位置情報が取れない場合は東京座標にフォールバックして取得。
      // タブ表示時は手動更新ボタンと同等の強制再取得を行う。
      refreshData(undefined, undefined, true, 'gps');
    }
  }, [location, geoError, regionMode, customCoords, refreshData]);

  const applyRegionSettings = async () => {
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
      const message = error instanceof Error ? error.message : '地域設定の適用に失敗しました。';
      setSettingsError(message);
    } finally {
      setIsApplyingSettings(false);
    }
  };

  const isUsingCustomRegion = regionMode === 'custom' && !!customCoords;
  const weatherRegionLabel = isUsingCustomRegion
    ? address
    : geoError
      ? '東京都 千代田区（位置情報フォールバック）'
      : address;
  const waterLevelPercent = Math.min(100, Math.round((weather.precipitationMm / 20) * 100));
  const forecastChartData = forecast.map((item) => ({
    timeLabel: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    precipitationMm: item.precipitationMm,
    precipitationProb: item.precipitationProb,
    temp: item.temp,
    condition: item.condition,
  }));

  const getConditionIcon = (condition: string, size = 24) => {
    if (condition.includes('雷')) return <CloudLightning size={size} />;
    if (condition.includes('雪')) return <CloudSnow size={size} />;
    if (condition.includes('雨')) return <CloudRain size={size} />;
    if (condition.includes('霧')) return <CloudFog size={size} />;
    if (condition.includes('曇')) return <Cloud size={size} />;
    if (condition.includes('快晴') || condition.includes('晴')) return <Sun size={size} />;
    return <CloudSun size={size} />;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CloudSun className="text-pink-600" /> お天気情報
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-8">Weather Focus Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-pink-600"
            title="地域設定"
          >
            <Settings2 size={18} />
          </button>
          <button 
            onClick={() => refreshData(undefined, undefined, true)}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-pink-600 disabled:opacity-50"
          >
            <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
            <Navigation size={12} className="text-pink-500" /> {address}
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">表示地域の設定</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Weather Source</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => setRegionMode('gps')}
              className={cn(
                'rounded-xl border px-4 py-3 text-left transition-colors',
                regionMode === 'gps'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              <p className="text-sm font-black flex items-center gap-2"><LocateFixed size={14} /> 現在地を使う</p>
              <p className="text-xs mt-1">ブラウザ位置情報に基づいて表示します。</p>
            </button>
            <button
              onClick={() => setRegionMode('custom')}
              className={cn(
                'rounded-xl border px-4 py-3 text-left transition-colors',
                regionMode === 'custom'
                  ? 'border-pink-300 bg-pink-50 text-pink-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              <p className="text-sm font-black flex items-center gap-2"><MapPin size={14} /> 地域を指定する</p>
              <p className="text-xs mt-1">都道府県名・市区名で天気表示先を切り替えます。</p>
            </button>
          </div>

          {regionMode === 'custom' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">指定地域</label>
              <div className="flex gap-2">
                <input
                  value={customQuery}
                  onChange={(event) => setCustomQuery(event.target.value)}
                  placeholder="例: 大阪市 / 福岡県福岡市"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
                <button
                  onClick={applyRegionSettings}
                  disabled={isApplyingSettings}
                  className="rounded-lg bg-pink-600 text-white px-3 py-2 text-sm font-bold hover:bg-pink-700 disabled:opacity-50 inline-flex items-center gap-1"
                >
                  <Search size={14} /> 適用
                </button>
              </div>
              {customCoords && (
                <p className="text-xs text-gray-500">
                  保存済み座標: 緯度 {customCoords.lat.toFixed(3)} / 経度 {customCoords.lon.toFixed(3)}
                </p>
              )}
            </div>
          )}

          {regionMode === 'gps' && (
            <button
              onClick={applyRegionSettings}
              disabled={isApplyingSettings}
              className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              現在地設定を適用
            </button>
          )}

          {settingsError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{settingsError}</p>
          )}
        </div>
      )}

      {!isUsingCustomRegion && geoError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5" />
          <span>現在地を取得できなかったため、東京エリアの情報を表示しています。</span>
        </div>
      )}

      {fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 天気カード */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Current Weather</p>
                <h3 className="text-4xl font-black">{weather.temp}°C</h3>
                <p className="text-[11px] font-bold opacity-85 mt-1">対象地域: {weatherRegionLabel}</p>
                <p className="text-[11px] font-bold opacity-75 mt-1">更新: {new Date(weather.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="group-hover:scale-110 transition-transform">
                {getConditionIcon(weather.condition, 48)}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-bold">
              <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">状態: {weather.condition}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">湿度: {weather.humidity}%</span>
              <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1"><Wind size={12} /> 風速: {weather.windSpeed}m/s</span>
              <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1"><Droplets size={12} /> 降水: {weather.precipitationProb}% / {weather.precipitationMm}mm</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <CloudSun size={120} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">降水量レベル</h3>
          <p className="text-xs text-gray-500 mb-4">現在降水量: {weather.precipitationMm}mm/h</p>
          <div className="flex items-end gap-6">
            <div className="h-40 w-16 rounded-xl border border-blue-100 bg-blue-50 relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-300 transition-all duration-500"
                style={{ height: `${waterLevelPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-700">
                {waterLevelPercent}%
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2">
                <span>0mm</span>
                <span>10mm</span>
                <span>20mm+</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-300 to-blue-600 transition-all duration-500"
                  style={{ width: `${waterLevelPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                1時間降水量を基準にした目安です。外出前はレーダーで短時間の雨雲変化も確認してください。
              </p>
              <a
                href="https://www.jma.go.jp/bosai/nowc/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                気象庁 雨雲レーダーを開く <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">本日の予報（3時間ごと）</h3>
        <p className="text-xs text-gray-500 mb-4">対象地域: {weatherRegionLabel}</p>
        {forecastChartData.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="relative h-64 w-full">
                <div className="pointer-events-none absolute left-9 right-3 top-2 z-10 flex items-center justify-between text-blue-700">
                  {forecastChartData.map((item) => (
                    <div key={`${item.timeLabel}-icon`} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 shadow-sm border border-slate-100">
                      {getConditionIcon(item.condition, 14)}
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={forecastChartData}
                    margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="precipitationFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.15} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis unit="mm" tick={{ fontSize: 11, fill: '#64748b' }} width={40} />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'precipitationMm') return [`${value} mm`, '降水量'];
                        if (name === 'precipitationProb') return [`${value}%`, '降水確率'];
                        if (name === 'temp') return [`${value}°C`, '気温'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `時刻: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="precipitationMm"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#precipitationFill)"
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                横軸: 時間 / 縦軸: 降水量(mm)
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={forecastChartData}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fb923c" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity={0.15} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: '#9a3412' }} />
                    <YAxis unit="°C" tick={{ fontSize: 11, fill: '#9a3412' }} width={40} />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'temp') return [`${value}°C`, '気温'];
                        if (name === 'precipitationMm') return [`${value} mm`, '降水量'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `時刻: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke="#ea580c"
                      strokeWidth={3}
                      fill="url(#temperatureFill)"
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-orange-700 mt-2">
                横軸: 時間 / 縦軸: 気温(°C)
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">予報データを取得中です。</p>
        )}
      </div>
    </div>
  );
};
