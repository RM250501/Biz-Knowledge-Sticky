import type { RequestHandler } from 'express';

type Bucket = { count: number; resetAt: number };

// IP ごとに一定時間内のリクエスト数を制限する、メモリ上の簡易レート制限。
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }): RequestHandler {
  const buckets = new Map<string, Bucket>();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    // 期限切れのエントリを掃除して、Map が増え続けないようにする。
    if (buckets.size > 1000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      res.status(429).json({ error: 'too_many_requests' });
      return;
    }
    next();
  };
}
