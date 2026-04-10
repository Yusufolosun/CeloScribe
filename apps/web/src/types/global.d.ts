export {};

declare global {
  interface EthereumProvider {
    isMiniPay?: boolean;
    request<T = unknown>(args: { method: string; params?: unknown[] | object }): Promise<T>;
    on?(event: string, listener: (...args: unknown[]) => void): void;
    removeListener?(event: string, listener: (...args: unknown[]) => void): void;
  }

  interface Window {
    ethereum?: EthereumProvider;
  }
}
