import type { Page } from '@playwright/test';

export const MOCK_ADDRESS = '0x1234567890123456789012345678901234567890';
export const MOCK_CHAIN_ID = 42220;

type Listener = (...args: unknown[]) => void;

type WalletFixtureOptions = {
  address?: string;
  chainId?: number;
  isMiniPay?: boolean;
};

export async function installMockWallet(page: Page) {
  await installInjectedWallet(page, { isMiniPay: true });
}

export async function installInjectedWallet(page: Page, options: WalletFixtureOptions = {}) {
  const { address = MOCK_ADDRESS, chainId = MOCK_CHAIN_ID, isMiniPay = false } = options;

  await page.addInitScript(
    ({ address, chainId, isMiniPay }) => {
      const listeners = new Map<string, Set<Listener>>();
      const accounts = [address];

      function emit(eventName: string, ...args: unknown[]) {
        const handlers = listeners.get(eventName);

        if (!handlers) {
          return;
        }

        handlers.forEach((handler) => handler(...args));
      }

      const ethereum = {
        isMiniPay,
        chainId: `0x${chainId.toString(16)}`,
        selectedAddress: address,
        async request({ method }: { method: string }) {
          switch (method) {
            case 'eth_chainId':
              return `0x${chainId.toString(16)}`;
            case 'net_version':
              return String(chainId);
            case 'eth_accounts':
            case 'eth_requestAccounts':
              emit('accountsChanged', accounts);
              return accounts;
            case 'wallet_switchEthereumChain':
              emit('chainChanged', `0x${chainId.toString(16)}`);
              return null;
            case 'wallet_addEthereumChain':
              return null;
            case 'eth_sendTransaction':
              return `0x${'1'.repeat(63)}${String(Math.max(accounts.length, 1))}`;
            case 'eth_estimateGas':
              return '0x5208';
            case 'eth_gasPrice':
            case 'eth_maxPriorityFeePerGas':
              return '0x3b9aca00';
            case 'eth_getTransactionCount':
            case 'eth_blockNumber':
              return '0x1';
            case 'eth_call':
              return '0x';
            default:
              return null;
          }
        },
        on(eventName: string, handler: Listener) {
          const handlers = listeners.get(eventName) ?? new Set<Listener>();
          handlers.add(handler);
          listeners.set(eventName, handlers);
        },
        removeListener(eventName: string, handler: Listener) {
          listeners.get(eventName)?.delete(handler);
        },
        emit,
      };

      Object.defineProperty(window, 'ethereum', {
        configurable: true,
        enumerable: true,
        value: ethereum,
        writable: true,
      });

      (
        window as typeof window & {
          __mockWallet?: { connect: () => void; disconnect: () => void };
        }
      ).__mockWallet = {
        connect() {
          emit('accountsChanged', accounts);
        },
        disconnect() {
          emit('accountsChanged', []);
        },
      };
    },
    {
      address,
      chainId,
      isMiniPay,
    }
  );
}
