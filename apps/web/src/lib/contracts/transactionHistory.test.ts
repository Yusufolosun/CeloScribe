import { describe, expect, it, vi } from 'vitest';

import {
  CELOSCRIBE_CONTRACT_DEPLOYMENT_BLOCK,
  loadTransactionHistory,
  mapPaymentReceivedLog,
  parseTransactionHistoryLogs,
  sortHistoryEntries,
} from './transactionHistory';

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

  it('falls back to the default task type for unknown codes', () => {
    expect(
      mapPaymentReceivedLog({
        transactionHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
        blockNumber: 13n,
        args: {
          amount: 2_000_000_000_000_000_000n,
          taskType: 99,
          timestamp: 1_700_000_100n,
        },
      })
    ).toEqual({
      amount: '2',
      blockNumber: 13n,
      taskType: 'TEXT_SHORT',
      timestamp: 1_700_000_100,
      txHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    });
  });

  it('uses an empty hash when the log omits the transaction hash', () => {
    expect(
      mapPaymentReceivedLog({
        blockNumber: 14n,
        args: {
          amount: 3_000_000_000_000_000_000n,
          taskType: 1,
          timestamp: 1_700_000_200n,
        },
      })
    ).toEqual({
      amount: '3',
      blockNumber: 14n,
      taskType: 'TEXT_LONG',
      timestamp: 1_700_000_200,
      txHash: '',
    });
  });

  it('formats the payment amount as cUSD text', () => {
    expect(
      mapPaymentReceivedLog({
        transactionHash: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        blockNumber: 15n,
        args: {
          amount: 1_500_000_000_000_000_000n,
          taskType: 0,
          timestamp: 1_700_000_300n,
        },
      }).amount
    ).toBe('1.5');
  });
});

describe('sortHistoryEntries', () => {
  it('orders newer blocks before older blocks', () => {
    const entries = [
      {
        amount: '1',
        blockNumber: 11n,
        taskType: 'TEXT_SHORT' as const,
        timestamp: 1_700_000_100,
        txHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
      {
        amount: '2',
        blockNumber: 12n,
        taskType: 'IMAGE' as const,
        timestamp: 1_700_000_200,
        txHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      },
    ];

    expect([...entries].sort(sortHistoryEntries)).toEqual([entries[1], entries[0]]);
  });

  it('uses the timestamp as the tie-breaker within a block', () => {
    const earlierEntry = {
      amount: '1',
      blockNumber: 13n,
      taskType: 'TEXT_SHORT' as const,
      timestamp: 1_700_000_050,
      txHash: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    };
    const laterEntry = {
      amount: '1',
      blockNumber: 13n,
      taskType: 'TRANSLATE' as const,
      timestamp: 1_700_000_150,
      txHash: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    };

    expect([earlierEntry, laterEntry].sort(sortHistoryEntries)).toEqual([laterEntry, earlierEntry]);
  });
});

describe('parseTransactionHistoryLogs', () => {
  it('returns an empty array when no logs are present', () => {
    expect(parseTransactionHistoryLogs([])).toEqual([]);
  });
});

describe('loadTransactionHistory', () => {
  it('requests logs from the deployment block', async () => {
    const getLogs = vi.fn().mockResolvedValue([]);

    await loadTransactionHistory({
      client: { getLogs },
      contractAddress: '0x0000000000000000000000000000000000000001',
      userAddress: '0x0000000000000000000000000000000000000002',
    });

    expect(getLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        fromBlock: CELOSCRIBE_CONTRACT_DEPLOYMENT_BLOCK,
        toBlock: 'latest',
      })
    );
  });
});
