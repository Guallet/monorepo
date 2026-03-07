import { cn } from '@/lib/utils';
import { useAccounts, useSavingGoals } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { IconPigMoney, IconFlag } from '@tabler/icons-react';
import { WidgetCard } from './WidgetCard';

export function SavingGoalsWidget() {
  const { savingGoals, isLoading: goalsLoading } = useSavingGoals();
  const { accounts, isLoading: accountsLoading } = useAccounts();

  const isLoading = goalsLoading || accountsLoading;

  // Calculate current amount for each saving goal
  const goalsWithProgress = savingGoals.map((goal) => {
    const goalAccounts = accounts.filter((acc) =>
      goal.accounts.includes(acc.id),
    );

    const currentAmount = goalAccounts.reduce(
      (sum, acc) => sum + Number(acc.balance.amount),
      0,
    );

    const targetAmount = Number(goal.target_amount);
    const progress =
      targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const currency = goalAccounts[0]?.currency || 'GBP';

    return {
      ...goal,
      currentAmount,
      progress: Math.min(progress, 100),
      currency,
    };
  });

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  } else if (goalsWithProgress.length > 0) {
    content = (
      <div className="space-y-4">
        {goalsWithProgress.map((goal) => {
          const isComplete = goal.progress >= 100;
          const current = Money.fromCurrencyCode({
            currencyCode: goal.currency,
            amount: goal.currentAmount,
          });
          const target = Money.fromCurrencyCode({
            currencyCode: goal.currency,
            amount: Number(goal.target_amount),
          });

          return (
            <div
              key={goal.id}
              className={cn(
                'rounded-lg border p-3',
                isComplete
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-border bg-muted/40',
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <IconFlag
                    className={cn(
                      'h-4 w-4',
                      isComplete ? 'text-emerald-600' : 'text-blue-600',
                    )}
                  />
                  <p className="text-sm font-semibold">{goal.name}</p>
                </div>
                <p
                  className={cn(
                    'text-xs font-medium',
                    isComplete ? 'text-emerald-700' : 'text-muted-foreground',
                  )}
                >
                  {goal.progress.toFixed(0)}%
                </p>
              </div>

              {goal.description ? (
                <p className="mb-2 text-xs text-muted-foreground">
                  {goal.description}
                </p>
              ) : null}

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full transition-all',
                    isComplete ? 'bg-emerald-500' : 'bg-blue-500',
                  )}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {current.format()}
                </p>
                <p
                  className={cn(
                    'text-xs font-semibold',
                    isComplete ? 'text-emerald-600' : 'text-blue-600',
                  )}
                >
                  {target.format()}
                </p>
              </div>

              {goal.target_date ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Target: {new Date(goal.target_date).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  } else {
    content = (
      <div className="flex h-[150px] items-center justify-center">
        <div className="space-y-2 text-center">
          <IconPigMoney className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No saving goals found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WidgetCard title="Saving Goals" icon={<IconPigMoney size={20} />}>
      {content}
    </WidgetCard>
  );
}
