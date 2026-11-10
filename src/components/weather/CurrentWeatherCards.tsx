import React from 'react';
import { CloudSun, Droplets, ExternalLink, Wind } from 'lucide-react';
import type { CurrentWeather } from '../../types';
import { WeatherConditionIcon } from './WeatherConditionIcon';

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const CurrentWeatherCard = ({ weather, regionLabel }: { weather: CurrentWeather; regionLabel: string }) => (
  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Current Weather</p>
          <h3 className="text-4xl font-black">{weather.temp}°C</h3>
          <p className="text-[11px] font-bold opacity-85 mt-1">対象地域: {regionLabel}</p>
          <p className="text-[11px] font-bold opacity-75 mt-1">更新: {formatTime(weather.updatedAt)}</p>
        </div>
        <div className="group-hover:scale-110 transition-transform">
          <WeatherConditionIcon condition={weather.condition} size={48} />
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
);

// 1時間降水量 20mm を満水として水位で表す。
export const PrecipitationLevelCard = ({ precipitationMm }: { precipitationMm: number }) => {
  const levelPercent = Math.min(100, Math.round((precipitationMm / 20) * 100));
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">降水量レベル</h3>
      <p className="text-xs text-gray-500 mb-4">現在降水量: {precipitationMm}mm/h</p>
      <div className="flex items-end gap-6">
        <div className="h-40 w-16 rounded-xl border border-blue-100 bg-blue-50 relative overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-300 transition-all duration-500"
            style={{ height: `${levelPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-700">
            {levelPercent}%
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
              style={{ width: `${levelPercent}%` }}
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
  );
};
