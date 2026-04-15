'use client';

import type { Address } from 'viem';

import { useWalletBalances } from '@/hooks/useWalletBalances';
import { formatAddress } from '@/lib/formatAddress';

type WalletSummaryProps = {
  address?: Address;
};

function BalanceTile({ label, amount, symbol }: { label: string; amount: string; symbol: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm dark:border-white/10 dark:bg-slate-950/40">
      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
        {amount}
        <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          {symbol}
        </span>
      </dd>
    </div>
  );
}

export function WalletSummary({ address }: WalletSummaryProps) {
  const { celoBalance, cusdBalance } = useWalletBalances(address);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-950 dark:text-white">Wallet</p>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            {formatAddress(address)}
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
          Celo mainnet
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <BalanceTile label="CELO" amount={celoBalance.amount} symbol={celoBalance.symbol} />
        <BalanceTile label="cUSD" amount={cusdBalance.amount} symbol={cusdBalance.symbol} />
      </dl>

      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
        Balances refresh from Celo mainnet and mirror the balance-first wallet pattern used in the
        Composer MiniPay template.
      </p>
    </div>
  );
}
