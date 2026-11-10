import React from 'react';
import { LocateFixed, MapPin, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { RegionMode } from '../../hooks/useWeatherRegion';

interface WeatherSettingsPanelProps {
  regionMode: RegionMode;
  onRegionModeChange: (mode: RegionMode) => void;
  customQuery: string;
  onCustomQueryChange: (query: string) => void;
  customCoords: { lat: number; lon: number } | null;
  isApplying: boolean;
  error: string | null;
  onApply: () => void;
}

export const WeatherSettingsPanel = ({
  regionMode,
  onRegionModeChange,
  customQuery,
  onCustomQueryChange,
  customCoords,
  isApplying,
  error,
  onApply,
}: WeatherSettingsPanelProps) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">表示地域の設定</h3>
      <span className="text-[10px] text-gray-400 font-bold uppercase">Weather Source</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <button
        onClick={() => onRegionModeChange('gps')}
        className={cn(
          'rounded-xl border px-4 py-3 text-left transition-colors',
          regionMode === 'gps' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
        )}
      >
        <p className="text-sm font-black flex items-center gap-2"><LocateFixed size={14} /> 現在地を使う</p>
        <p className="text-xs mt-1">ブラウザ位置情報に基づいて表示します。</p>
      </button>
      <button
        onClick={() => onRegionModeChange('custom')}
        className={cn(
          'rounded-xl border px-4 py-3 text-left transition-colors',
          regionMode === 'custom' ? 'border-pink-300 bg-pink-50 text-pink-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
        )}
      >
        <p className="text-sm font-black flex items-center gap-2"><MapPin size={14} /> 地域を指定する</p>
        <p className="text-xs mt-1">都道府県名・市区名で天気表示先を切り替えます。</p>
      </button>
    </div>

    {regionMode === 'custom' ? (
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">指定地域</label>
        <div className="flex gap-2">
          <input
            value={customQuery}
            onChange={(event) => onCustomQueryChange(event.target.value)}
            placeholder="例: 大阪市 / 福岡県福岡市"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
          <button
            onClick={onApply}
            disabled={isApplying}
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
    ) : (
      <button
        onClick={onApply}
        disabled={isApplying}
        className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
      >
        現在地設定を適用
      </button>
    )}

    {error && (
      <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
    )}
  </div>
);
