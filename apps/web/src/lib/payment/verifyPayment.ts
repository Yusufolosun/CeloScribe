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
  const receipt = await client.getTransactionReceipt({ hash: txHash });

  if (receipt.status !== 'success') {
    logger.warn({ msg: 'Payment verification failed', txHash, reason: 'reverted receipt' });
    return { valid: false, reason: 'Transaction reverted or failed.' };
  }

  if ((receipt.confirmations ?? 0) < 1) {
    logger.warn({ msg: 'Payment verification failed', txHash, reason: 'unconfirmed receipt' });
    return { valid: false, reason: 'Transaction is not yet confirmed.' };
  }

  logger.debug({
    msg: 'Payment receipt fetched',
    txHash,
    expectedUser,
    expectedTaskType,
    blockNumber: receipt.blockNumber,
    contractAddress: CONTRACT_ADDRESS,
  });

  return {
    valid: false,
    reason: 'Payment verification not implemented yet.',
  };
}
