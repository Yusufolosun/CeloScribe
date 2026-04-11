type StatusTone = 'neutral' | 'positive';

export function StatusCard({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  const toneStyles =
    tone === 'positive'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
      : 'border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-100';

  return (
    <div className={`rounded-3xl border p-4 ${toneStyles}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}