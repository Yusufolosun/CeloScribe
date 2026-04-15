'use client';

import type { Address } from 'viem';
import { useBalance } from 'wagmi';

import { CUSD_ADDRESS, celo } from '@/lib/chains';

export interface WalletBalanceSnapshot {
  amount: string;
  symbol: string;
}

export interface UseWalletBalancesReturn {
  celoBalance: WalletBalanceSnapshot;
  cusdBalance: WalletBalanceSnapshot;
}

export function useWalletBalances(address: Address | undefined): UseWalletBalancesReturn {
  const celoBalanceQuery = useBalance({
    address,
    chainId: celo.id,
    query: {
      enabled: Boolean(address),
    },
  });

  const cusdBalanceQuery = useBalance({
    address,
    chainId: celo.id,
    token: CUSD_ADDRESS,
    query: {
      enabled: Boolean(address),
    },
  });

  const celoBalance = !address
    ? { amount: 'Connect wallet', symbol: 'CELO' }
    : celoBalanceQuery.error
      ? { amount: 'Unavailable', symbol: celoBalanceQuery.data?.symbol ?? 'CELO' }
      : {
          amount: celoBalanceQuery.data?.formatted ?? 'Loading...',
          symbol: celoBalanceQuery.data?.symbol ?? 'CELO',
        };

  const cusdBalance = !address
    ? { amount: 'Connect wallet', symbol: 'cUSD' }
    : cusdBalanceQuery.error
      ? { amount: 'Unavailable', symbol: cusdBalanceQuery.data?.symbol ?? 'cUSD' }
      : {
          amount: cusdBalanceQuery.data?.formatted ?? 'Loading...',
          symbol: cusdBalanceQuery.data?.symbol ?? 'cUSD',
        };

  return { celoBalance, cusdBalance };
}
