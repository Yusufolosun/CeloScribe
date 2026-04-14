/**
 * In-memory sliding window rate limiter, keyed by wallet address.
 *
 * Limits: 10 requests per 60-second window per wallet.
 *
 * Note: This implementation is per-process. In a multi-instance deployment,
 * replace this with a Redis-backed rate limiter using Upstash or ioredis.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

export function checkRateLimit(walletAddress: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const key = walletAddress.toLowerCase();

  const entry = store.get(key) ?? { timestamps: [] };

  entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldest = entry.timestamps[0] ?? now;
    const retryAfterMs = WINDOW_MS - (now - oldest);

    return { allowed: false, retryAfterMs };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return { allowed: true, retryAfterMs: 0 };
}

export function resetRateLimitStore(): void {
  store.clear();
}
