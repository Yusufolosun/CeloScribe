/**
 * Detects if the current browser is MiniPay or a MiniPay-compatible wallet.
 * MiniPay injects window.ethereum with isMiniPay = true.
 */
export function detectMiniPay(): boolean {
  if (typeof window === 'undefined') return false;

  return window.ethereum?.isMiniPay === true;
}

export type WalletConnectionState = 'miniPay' | 'injected' | 'unsupported';

export function hasInjectedWallet(): boolean {
  if (typeof window === 'undefined') return false;

  return Boolean(window.ethereum);
}

export function getWalletConnectionState(): WalletConnectionState {
  if (detectMiniPay()) {
    return 'miniPay';
  }

  if (hasInjectedWallet()) {
    return 'injected';
  }

  return 'unsupported';
}
