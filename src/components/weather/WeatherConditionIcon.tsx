import React from 'react';
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun } from 'lucide-react';

// 天気の文言からアイコンを選ぶ。
export const WeatherConditionIcon = ({ condition, size = 24 }: { condition: string; size?: number }) => {
  if (condition.includes('雷')) return <CloudLightning size={size} />;
  if (condition.includes('雪')) return <CloudSnow size={size} />;
  if (condition.includes('雨')) return <CloudRain size={size} />;
  if (condition.includes('霧')) return <CloudFog size={size} />;
  if (condition.includes('曇')) return <Cloud size={size} />;
  if (condition.includes('晴')) return <Sun size={size} />;
  return <CloudSun size={size} />;
};
