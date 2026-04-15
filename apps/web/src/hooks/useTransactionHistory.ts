'use client';

import { useEffect, useState } from 'react';

import { type Address, createPublicClient, formatEther, http, parseAbiItem } from 'viem';

import type { TaskType } from '@/lib/ai/taskTypes';
import { celo } from '@/lib/chains';
import { optionalPublicEnv, requirePublicEnv } from '@/lib/publicEnv';

const TASK_NAMES: Record<number, TaskType> = {
  0: 'TEXT_SHORT',
  1: 'TEXT_LONG',
  2: 'IMAGE',
  3: 'TRANSLATE',
};

export interface HistoryEntry {
  txHash: string;
  taskType: TaskType;
  amount: string;
  blockNumber: bigint;
  timestamp?: number;
}

const CONTRACT_ADDRESS = requirePublicEnv('NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS') as Address;

const paymentEvent = parseAbiItem(
  'event PaymentReceived(address indexed user, uint8 indexed taskType, uint256 amount, uint256 timestamp)'
);

const CELO_RPC_URL = optionalPublicEnv('NEXT_PUBLIC_CELO_RPC_URL', 'https://forno.celo.org');

export function useTransactionHistory(userAddress: Address | undefined) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userAddress) {
      setHistory([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchHistory() {
      setIsLoading(true);
      setError(null);

      try {
        const client = createPublicClient({
          chain: celo,
          transport: http(CELO_RPC_URL),
        });

        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS,
          event: paymentEvent,
          args: { user: userAddress },
          fromBlock: BigInt(0), // Replace with the deployment block number in production to avoid scanning the entire chain history.
          toBlock: 'latest',
        });

        if (cancelled) return;

        const entries: HistoryEntry[] = logs
          .map((log) => {
            const { taskType, amount, timestamp } = log.args as {
              taskType: number;
              amount: bigint;
              timestamp: bigint;
            };

            const resolvedTaskType = TASK_NAMES[taskType] ?? 'TEXT_SHORT';

            return {
              txHash: log.transactionHash ?? '',
              taskType: resolvedTaskType,
              amount: formatEther(amount),
              blockNumber: log.blockNumber,
              timestamp: Number(timestamp),
            };
          })
          .sort((left, right) => {
            if (left.blockNumber > right.blockNumber) return -1;
            if (left.blockNumber < right.blockNumber) return 1;

            return (right.timestamp ?? 0) - (left.timestamp ?? 0);
          });

        setHistory(entries);
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load history');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [userAddress]);

  return { history, isLoading, error };
}
