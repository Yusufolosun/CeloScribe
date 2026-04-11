'use client';

type WalletHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function WalletHeader({ eyebrow, title, description }: WalletHeaderProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{eyebrow}</p>
      <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{title}</h1>
      <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}