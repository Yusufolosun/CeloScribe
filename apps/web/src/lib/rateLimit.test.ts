import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkRateLimit, resetRateLimitStore } from './rateLimit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-14T00:00:00.000Z'));
    resetRateLimitStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows 10 requests within a 1 minute window', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const result = checkRateLimit('0xAbC1230000000000000000000000000000000000');

      expect(result).toEqual({ allowed: true, retryAfterMs: 0 });
    }
  });

  it('rejects the 11th request within the same window', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      checkRateLimit('0xabc1230000000000000000000000000000000000');
    }

    const result = checkRateLimit('0xABC1230000000000000000000000000000000000');

    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBe(60_000);
  });

  it('allows requests again after the sliding window expires', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      checkRateLimit('0xabc1230000000000000000000000000000000000');
    }

    vi.setSystemTime(new Date('2026-04-14T00:01:00.001Z'));

    const result = checkRateLimit('0xAbC1230000000000000000000000000000000000');

    expect(result).toEqual({ allowed: true, retryAfterMs: 0 });
  });

  it('keeps rate limits isolated per wallet address', () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      checkRateLimit('0xabc1230000000000000000000000000000000000');
    }

    const otherWalletResult = checkRateLimit('0xdef4560000000000000000000000000000000000');

    expect(otherWalletResult).toEqual({ allowed: true, retryAfterMs: 0 });
  });

  it('normalizes mixed-case wallet addresses to the same rate limit bucket', () => {
    const firstResult = checkRateLimit('0xAbCdEf0000000000000000000000000000000000');
    const secondResult = checkRateLimit('0xabcdef0000000000000000000000000000000000');

    expect(firstResult.allowed).toBe(true);
    expect(secondResult.allowed).toBe(true);
  });
});
