'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { celo } from '@/lib/chains';

/**
 * Detects if the current browser is MiniPay or a MiniPay-compatible wallet.
 * MiniPay injects window.ethereum with isMiniPay = true.
 */
export function detectMiniPay(): boolean {
  if (typeof window === 'undefined') return false;

  return window.ethereum?.isMiniPay === true;
}

export function useMiniPay() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const isMiniPay = detectMiniPay();
  const isOnCelo = chain?.id === celo.id;

  function connectWallet() {
    const connector = connectors[0];

    if (!connector) return;

    connect({ connector });
  }

  return {
    address,
    chain,
    connectWallet,
    disconnect,
    isConnected,
    isConnecting,
    isMiniPay,
    isOnCelo,
  };
}