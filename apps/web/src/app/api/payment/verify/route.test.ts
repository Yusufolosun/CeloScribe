import { type Address, type Hash } from 'viem';
import { vi } from 'vitest';
import { beforeEach, describe, expect, it } from 'vitest';

import { POST } from './route';

const { verifyPaymentMock } = vi.hoisted(() => ({
  verifyPaymentMock: vi.fn(),
}));

vi.mock('@/lib/payment/verifyPayment', () => ({
  TaskType: {
    TEXT_SHORT: 0,
    TEXT_LONG: 1,
    IMAGE: 2,
    TRANSLATE: 3,
  },
  verifyPayment: verifyPaymentMock,
}));

const TEST_TX_HASH = `0x${'1'.repeat(64)}` as Hash;
const TEST_USER_ADDRESS = '0x0000000000000000000000000000000000000002' as Address;

describe('POST /api/payment/verify', () => {
  beforeEach(() => {
    verifyPaymentMock.mockReset();
  });

  it('returns verified when payment verification succeeds', async () => {
    verifyPaymentMock.mockResolvedValue({ valid: true });

    const request = new Request('http://localhost/api/payment/verify', {
      body: JSON.stringify({
        taskType: 'TEXT_SHORT',
        txHash: TEST_TX_HASH,
        userAddress: TEST_USER_ADDRESS,
      }),
      method: 'POST',
    });

    const response = await POST(request as never);
    const payload = (await response.json()) as {
      taskType: string;
      verified: boolean;
    };

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      taskType: 'TEXT_SHORT',
      verified: true,
    });
    expect(verifyPaymentMock).toHaveBeenCalledWith(TEST_TX_HASH, TEST_USER_ADDRESS, 0);
  });

  it('returns bad request for an unknown task type', async () => {
    const request = new Request('http://localhost/api/payment/verify', {
      body: JSON.stringify({
        taskType: 'NOT_A_TASK',
        txHash: TEST_TX_HASH,
        userAddress: TEST_USER_ADDRESS,
      }),
      method: 'POST',
    });

    const response = await POST(request as never);
    const payload = (await response.json()) as {
      error: string;
    };

    expect(response.status).toBe(400);
    expect(payload.error).toContain('Invalid taskType');
    expect(verifyPaymentMock).not.toHaveBeenCalled();
  });
});
