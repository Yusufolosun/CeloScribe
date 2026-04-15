import { type Address, type Hash } from 'viem';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TaskType, verifyPayment } from './verifyPayment';

const mockState = vi.hoisted(() => {
  const state = {
    createPublicClientMock: vi.fn(),
    getLogsMock: vi.fn(),
    getTransactionReceiptMock: vi.fn(),
    loggerDebugMock: vi.fn(),
    loggerErrorMock: vi.fn(),
    loggerInfoMock: vi.fn(),
    loggerWarnMock: vi.fn(),
  };

  state.createPublicClientMock.mockImplementation(() => ({
    getLogs: state.getLogsMock,
    getTransactionReceipt: state.getTransactionReceiptMock,
  }));

  return state;
});

vi.mock('viem', () => ({
  createPublicClient: mockState.createPublicClientMock,
  http: vi.fn(),
  parseAbiItem: vi.fn((item: string) => item),
}));

vi.mock('@/lib/env', () => ({
  env: {
    CELO_RPC_URL: 'http://localhost:8545',
    CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000001',
    NODE_ENV: 'production',
  },
}));

vi.mock('@/lib/chains', () => ({
  celo: {
    id: 42220,
    name: 'Celo',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: mockState.loggerDebugMock,
    error: mockState.loggerErrorMock,
    info: mockState.loggerInfoMock,
    warn: mockState.loggerWarnMock,
  },
}));

export const TEST_USER = '0x0000000000000000000000000000000000000002' as Address;
export const OTHER_USER = '0x0000000000000000000000000000000000000003' as Address;
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001' as Address;
export const TEST_TX_HASH =
  '0x1111111111111111111111111111111111111111111111111111111111111111' as Hash;

export function resetVerifyPaymentMocks() {
  mockState.createPublicClientMock.mockClear();
  mockState.getLogsMock.mockReset();
  mockState.getTransactionReceiptMock.mockReset();
  mockState.loggerDebugMock.mockReset();
  mockState.loggerErrorMock.mockReset();
  mockState.loggerInfoMock.mockReset();
  mockState.loggerWarnMock.mockReset();
}

describe('verifyPayment', () => {
  beforeEach(() => {
    resetVerifyPaymentMocks();
  });

  it('returns invalid for a reverted receipt', async () => {
    mockState.getTransactionReceiptMock.mockResolvedValue({
      status: 'reverted',
    });

    const result = await verifyPayment(TEST_TX_HASH, TEST_USER, TaskType.TEXT_SHORT);

    expect(result).toEqual({
      valid: false,
      reason: 'Transaction reverted or failed.',
    });
  });

  it('returns invalid when the transaction targeted another contract', async () => {
    mockState.getTransactionReceiptMock.mockResolvedValue({
      blockNumber: 1n,
      confirmations: 3,
      status: 'success',
      to: OTHER_USER,
    });

    const result = await verifyPayment(TEST_TX_HASH, TEST_USER, TaskType.TEXT_SHORT);

    expect(result).toEqual({
      valid: false,
      reason: 'Transaction did not target CeloScribePayment contract.',
    });
  });

  it('returns invalid when no matching payment log is found', async () => {
    mockState.getTransactionReceiptMock.mockResolvedValue({
      blockNumber: 1n,
      confirmations: 3,
      status: 'success',
      to: CONTRACT_ADDRESS,
    });
    mockState.getLogsMock.mockResolvedValue([]);

    const result = await verifyPayment(TEST_TX_HASH, TEST_USER, TaskType.TEXT_SHORT);

    expect(result).toEqual({
      valid: false,
      reason: 'No matching PaymentReceived event found for this user and task type.',
    });
  });

  it('returns verified payment details for a matching receipt and log', async () => {
    mockState.getTransactionReceiptMock.mockResolvedValue({
      blockNumber: 1n,
      confirmations: 3,
      status: 'success',
      to: CONTRACT_ADDRESS,
    });
    mockState.getLogsMock.mockResolvedValue([
      {
        transactionHash: TEST_TX_HASH,
        args: {
          amount: 100n,
          taskType: TaskType.TEXT_SHORT,
          user: TEST_USER,
        },
      },
    ]);

    const result = await verifyPayment(TEST_TX_HASH, TEST_USER, TaskType.TEXT_SHORT);

    expect(result).toEqual({
      amount: 100n,
      taskType: TaskType.TEXT_SHORT,
      user: TEST_USER,
      valid: true,
    });
  });

  it('returns invalid when the receipt has not reached the production confirmation threshold', async () => {
    mockState.getTransactionReceiptMock.mockResolvedValue({
      blockNumber: 1n,
      confirmations: 2,
      status: 'success',
      to: CONTRACT_ADDRESS,
    });

    const result = await verifyPayment(TEST_TX_HASH, TEST_USER, TaskType.TEXT_SHORT);

    expect(result).toEqual({
      valid: false,
      reason: 'Transaction needs at least 3 confirmations.',
    });
  });

  it('ignores matching logs from other transactions in the same block', async () => {
    mockState.getTransactionReceiptMock.mockResolvedValue({
      blockNumber: 1n,
      confirmations: 3,
      status: 'success',
      to: CONTRACT_ADDRESS,
    });
    mockState.getLogsMock.mockResolvedValue([
      {
        transactionHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
        args: {
          amount: 100n,
          taskType: TaskType.TEXT_SHORT,
          user: TEST_USER,
        },
      },
      {
        transactionHash: TEST_TX_HASH,
        args: {
          amount: 100n,
          taskType: TaskType.TEXT_SHORT,
          user: OTHER_USER,
        },
      },
    ]);

    const result = await verifyPayment(TEST_TX_HASH, TEST_USER, TaskType.TEXT_SHORT);

    expect(result).toEqual({
      valid: false,
      reason: 'No matching PaymentReceived event found for this user and task type.',
    });
  });
});
