import { GualletIcon } from '@/components/GualletIcon/GualletIcon';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useBudget } from '@guallet/api-react';
import { Money } from '@guallet/money';

interface BudgetCardProps {
  budgetId: string;
  onClick?: () => void;
}

export function BudgetCard({ budgetId, onClick }: Readonly<BudgetCardProps>) {
  const { budget } = useBudget(budgetId);

  if (!budget) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const percent = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  let progressBarClass = 'bg-emerald-500';
  if (percent >= 100) {
    progressBarClass = 'bg-destructive';
  } else if (percent >= 80) {
    progressBarClass = 'bg-amber-500';
  }

  const spentMoney = Money.fromCurrencyCode({
    amount: budget.spent,
    currencyCode: budget.currency,
  });

  const amountMoney = Money.fromCurrencyCode({
    amount: budget.amount,
    currencyCode: budget.currency,
  });

  return (
    <Card
      className={cn('rounded-md border p-4 shadow-sm', {
        'cursor-pointer transition-colors hover:bg-accent': Boolean(onClick),
      })}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className="mb-2 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {budget.icon && budget.colour && (
            <GualletIcon iconName={budget.icon} iconColor={budget.colour} />
          )}
          <p className="truncate font-semibold">{budget.name}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {spentMoney.format()} / {amountMoney.format()}
        </p>
      </div>

      <div className="flex items-end gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full transition-all', progressBarClass)}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <p className="text-sm font-medium">{percent.toFixed(0)}%</p>
      </div>
    </Card>
  );
}
