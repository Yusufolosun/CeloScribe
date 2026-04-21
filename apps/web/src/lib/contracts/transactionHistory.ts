import { type Address, type PublicClient, formatEther, parseAbiItem } from 'viem';

import type { TaskType } from '@/lib/ai/taskTypes';

import { CELOSCRIBE_CONTRACT_DEPLOYMENT_BLOCK } from './celoScribeDeployment';

const TASK_NAMES: Record<number, TaskType> = {
  0: 'TEXT_SHORT',
  1: 'TEXT_LONG',
  2: 'IMAGE',
  3: 'TRANSLATE',
};

const paymentEvent = parseAbiItem(
  'event PaymentReceived(address indexed user, uint8 indexed taskType, uint256 amount, uint256 timestamp)'
);

export interface HistoryEntry {
  txHash: string;
  taskType: TaskType;
  amount: string;
  blockNumber: bigint;
  timestamp?: number;
}

export interface PaymentReceivedLog {
  transactionHash?: string;
  blockNumber: bigint;
  args: {
    amount: bigint;
    taskType: number;
    timestamp: bigint;
  };
}

export type TransactionHistoryClient = Pick<PublicClient, 'getLogs'>;

export interface LoadTransactionHistoryOptions {
  client: TransactionHistoryClient;
  contractAddress: Address;
  userAddress: Address;
  fromBlock?: bigint;
}

export function mapPaymentReceivedLog(log: PaymentReceivedLog): HistoryEntry {
  const { taskType, amount, timestamp } = log.args;
  const resolvedTaskType = TASK_NAMES[taskType] ?? 'TEXT_SHORT';

  return {
    txHash: log.transactionHash ?? '',
    taskType: resolvedTaskType,
    amount: formatEther(amount),
    blockNumber: log.blockNumber,
    timestamp: Number(timestamp),
  };
}

export function sortHistoryEntries(left: HistoryEntry, right: HistoryEntry): number {
  if (left.blockNumber > right.blockNumber) return -1;
  if (left.blockNumber < right.blockNumber) return 1;

  return (right.timestamp ?? 0) - (left.timestamp ?? 0);
}

export function parseTransactionHistoryLogs(logs: PaymentReceivedLog[]): HistoryEntry[] {
  return logs.map(mapPaymentReceivedLog).sort(sortHistoryEntries);
}

export async function loadTransactionHistory({
  client,
  contractAddress,
  userAddress,
  fromBlock = CELOSCRIBE_CONTRACT_DEPLOYMENT_BLOCK,
}: LoadTransactionHistoryOptions): Promise<HistoryEntry[]> {
  const logs = await client.getLogs({
    address: contractAddress,
    event: paymentEvent,
    args: { user: userAddress },
    fromBlock,
    toBlock: 'latest',
  });

  return parseTransactionHistoryLogs(logs as PaymentReceivedLog[]);
}
