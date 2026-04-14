import { type Address, type Hash, createPublicClient, http, parseAbiItem } from 'viem';

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

  if (receipt.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
    logger.warn({ msg: 'Payment verification failed', txHash, reason: 'wrong contract target' });
    return { valid: false, reason: 'Transaction did not target CeloScribePayment contract.' };
  }

  logger.debug({
    msg: 'Payment receipt fetched',
    txHash,
    expectedUser,
    expectedTaskType,
    blockNumber: receipt.blockNumber,
    contractAddress: CONTRACT_ADDRESS,
  });

  const paymentReceivedEvent = parseAbiItem(
    'event PaymentReceived(address indexed user, uint8 indexed taskType, uint256 amount, uint256 timestamp)'
  );

  const logs = await client.getLogs({
    address: CONTRACT_ADDRESS,
    event: paymentReceivedEvent,
    fromBlock: receipt.blockNumber,
    toBlock: receipt.blockNumber,
  });

  const matchingLog = logs.find((log) => {
    const { user, taskType } = log.args as { user: Address; taskType: number };

    return user.toLowerCase() === expectedUser.toLowerCase() && taskType === expectedTaskType;
  });

  if (!matchingLog) {
    logger.warn({ msg: 'Payment verification failed', txHash, reason: 'no matching event' });
    return {
      valid: false,
      reason: 'No matching PaymentReceived event found for this user and task type.',
    };
  }

  const { user, taskType, amount } = matchingLog.args as {
    user: Address;
    taskType: number;
    amount: bigint;
  };

  logger.info({
    msg: 'Payment verified',
    txHash,
    user,
    taskType,
    amount: amount.toString(),
  });

  return {
    valid: true,
    user,
    taskType: taskType as TaskType,
    amount,
  };
}
