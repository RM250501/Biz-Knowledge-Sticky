import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Trivia } from '../types';

const DAILY_TRIVIA_CACHE_KEY_PREFIX = 'biz_knowledge_daily_trivia_v2';
const BROWSER_ID_KEY = 'biz_knowledge_browser_id_v1';

type DailyTriviaCache = {
  date: string;
  trivia: Trivia;
};

type LoadTriviaOptions = {
  force?: boolean;
  background?: boolean;
};

type DailyTriviaState = {
  trivia: Trivia | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetchedLabel: string;
  refreshTrivia: (options?: LoadTriviaOptions) => Promise<void>;
};

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBrowserId() {
  const existing = localStorage.getItem(BROWSER_ID_KEY);
  if (existing) return existing;

  const randomPart = Math.random().toString(36).slice(2, 10);
  const uaPart = (navigator.userAgent || 'unknown').replace(/\s+/g, '-').slice(0, 24);
  const browserId = `${uaPart}-${randomPart}`;
  localStorage.setItem(BROWSER_ID_KEY, browserId);
  return browserId;
}

function readDailyTriviaCache(cacheKey: string, todayKey: string) {
  const cachedRaw = localStorage.getItem(cacheKey);
  if (!cachedRaw) return null;

  try {
    const cached = JSON.parse(cachedRaw) as DailyTriviaCache;
    if (cached?.date === todayKey && cached?.trivia) {
      return cached.trivia;
    }
  } catch (cacheErr) {
    console.warn('Failed to parse daily trivia cache:', cacheErr);
    localStorage.removeItem(cacheKey);
  }

  return null;
}

function writeDailyTriviaCache(cacheKey: string, todayKey: string, trivia: Trivia) {
  localStorage.setItem(cacheKey, JSON.stringify({ date: todayKey, trivia } satisfies DailyTriviaCache));
}

async function requestAssignedTrivia(browserId: string, todayKey: string, force = false) {
  const response = await fetch(
    `/api/trivia/today?browserId=${encodeURIComponent(browserId)}&date=${encodeURIComponent(todayKey)}${force ? '&refresh=1' : ''}`,
    {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    }
  );

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    throw new Error(`Trivia API failed: ${response.status}${responseText ? ` / ${responseText}` : ''}`);
  }

  const data = await response.json();
  return data?.trivia as Trivia;
}

export function useDailyTrivia(): DailyTriviaState {
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedLabel, setLastFetchedLabel] = useState('');

  const cacheKey = useMemo(() => {
    if (typeof window === 'undefined') return `${DAILY_TRIVIA_CACHE_KEY_PREFIX}_ssr`;
    return `${DAILY_TRIVIA_CACHE_KEY_PREFIX}_${getBrowserId()}`;
  }, []);

  const refreshTrivia = useCallback(async ({ force = false, background = false }: LoadTriviaOptions = {}) => {
    if (background) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const todayKey = toLocalDateKey(new Date());
      const cachedTrivia = !force ? readDailyTriviaCache(cacheKey, todayKey) : null;
      if (cachedTrivia) {
        setTrivia(cachedTrivia);
        setLastFetchedLabel('今日のキャッシュを表示中');
        return;
      }

      const browserId = getBrowserId();
      const assignedTrivia = await requestAssignedTrivia(browserId, todayKey, force);
      writeDailyTriviaCache(cacheKey, todayKey, assignedTrivia);
      setTrivia(assignedTrivia);
      setLastFetchedLabel(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to fetch daily trivia:', err);
      const todayKey = toLocalDateKey(new Date());
      const cachedTrivia = readDailyTriviaCache(cacheKey, todayKey);

      if (cachedTrivia) {
        setTrivia(cachedTrivia);
        setError('通信エラーのため、保存済みの雑学を表示しています。');
      } else {
        setTrivia(null);
        setError('雑学の取得に失敗しました。少し時間をおいて再度お試しください。');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    void refreshTrivia();
  }, [refreshTrivia]);

  return {
    trivia,
    isLoading,
    isRefreshing,
    error,
    lastFetchedLabel,
    refreshTrivia,
  };
}
