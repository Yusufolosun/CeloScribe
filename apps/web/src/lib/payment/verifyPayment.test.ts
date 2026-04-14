import { type Address } from 'viem';
import { vi } from 'vitest';

import { TaskType, verifyPayment } from './verifyPayment';

const mockState = vi.hoisted(() => ({
  getLogsMock: vi.fn(),
  getTransactionReceiptMock: vi.fn(),
  loggerDebugMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  loggerInfoMock: vi.fn(),
  loggerWarnMock: vi.fn(),
}));

const createPublicClientMock = vi.fn(() => ({
  getLogs: mockState.getLogsMock,
  getTransactionReceipt: mockState.getTransactionReceiptMock,
}));

vi.mock('viem', () => ({
  createPublicClient: createPublicClientMock,
  http: vi.fn(),
  parseAbiItem: vi.fn((item: string) => item),
}));

vi.mock('@/lib/env', () => ({
  env: {
    CELO_RPC_URL: 'http://localhost:8545',
    CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000001',
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

export function resetVerifyPaymentMocks() {
  createPublicClientMock.mockClear();
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

    const result = await verifyPayment(TEST_USER, TEST_USER, TaskType.TEXT_SHORT);

    expect(result).toEqual({
      valid: false,
      reason: 'Transaction reverted or failed.',
    });
  });

  it('returns invalid when the transaction targeted another contract', async () => {
    mockState.getTransactionReceiptMock.mockResolvedValue({
      blockNumber: 1n,
      confirmations: 1,
      status: 'success',
      to: OTHER_USER,
    });

    const result = await verifyPayment(TEST_USER, TEST_USER, TaskType.TEXT_SHORT);

    expect(result).toEqual({
      valid: false,
      reason: 'Transaction did not target CeloScribePayment contract.',
    });
  });

  it('returns invalid when no matching payment log is found', async () => {
    mockState.getTransactionReceiptMock.mockResolvedValue({
      blockNumber: 1n,
      confirmations: 1,
      status: 'success',
      to: CONTRACT_ADDRESS,
    });
    mockState.getLogsMock.mockResolvedValue([]);

    const result = await verifyPayment(TEST_USER, TEST_USER, TaskType.TEXT_SHORT);

    expect(result).toEqual({
      valid: false,
      reason: 'No matching PaymentReceived event found for this user and task type.',
    });
  });
});
