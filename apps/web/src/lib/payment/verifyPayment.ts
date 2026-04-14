import { type Address, type Hash, createPublicClient, http } from 'viem';

import { celo } from '@/lib/chains';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// TaskType enum mirrors the contract's enum — must stay in sync.
export enum TaskType {
  TEXT_SHORT = 0,
  TEXT_LONG = 1,
  IMAGE = 2,
  TRANSLATE = 3,
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
  user?: Address;
  taskType?: TaskType;
  amount?: bigint;
}

const client = createPublicClient({
  chain: celo,
  transport: http(env.CELO_RPC_URL),
});

const CONTRACT_ADDRESS = env.CONTRACT_ADDRESS as Address;

export async function verifyPayment(
  txHash: Hash,
  expectedUser: Address,
  expectedTaskType: TaskType
): Promise<VerificationResult> {
  logger.debug({
    msg: 'Payment verification stub',
    txHash,
    expectedUser,
    expectedTaskType,
    contractAddress: CONTRACT_ADDRESS,
  });
  void client;

  return {
    valid: false,
    reason: 'Payment verification not implemented yet.',
  };
}
