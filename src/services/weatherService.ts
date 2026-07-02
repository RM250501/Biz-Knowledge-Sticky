import { ForecastItem, WeatherAlert, WeatherBundle } from '../types';

type WeatherResponse = {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    precipitation: number[];
  };
};

type FetchWeatherOptions = {
  force?: boolean;
};

type NominatimReverseResponse = {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    municipality?: string;
    county?: string;
    city_district?: string;
    suburb?: string;
  };
};

type NominatimSearchItem = {
  lat: string;
  lon: string;
  display_name?: string;
  name?: string;
};

type JmaWarningSnapshot = {
  reportDatetime: string;
  areaTypes: Array<{
    areas: Array<{
      code: string;
      warnings: Array<{
        code: string;
        status: string;
      }>;
    }>;
  }>;
};

type JmaAreaMaster = {
  centers?: Record<string, { name: string }>;
  offices?: Record<string, { name: string }>;
  class10s?: Record<string, { name: string }>;
  class15s?: Record<string, { name: string }>;
  class20s?: Record<string, { name: string }>;
};

const CACHE_PREFIX = 'biz_weather_cache_v1';
const CACHE_TTL_MS = 20 * 60 * 1000;

function extractPrefectureFromDisplayName(displayName: string): string | null {
  const tokens = displayName.split(',').map((token) => token.trim());
  const prefecture = tokens.find((token) => /[都道府県]$/.test(token));
  return prefecture || null;
}

function extractCityLikeName(address?: NominatimReverseResponse['address']): string | null {
  if (!address) return null;
  return (
    address.city ||
    address.town ||
    address.municipality ||
    address.county ||
    address.city_district ||
    address.suburb ||
    null
  );
}

export async function getPrefCityLabel(lat: number, lon: number): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());
  url.searchParams.set('accept-language', 'ja');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed with status ${response.status}`);
    }

    const data = (await response.json()) as NominatimReverseResponse;
    const prefecture = data.display_name ? extractPrefectureFromDisplayName(data.display_name) : null;
    const cityLike = extractCityLikeName(data.address);

    if (prefecture && cityLike) {
      return `${prefecture} ${cityLike}`;
    }
    if (prefecture) {
      return prefecture;
    }
    if (cityLike) {
      return cityLike;
    }
  } catch (error) {
    console.error('Failed to resolve prefecture/city label:', error);
  }

  return `緯度 ${lat.toFixed(3)} / 経度 ${lon.toFixed(3)}`;
}

export async function getCoordinatesByRegionName(query: string): Promise<{ lat: number; lon: number; label: string }> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    throw new Error('Region query is empty');
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', normalizedQuery);
  url.searchParams.set('accept-language', 'ja');
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Region search failed with status ${response.status}`);
  }

  const result = (await response.json()) as NominatimSearchItem[];
  if (!Array.isArray(result) || result.length === 0) {
    throw new Error('No region matched the query');
  }

  const first = result[0];
  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error('Invalid coordinates from region search');
  }

  const prefCityLabel = first.display_name ? extractPrefectureFromDisplayName(first.display_name) : null;
  return {
    lat,
    lon,
    label: first.name || prefCityLabel || normalizedQuery,
  };
}

function toConditionLabel(weatherCode: number): string {
  if (weatherCode === 0) return '快晴';
  if (weatherCode === 1) return '晴れ';
  if (weatherCode === 2) return '薄曇り';
  if (weatherCode === 3) return '曇り';
  if (weatherCode === 45 || weatherCode === 48) return '霧';
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return '霧雨';
  if ([61, 63, 65, 66, 67].includes(weatherCode)) return '雨';
  if ([71, 73, 75, 77].includes(weatherCode)) return '雪';
  if ([80, 81, 82].includes(weatherCode)) return 'にわか雨';
  if ([85, 86].includes(weatherCode)) return 'にわか雪';
  if ([95, 96, 99].includes(weatherCode)) return '雷雨';
  return '不明';
}

function getCacheKey(lat: number, lon: number): string {
  const normalizedLat = lat.toFixed(2);
  const normalizedLon = lon.toFixed(2);
  return `${CACHE_PREFIX}_${normalizedLat}_${normalizedLon}`;
}

function getCachedWeather(cacheKey: string): WeatherBundle | null {
  const raw = localStorage.getItem(cacheKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { expiresAt: number; data: WeatherBundle };
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error('Failed to parse weather cache:', error);
    localStorage.removeItem(cacheKey);
    return null;
  }
}

function setCachedWeather(cacheKey: string, data: WeatherBundle) {
  const payload = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data,
  };
  localStorage.setItem(cacheKey, JSON.stringify(payload));
}

function toJmaAreaName(areaCode: string, areaMaster: JmaAreaMaster): string {
  return (
    areaMaster.class20s?.[areaCode]?.name ||
    areaMaster.class15s?.[areaCode]?.name ||
    areaMaster.class10s?.[areaCode]?.name ||
    areaMaster.offices?.[areaCode]?.name ||
    areaMaster.centers?.[areaCode]?.name ||
    `地域コード ${areaCode}`
  );
}

function toJmaAlertLevel(status: string): WeatherAlert['level'] {
  if (status.includes('発表')) return 'warning';
  if (status.includes('継続')) return 'watch';
  return 'info';
}

async function fetchJmaAlerts(): Promise<WeatherAlert[]> {
  try {
    // Promise.allSettled() で部分的な失敗にも対応（JMA API が不安定なため）
    const [warningResponse, areaResponse] = await Promise.allSettled([
      fetch('https://www.jma.go.jp/bosai/warning/data/warning/map.json'),
      fetch('https://www.jma.go.jp/bosai/common/const/area.json'),
    ]);

    // 両方が成功したケースのみ処理する
    if (warningResponse.status !== 'fulfilled' || areaResponse.status !== 'fulfilled') {
      console.warn('Partial JMA API failure; returning empty alerts');
      return [];
    }

    if (!warningResponse.value.ok || !areaResponse.value.ok) {
      throw new Error('Failed to fetch JMA warning data');
    }

    const warningData = (await warningResponse.value.json()) as JmaWarningSnapshot[];
    const areaMaster = (await areaResponse.value.json()) as JmaAreaMaster;
    const latestSnapshot = warningData[0];

    if (!latestSnapshot || !Array.isArray(latestSnapshot.areaTypes)) {
      return [];
    }

    const grouped = new Map<string, { status: string; areas: string[] }>();

    for (const areaType of latestSnapshot.areaTypes) {
      for (const area of areaType.areas || []) {
        const areaName = toJmaAreaName(area.code, areaMaster);
        for (const warning of area.warnings || []) {
          const status = warning.status || '';
          if (status.includes('解除')) continue;

          const key = `${warning.code}:${status}`;
          const current = grouped.get(key);
          if (current) {
            if (current.areas.length < 3) {
              current.areas.push(areaName);
            }
            continue;
          }

          grouped.set(key, { status, areas: [areaName] });
        }
      }
    }

    const alerts = Array.from(grouped.entries())
      .map(([key, value]) => {
        const [code] = key.split(':');
        const areaSummary = value.areas.join(' / ');
        return {
          level: toJmaAlertLevel(value.status),
          title: `気象庁 警報・注意報コード ${code} (${value.status})`,
          detail: `${areaSummary} ほかで発表されています。`,
        } as WeatherAlert;
      })
      .slice(0, 6);

    return alerts;
  } catch (error) {
    console.error('Error fetching JMA alerts:', error);
    return [];
  }
}

function buildForecast(hourly: WeatherResponse['hourly']): ForecastItem[] {
  const now = Date.now();
  const candidates: ForecastItem[] = [];

  for (let i = 0; i < hourly.time.length; i += 1) {
    const time = hourly.time[i];
    if (!time) continue;
    const ts = new Date(time).getTime();
    if (Number.isNaN(ts) || ts < now) continue;

    candidates.push({
      time,
      temp: Math.round(hourly.temperature_2m[i] ?? 0),
      condition: toConditionLabel(hourly.weather_code[i] ?? -1),
      precipitationProb: Math.round(hourly.precipitation_probability[i] ?? 0),
      precipitationMm: Math.round((hourly.precipitation[i] ?? 0) * 10) / 10,
    });
  }

  return candidates.filter((_, index) => index % 3 === 0).slice(0, 6);
}

export async function getWeatherBundle(
  lat: number,
  lon: number,
  options: FetchWeatherOptions = {}
): Promise<WeatherBundle> {
  const cacheKey = getCacheKey(lat, lon);

  if (!options.force) {
    const cached = getCachedWeather(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
    hourly: 'temperature_2m,weather_code,precipitation_probability,precipitation',
    timezone: 'auto',
    forecast_days: '2',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Weather API failed with status ${response.status}`);
  }

  const data = (await response.json()) as WeatherResponse;
  const forecast = buildForecast(data.hourly);
  let alerts: WeatherAlert[] = [];
  try {
    alerts = await fetchJmaAlerts();
  } catch (error) {
    console.error('Failed to fetch JMA alerts:', error);
    alerts = [
      {
        level: 'info',
        title: '警戒情報を取得できませんでした',
        detail: '気象庁の警報データ取得に失敗しました。時間をおいて再試行してください。',
      },
    ];
  }

  if (alerts.length === 0) {
    alerts = [
      {
        level: 'info',
        title: '発表中の警報・注意報はありません',
        detail: '最新の気象庁データでは、発表・継続中の項目は確認されませんでした。',
      },
    ];
  }

  const weatherBundle: WeatherBundle = {
    current: {
      temp: Math.round(data.current.temperature_2m),
      condition: toConditionLabel(data.current.weather_code),
      humidity: Math.round(data.current.relative_humidity_2m),
      windSpeed: Math.round(data.current.wind_speed_10m),
      precipitationProb: forecast[0]?.precipitationProb ?? 0,
      precipitationMm: Math.round((data.current.precipitation ?? 0) * 10) / 10,
      updatedAt: new Date().toISOString(),
    },
    forecast,
    alerts,
  };

  setCachedWeather(cacheKey, weatherBundle);
  return weatherBundle;
}
