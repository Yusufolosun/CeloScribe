'use client';

import { useEffect, useState } from 'react';

import { type Address, createPublicClient, http } from 'viem';

import { celo } from '@/lib/chains';
import {
  CELOSCRIBE_CONTRACT_DEPLOYMENT_BLOCK,
  type HistoryEntry,
  loadTransactionHistory,
} from '@/lib/contracts';
import { optionalPublicEnv, requirePublicAddressEnv } from '@/lib/publicEnv';

const CONTRACT_ADDRESS = requirePublicAddressEnv(
  'NEXT_PUBLIC_CELOSCRIBE_CONTRACT_ADDRESS'
) as Address;

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

    const currentUserAddress = userAddress;

    let cancelled = false;

    async function fetchHistory() {
      setIsLoading(true);
      setError(null);

      try {
        const client = createPublicClient({
          chain: celo,
          transport: http(CELO_RPC_URL),
        });

        const entries = await loadTransactionHistory({
          client,
          contractAddress: CONTRACT_ADDRESS,
          fromBlock: CELOSCRIBE_CONTRACT_DEPLOYMENT_BLOCK,
          userAddress: currentUserAddress,
        });

        if (cancelled) return;

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
