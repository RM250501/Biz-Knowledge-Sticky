import React, { useState } from 'react';
import { AlertTriangle, CloudSun, Navigation, RefreshCw, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWeatherRegion } from '../hooks/useWeatherRegion';
import { WeatherSettingsPanel } from './weather/WeatherSettingsPanel';
import { CurrentWeatherCard, PrecipitationLevelCard } from './weather/CurrentWeatherCards';
import { ForecastCharts } from './weather/ForecastCharts';

export const LocalModule = () => {
  const region = useWeatherRegion();
  const [showSettings, setShowSettings] = useState(false);

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
            onClick={region.refresh}
            disabled={region.isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-pink-600 disabled:opacity-50"
            title="更新"
          >
            <RefreshCw size={18} className={cn(region.isRefreshing && 'animate-spin')} />
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
            <Navigation size={12} className="text-pink-500" /> {region.address}
          </div>
        </div>
      </div>

      {showSettings && (
        <WeatherSettingsPanel
          regionMode={region.regionMode}
          onRegionModeChange={region.setRegionMode}
          customQuery={region.customQuery}
          onCustomQueryChange={region.setCustomQuery}
          customCoords={region.customCoords}
          isApplying={region.isApplyingSettings}
          error={region.settingsError}
          onApply={region.applyRegionSettings}
        />
      )}

      {region.geoFallback && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5" />
          <span>現在地を取得できなかったため、東京エリアの情報を表示しています。</span>
        </div>
      )}

      {region.fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{region.fetchError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CurrentWeatherCard weather={region.weather} regionLabel={region.regionLabel} />
        <PrecipitationLevelCard precipitationMm={region.weather.precipitationMm} />
      </div>

      <ForecastCharts forecast={region.forecast} regionLabel={region.regionLabel} />
    </div>
  );
};
