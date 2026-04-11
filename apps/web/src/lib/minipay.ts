/**
 * Detects if the current browser is MiniPay or a MiniPay-compatible wallet.
 * MiniPay injects window.ethereum with isMiniPay = true.
 */
export function detectMiniPay(): boolean {
  if (typeof window === 'undefined') return false;

  return window.ethereum?.isMiniPay === true;
}