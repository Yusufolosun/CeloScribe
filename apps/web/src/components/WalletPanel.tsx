'use client';

import { WalletHeader } from '@/components/WalletHeader';
import { StatusCard } from '@/components/StatusCard';
import { WalletSummary } from '@/components/WalletSummary';
import { useMiniPay } from '@/hooks/useMiniPay';

export function WalletPanel() {
  const { address, chain, connectWallet, disconnect, isConnected, isConnecting, isMiniPay, isOnCelo } = useMiniPay();

  return (
    <section className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:bg-slate-950/70">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <WalletHeader
          eyebrow="Celo wallet layer"
          title="MiniPay-aware wallet connection for Celo apps."
          description="The provider stack is ready for Wagmi, Viem, React Query, and Thirdweb. This panel shows the current MiniPay and chain state without any payment flow."
        />

        <WalletSummary address={address} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatusCard label="MiniPay" value={isMiniPay ? 'Detected' : 'Not detected'} tone={isMiniPay ? 'positive' : 'neutral'} />
        <StatusCard label="Network" value={chain?.name ?? 'No chain'} tone={isOnCelo ? 'positive' : 'neutral'} />
        <StatusCard label="Connection" value={isConnected ? 'Connected' : 'Disconnected'} tone={isConnected ? 'positive' : 'neutral'} />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          <p>{isOnCelo ? 'Ready for Celo mainnet.' : 'Switch to Celo mainnet before making on-chain requests.'}</p>
          <p>{isConnecting ? 'Connecting wallet...' : 'MiniPay injects a MetaMask-compatible provider.'}</p>
        </div>

        <div className="flex gap-3">
          <button
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
            onClick={connectWallet}
            type="button"
            disabled={isConnected || isConnecting}
          >
            Connect wallet
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
            onClick={disconnect}
            type="button"
            disabled={!isConnected}
          >
            Disconnect
          </button>
        </div>
      </div>
    </section>
  );
}