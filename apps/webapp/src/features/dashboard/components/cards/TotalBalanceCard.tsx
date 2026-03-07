import {
  IconCoin,
  IconArrowUpRight,
  IconArrowDownRight,
} from '@tabler/icons-react';

export function TotalBalanceCard() {
  const diff = 34;
  const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight;
  const diffClassName = diff > 0 ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Total Balance
        </p>
        <IconCoin className="h-5 w-5 text-muted-foreground" stroke={1.5} />
      </div>

      <div className="mt-6 flex items-end gap-2">
        <p className="text-2xl font-bold leading-none">$1000</p>
        <p
          className={`flex items-center gap-1 text-sm font-medium ${diffClassName}`}
        >
          <span>{diff}%</span>
          <DiffIcon className="h-4 w-4" stroke={1.5} />
        </p>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Compared to previous month
      </p>
    </div>
  );
}
