'use client';

import { useSyncExternalStore } from 'react';

import { useMiniPay } from '@/hooks/useMiniPay';

const walletBannerCopy = {
  miniPay: {
    eyebrow: 'MiniPay ready',
    title: 'This app is ready in MiniPay.',
    detail: 'Use the MiniPay connector for the smoothest Celo payment flow.',
    actionLabel: 'Connect MiniPay',
  },
  injected: {
    eyebrow: 'Injected wallet detected',
    title: 'A browser wallet is available.',
    detail:
      'CeloScribe can connect through the fallback wallet connector, but MiniPay is the primary experience.',
    actionLabel: 'Connect wallet',
  },
  unsupported: {
    eyebrow: 'MiniPay required',
    title: 'No injected wallet was found.',
    detail: 'Open CeloScribe in MiniPay or install a browser wallet before continuing.',
    actionLabel: 'No wallet available',
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
      <div className="wallet-banner wallet-banner--connected" aria-live="polite">
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
