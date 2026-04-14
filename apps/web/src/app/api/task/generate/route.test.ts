import { type Address, type Hash } from 'viem';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetRateLimitStore } from '@/lib/rateLimit';

import { POST } from './route';

const mockState = vi.hoisted(() => {
  const routeTaskMock = vi.fn();
  const verifyPaymentMock = vi.fn();

  return {
    routeTaskMock,
    verifyPaymentMock,
  };
});

vi.mock('@/lib/ai/router', () => ({
  routeTask: mockState.routeTaskMock,
}));

vi.mock('@/lib/payment/verifyPayment', () => ({
  TaskType: {
    TEXT_SHORT: 0,
    TEXT_LONG: 1,
    IMAGE: 2,
    TRANSLATE: 3,
  },
  verifyPayment: mockState.verifyPaymentMock,
}));

const TEST_TX_HASH = `0x${'1'.repeat(64)}` as Hash;
const TEST_USER_ADDRESS = '0x0000000000000000000000000000000000000002' as Address;

describe('POST /api/task/generate', () => {
  beforeEach(() => {
    mockState.routeTaskMock.mockReset();
    mockState.verifyPaymentMock.mockReset();
    resetRateLimitStore();
  });

  it('returns the routed AI result after payment verification passes', async () => {
    mockState.verifyPaymentMock.mockResolvedValue({ valid: true });
    mockState.routeTaskMock.mockResolvedValue({
      output: 'generated output',
      processingMs: 10,
      provider: 'deepseek-chat',
      taskType: 'TEXT_SHORT',
      tokensUsed: 11,
    });

    const request = new Request('http://localhost/api/task/generate', {
      body: JSON.stringify({
        prompt: 'Generate a short caption.',
        taskType: 'TEXT_SHORT',
        txHash: TEST_TX_HASH,
        userAddress: TEST_USER_ADDRESS,
      }),
      method: 'POST',
    });

    const response = await POST(request as never);
    const payload = (await response.json()) as {
      output: string;
      provider: string;
      taskType: string;
      tokensUsed: number;
    };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      output: 'generated output',
      processingMs: 10,
      provider: 'deepseek-chat',
      taskType: 'TEXT_SHORT',
      tokensUsed: 11,
    });
    expect(mockState.verifyPaymentMock).toHaveBeenCalledWith(TEST_TX_HASH, TEST_USER_ADDRESS, 0);
    expect(mockState.routeTaskMock).toHaveBeenCalledWith({
      prompt: 'Generate a short caption.',
      taskType: 'TEXT_SHORT',
      targetLanguage: undefined,
    });
  });

  it('rejects unknown task types before payment verification', async () => {
    const request = new Request('http://localhost/api/task/generate', {
      body: JSON.stringify({
        prompt: 'Generate a short caption.',
        taskType: 'NOT_A_TASK',
        txHash: TEST_TX_HASH,
        userAddress: TEST_USER_ADDRESS,
      }),
      method: 'POST',
    });

    const response = await POST(request as never);
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(payload.error).toContain('Invalid taskType');
    expect(mockState.verifyPaymentMock).not.toHaveBeenCalled();
    expect(mockState.routeTaskMock).not.toHaveBeenCalled();
  });

  it('returns payment required when verification fails', async () => {
    mockState.verifyPaymentMock.mockResolvedValue({
      reason: 'Transaction not confirmed.',
      valid: false,
    });

    const request = new Request('http://localhost/api/task/generate', {
      body: JSON.stringify({
        prompt: 'Generate a short caption.',
        taskType: 'TEXT_SHORT',
        txHash: TEST_TX_HASH,
        userAddress: TEST_USER_ADDRESS,
      }),
      method: 'POST',
    });

    const response = await POST(request as never);
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(402);
    expect(payload.error).toBe('Transaction not confirmed.');
    expect(mockState.routeTaskMock).not.toHaveBeenCalled();
  });

  it('returns too many requests after the wallet exceeds the window', async () => {
    mockState.verifyPaymentMock.mockResolvedValue({ valid: true });
    mockState.routeTaskMock.mockResolvedValue({
      output: 'generated output',
      processingMs: 10,
      provider: 'deepseek-chat',
      taskType: 'TEXT_SHORT',
      tokensUsed: 11,
    });

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const allowedResponse = await POST(
        new Request('http://localhost/api/task/generate', {
          body: JSON.stringify({
            prompt: 'Generate a short caption.',
            taskType: 'TEXT_SHORT',
            txHash: TEST_TX_HASH,
            userAddress: TEST_USER_ADDRESS,
          }),
          method: 'POST',
        }) as never
      );

      expect(allowedResponse.status).toBe(200);
    }

    const blockedResponse = await POST(
      new Request('http://localhost/api/task/generate', {
        body: JSON.stringify({
          prompt: 'Generate a short caption.',
          taskType: 'TEXT_SHORT',
          txHash: TEST_TX_HASH,
          userAddress: TEST_USER_ADDRESS,
        }),
        method: 'POST',
      }) as never
    );

    const payload = (await blockedResponse.json()) as { error: string };

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.headers.get('Retry-After')).toBe('60');
    expect(payload.error).toBe('Rate limit exceeded. Try again in 60 seconds.');
    expect(mockState.verifyPaymentMock).toHaveBeenCalledTimes(10);
    expect(mockState.routeTaskMock).toHaveBeenCalledTimes(10);
  });
});
