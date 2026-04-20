import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, CloudSun, Newspaper, RefreshCw } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { cn } from '../lib/utils';
import { getActualLocalInfo } from '../services/geminiService';

export const LocalModule = () => {
  const { location, error: geoError } = useGeolocation();
  const [address, setAddress] = useState<string>("位置情報を取得中...");
  const [weather, setWeather] = useState({ temp: 22, condition: "晴れ", humidity: 45 });
  const [localNews, setLocalNews] = useState<{title: string, source: string}[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = useCallback(async (lat?: number, lon?: number) => {
    const targetLat = typeof lat === 'number' ? lat : location?.lat;
    const targetLon = typeof lon === 'number' ? lon : location?.lon;

    if (targetLat === undefined || targetLon === undefined) return;
    
    setIsRefreshing(true);
    try {
      const data = await getActualLocalInfo(targetLat, targetLon);
      if (data) {
        setAddress(data.address);
        setWeather(data.weather);
        setLocalNews(data.news);
      }
    } catch (error) {
      console.error("Failed to fetch local info:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [location]);

  useEffect(() => {
    if (location) {
      refreshData(location.lat, location.lon);
    } else if (geoError) {
      setAddress("位置情報の取得に失敗しました（デフォルト: 東京）");
    }
  }, [location, geoError, refreshData]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CloudSun className="text-pink-600" /> お天気情報
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-8">Your Neighborhood Insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={refreshData}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Card */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Current Weather</p>
                <h3 className="text-4xl font-black">{weather.temp}°C</h3>
              </div>
              <CloudSun size={48} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">状態: {weather.condition}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">湿度: {weather.humidity}%</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <CloudSun size={120} />
          </div>
        </div>

        {/* Local News Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Newspaper size={14} className="text-pink-500" /> 周辺のニュース
          </h3>
          <div className="space-y-4 flex-1">
            {localNews.map((news, i) => (
              <div key={i} className="border-b border-gray-50 pb-3 last:border-0 group">
                <p className="text-sm font-bold text-gray-800 group-hover:text-pink-600 cursor-pointer transition-colors mb-1">
                  {news.title}
                </p>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{news.source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-pink-50 rounded-2xl border border-pink-100">
        <h4 className="text-sm font-black text-pink-700 uppercase mb-3 flex items-center gap-2">
          <MapPin size={14} /> 周辺スポット情報
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {['コワーキング', 'カフェ', 'コンビニ'].map(spot => (
            <div key={spot} className="bg-white p-3 rounded-xl text-center shadow-sm border border-pink-100 hover:border-pink-300 transition-colors cursor-pointer group">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1 group-hover:text-pink-500">{spot}</p>
              <p className="text-xs font-black text-pink-600">検索する</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
