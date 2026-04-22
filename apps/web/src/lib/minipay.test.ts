import { afterEach, describe, expect, it, vi } from 'vitest';

import { detectMiniPay, getWalletConnectionState, hasInjectedWallet } from './minipay';

describe('wallet detection helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('detects MiniPay when the injected provider sets isMiniPay', () => {
    vi.stubGlobal('window', {
      ethereum: { isMiniPay: true },
    });

    expect(detectMiniPay()).toBe(true);
    expect(hasInjectedWallet()).toBe(true);
    expect(getWalletConnectionState()).toBe('miniPay');
  });

  it('detects a generic injected wallet without the MiniPay flag', () => {
    vi.stubGlobal('window', {
      ethereum: {},
    });

    expect(detectMiniPay()).toBe(false);
    expect(hasInjectedWallet()).toBe(true);
    expect(getWalletConnectionState()).toBe('injected');
  });

  it('marks browsers without an injected provider as unsupported', () => {
    expect(detectMiniPay()).toBe(false);
    expect(hasInjectedWallet()).toBe(false);
    expect(getWalletConnectionState()).toBe('unsupported');
  });
});
