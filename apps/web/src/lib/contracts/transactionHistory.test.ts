import { describe, expect, it } from 'vitest';

import { mapPaymentReceivedLog } from './transactionHistory';

describe('mapPaymentReceivedLog', () => {
  it('maps a known payment log into a history entry', () => {
    expect(
      mapPaymentReceivedLog({
        transactionHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
        blockNumber: 12n,
        args: {
          amount: 1_000_000_000_000_000_000n,
          taskType: 2,
          timestamp: 1_700_000_000n,
        },
      })
    ).toEqual({
      amount: '1',
      blockNumber: 12n,
      taskType: 'IMAGE',
      timestamp: 1_700_000_000,
      txHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    });
  });
});
