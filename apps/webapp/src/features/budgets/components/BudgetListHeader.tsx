import { BudgetDto } from '@guallet/api-client';
import { useMemo } from 'react';

interface BudgetListHeaderProps {
  budgets: BudgetDto[];
}

export function BudgetListHeader({ budgets }: Readonly<BudgetListHeaderProps>) {
  const { totalBudget, totalSpent, remaining } = useMemo(() => {
    const totalBudget = budgets.reduce(
      (acc, budget) => acc + Number(budget.amount),
      0,
    );
    const totalSpent = budgets.reduce(
      (acc, budget) => acc + Number(budget.spent),
      0,
    );
    const remaining = totalBudget - totalSpent;
    return { totalBudget, totalSpent, remaining };
  }, [budgets]);

  return (
    <div className="mb-4 rounded-md border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-medium">Budget total</p>
        <p className="text-base font-semibold">£{remaining}</p>
      </div>

      <div className="mt-1 flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          £{totalSpent} / £{totalBudget}
        </p>
        <p>Left</p>
      </div>
    </div>
  );
}
