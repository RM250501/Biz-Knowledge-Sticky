import { Router } from 'express';
import { deleteAssignment, getAssignment, getUsedTitles, insertAssignment, pruneBefore } from './db';
import {
  THEME_COUNT,
  buildFallbackTrivia,
  generateAITrivia,
  hashString,
  sanitizeTrivia,
  verifyAITrivia,
} from './generator';
import type { Trivia } from './types';
import { toLocalDateKey } from '../../shared/date';

const RETENTION_DAYS = 45;
const MAX_ATTEMPTS = 5;

type AssignmentResult = {
  status: number;
  body: Record<string, unknown>;
};

function normalizeTitle(input: string) {
  return (input || '').trim().replace(/\s+/g, '');
}

function parseDateKey(value: unknown) {
  const text = String(value || '');
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : toLocalDateKey();
}

// DB 書き込みと AI 生成を直列化し、同じ日に同じタイトルが配られるのを防ぐ。
let writeQueue: Promise<unknown> = Promise.resolve();

async function assignNewTrivia(browserId: string, dateKey: string, refresh: boolean): Promise<Trivia> {
  if (refresh) {
    await deleteAssignment(browserId, dateKey);
  } else {
    // 同じブラウザの同時リクエストが先に割り当て済みなら、それを返す。
    const existing = await getAssignment(browserId, dateKey);
    if (existing) return existing;
  }

  const usedTitles = await getUsedTitles(dateKey);
  const usedNormalized = new Set(usedTitles.map(normalizeTitle));
  const variantIndex = hashString(`${dateKey}-${browserId}`) % THEME_COUNT;

  let assigned: Trivia | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS && !assigned; attempt += 1) {
    try {
      const aiTrivia = await generateAITrivia(dateKey, browserId, usedTitles, variantIndex, attempt);
      const normalizedTitle = normalizeTitle(aiTrivia?.title || '');
      if (!normalizedTitle || usedNormalized.has(normalizedTitle)) continue;

      const candidate = sanitizeTrivia(aiTrivia, dateKey, `${browserId.slice(-6)}-${attempt}`);
      const factCheck = await verifyAITrivia(candidate);
      if (factCheck.approved) assigned = candidate;
    } catch {
      // 別のテーマで再試行する。
    }
  }

  const trivia = assigned ?? buildFallbackTrivia(dateKey, browserId);
  await insertAssignment(trivia, browserId);

  const cutoff = new Date(dateKey);
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  await pruneBefore(toLocalDateKey(cutoff));

  return trivia;
}

async function resolveTriviaAssignment(browserId: string, dateKey: string, refresh: boolean): Promise<AssignmentResult> {
  if (!browserId) {
    return { status: 400, body: { error: 'browserId is required' } };
  }

  if (!refresh) {
    try {
      const existing = await getAssignment(browserId, dateKey);
      if (existing) return { status: 200, body: { trivia: existing, source: 'cached' } };
    } catch (error) {
      console.error('[trivia] failed checking existing assignment:', error);
    }
  }

  const job = writeQueue.then(() => assignNewTrivia(browserId, dateKey, refresh));
  writeQueue = job.catch(() => undefined);

  try {
    const trivia = await job;
    return {
      status: 200,
      body: { trivia, source: trivia.id.startsWith('fallback-') ? 'fallback' : 'new' },
    };
  } catch (error) {
    console.error('[trivia] assignment failed:', error);
    return { status: 500, body: { error: 'internal_error' } };
  }
}

export const triviaRouter = Router();

triviaRouter.get('/today', async (req, res) => {
  const result = await resolveTriviaAssignment(
    String(req.query.browserId || '').trim(),
    parseDateKey(req.query.date),
    req.query.refresh === '1',
  );
  res.status(result.status).json(result.body);
});

triviaRouter.post('/assign', async (req, res) => {
  const result = await resolveTriviaAssignment(
    String(req.body?.browserId || '').trim(),
    parseDateKey(req.body?.date),
    req.body?.refresh === true,
  );
  res.status(result.status).json(result.body);
});
