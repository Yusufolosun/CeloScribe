import { type Address } from 'viem';
import { vi } from 'vitest';

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
