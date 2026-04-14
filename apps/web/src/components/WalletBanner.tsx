'use client';

import { useSyncExternalStore } from 'react';

import { useMiniPay } from '@/hooks/useMiniPay';

export function WalletBanner() {
  const { isConnected, isMiniPay, address, connectWallet } = useMiniPay();
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) {
    return (
      <div className="wallet-banner" aria-live="polite">
        <button
          onClick={connectWallet}
          className="btn btn--primary"
          type="button"
          aria-label="Connect wallet"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="wallet-banner wallet-banner--connected" aria-live="polite">
        <span className="wallet-banner__dot" aria-hidden="true" />
        <span aria-label={`Connected wallet ${address ?? ''}`}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        {isMiniPay && <span className="wallet-banner__badge">MiniPay</span>}
      </div>
    );
  }

  return (
    <div className="wallet-banner" aria-live="polite">
      <button
        onClick={connectWallet}
        className="btn btn--primary"
        type="button"
        aria-label="Connect wallet"
      >
        Connect Wallet
      </button>
    </div>
  );
}
