import { useBudgets } from '@guallet/api-react';
import { IconTargetArrow } from '@tabler/icons-react';
import { WidgetCard } from './WidgetCard';

export function BudgetsWidget() {
  const { budgets, isLoading } = useBudgets();

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  } else if (!budgets || budgets.length === 0) {
    content = (
      <div className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
        No budgets found.
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        {budgets.map((budget) => {
          const spent = Number(budget.spent ?? 0);
          const total = Number(budget.amount ?? 0);
          const remaining = total - spent;
          const rawPercent = total > 0 ? (spent / total) * 100 : 0;
          const percent = Math.min(rawPercent, 100);
          const isOverBudget = rawPercent > 100;
          const isNearLimit = rawPercent > 90 && !isOverBudget;

          let containerClassName = 'border-border bg-muted/40';
          let amountClassName = 'text-muted-foreground';
          let progressClassName = 'bg-emerald-500';

          if (isOverBudget) {
            containerClassName = 'border-red-200 bg-red-50';
            amountClassName = 'text-red-600';
            progressClassName = 'bg-red-500';
          } else if (isNearLimit) {
            containerClassName = 'border-amber-200 bg-amber-50';
            amountClassName = 'text-amber-600';
            progressClassName = 'bg-amber-500';
          }

          return (
            <div
              key={budget.id}
              className={`rounded-lg border p-3 ${containerClassName}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{budget.name}</p>
                <p className={`text-sm font-medium ${amountClassName}`}>
                  {spent.toFixed(0)} / {total.toFixed(0)}
                </p>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${progressClassName}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p
                  className={`text-xs font-medium ${
                    remaining < 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {remaining.toFixed(0)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <WidgetCard title="Budgets" icon={<IconTargetArrow size={20} />}>
      {content}
    </WidgetCard>
  );
}
