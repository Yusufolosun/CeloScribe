'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { celo } from '@/lib/chains';
import { detectMiniPay } from '@/lib/minipay';

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