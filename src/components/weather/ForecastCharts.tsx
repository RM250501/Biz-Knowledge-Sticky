import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ForecastItem } from '../../types';
import { WeatherConditionIcon } from './WeatherConditionIcon';

type ChartPoint = {
  timeLabel: string;
  precipitationMm: number;
  precipitationProb: number;
  temp: number;
  condition: string;
};

const SERIES_LABELS: Record<string, (value: number) => [string, string]> = {
  precipitationMm: (v) => [`${v} mm`, '降水量'],
  precipitationProb: (v) => [`${v}%`, '降水確率'],
  temp: (v) => [`${v}°C`, '気温'],
};

const tooltipFormatter = (value: number, name: string) => SERIES_LABELS[name]?.(value) ?? [value, name];
const tooltipLabel = (label: string) => `時刻: ${label}`;

const PrecipitationChart = ({ data }: { data: ChartPoint[] }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
    <div className="relative h-64 w-full">
      <div className="pointer-events-none absolute left-9 right-3 top-2 z-10 flex items-center justify-between text-blue-700">
        {data.map((item) => (
          <div key={`${item.timeLabel}-icon`} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 shadow-sm border border-slate-100">
            <WeatherConditionIcon condition={item.condition} size={14} />
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="precipitationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis unit="mm" tick={{ fontSize: 11, fill: '#64748b' }} width={40} />
          <Tooltip formatter={tooltipFormatter} labelFormatter={tooltipLabel} />
          <Area type="monotone" dataKey="precipitationMm" stroke="#2563eb" strokeWidth={3} fill="url(#precipitationFill)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <p className="text-[11px] text-gray-500 mt-2">横軸: 時間 / 縦軸: 降水量(mm)</p>
  </div>
);

const TemperatureChart = ({ data }: { data: ChartPoint[] }) => (
  <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#ea580c" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
          <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: '#9a3412' }} />
          <YAxis unit="°C" tick={{ fontSize: 11, fill: '#9a3412' }} width={40} />
          <Tooltip formatter={tooltipFormatter} labelFormatter={tooltipLabel} />
          <Area type="monotone" dataKey="temp" stroke="#ea580c" strokeWidth={3} fill="url(#temperatureFill)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <p className="text-[11px] text-orange-700 mt-2">横軸: 時間 / 縦軸: 気温(°C)</p>
  </div>
);

export const ForecastCharts = ({ forecast, regionLabel }: { forecast: ForecastItem[]; regionLabel: string }) => {
  const data: ChartPoint[] = forecast.map((item) => ({
    timeLabel: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    precipitationMm: item.precipitationMm,
    precipitationProb: item.precipitationProb,
    temp: item.temp,
    condition: item.condition,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">本日の予報（3時間ごと）</h3>
      <p className="text-xs text-gray-500 mb-4">対象地域: {regionLabel}</p>
      {data.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <PrecipitationChart data={data} />
          <TemperatureChart data={data} />
        </div>
      ) : (
        <p className="text-sm text-gray-400">予報データを取得中です。</p>
      )}
    </div>
  );
};
