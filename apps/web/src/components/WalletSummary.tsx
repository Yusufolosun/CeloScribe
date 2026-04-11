'use client';

import { formatAddress } from '@/lib/formatAddress';

type WalletSummaryProps = {
  address?: string;
};

export function WalletSummary({ address }: WalletSummaryProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
      <p className="font-medium">Wallet</p>
      <p>{formatAddress(address)}</p>
    </div>
  );
}