'use client';

type WalletActionsProps = {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
};

export function WalletActions({ isConnected, isConnecting, onConnect, onDisconnect }: WalletActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
        onClick={onConnect}
        type="button"
        disabled={isConnected || isConnecting}
      >
        Connect wallet
      </button>
      <button
        className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
        onClick={onDisconnect}
        type="button"
        disabled={!isConnected}
      >
        Disconnect
      </button>
    </div>
  );
}