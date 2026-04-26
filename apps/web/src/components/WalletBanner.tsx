'use client';

import { useSyncExternalStore } from 'react';

import { useMiniPay } from '@/hooks/useMiniPay';

const walletBannerCopy = {
  miniPay: {
    eyebrow: 'Native Celo Experience',
    title: 'Connect with MiniPay',
    detail: 'Experience seamless on-chain payments optimized for mobile Web3.',
    actionLabel: 'Connect MiniPay',
  },
  injected: {
    eyebrow: 'Wallet Available',
    title: 'Connect Your Browser Wallet',
    detail:
      'MiniPay provides the best experience, but you can also connect through your installed browser wallet.',
    actionLabel: 'Connect Wallet',
  },
  unsupported: {
    eyebrow: 'Wallet Required',
    title: 'Connect a Celo Wallet to Get Started',
    detail: 'Use MiniPay (native to Celo) or install a Web3 wallet like MetaMask to continue.',
    actionLabel: 'Learn More',
  },
} as const;

export function WalletBanner() {
  const { isConnected, isMiniPay, address, connectWallet, isConnecting, walletConnectionState } =
    useMiniPay();
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const bannerCopy = walletBannerCopy[walletConnectionState];

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
      <div
        className={`wallet-banner wallet-banner--connected wallet-banner--${walletConnectionState}`}
        aria-live="polite"
      >
        <span className="wallet-banner__dot" aria-hidden="true" />
        <div className="wallet-banner__status-copy">
          <span className="wallet-banner__eyebrow">{bannerCopy.eyebrow}</span>
          <span className="wallet-banner__title" aria-label={`Connected wallet ${address ?? ''}`}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <span className="wallet-banner__detail">
            {isMiniPay ? 'Connected through MiniPay.' : 'Connected through a browser wallet.'}
          </span>
        </div>
        <span className="wallet-banner__badge">{isMiniPay ? 'MiniPay' : 'Injected'}</span>
      </div>
    );
  }

  return (
    <div className={`wallet-banner wallet-banner--${walletConnectionState}`} aria-live="polite">
      <div className="wallet-banner__status-copy">
        <span className="wallet-banner__eyebrow">{bannerCopy.eyebrow}</span>
        <span className="wallet-banner__title">{bannerCopy.title}</span>
        <span className="wallet-banner__detail">{bannerCopy.detail}</span>
      </div>
      <button
        onClick={connectWallet}
        className="btn btn--primary"
        type="button"
        aria-label={bannerCopy.actionLabel}
        disabled={isConnecting || walletConnectionState === 'unsupported'}
      >
        {isConnecting ? 'Connecting...' : bannerCopy.actionLabel}
      </button>
    </div>
  );
}
