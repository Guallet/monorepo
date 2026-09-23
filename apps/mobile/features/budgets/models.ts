import type { BudgetDto } from '@guallet/api-client';

export const MIN_BUDGET_YEAR = 2000;

export type BudgetMonth = {
  month: number;
  year: number;
};

export type BudgetMetrics = {
  amount: number;
  spent: number;
  remaining: number;
  percent: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
};

export function getBudgetMonth(date: Date): BudgetMonth {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function shiftBudgetMonth(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function canMoveToPreviousMonth(date: Date): boolean {
  return date.getFullYear() > MIN_BUDGET_YEAR || date.getMonth() > 0;
}

export function canMoveToNextMonth(date: Date): boolean {
  const current = getMonthStart(new Date());
  return getMonthStart(date) < current;
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

export function getBudgetMetrics(budget: BudgetDto): BudgetMetrics {
  const amount = Math.max(0, Number(budget.amount ?? 0));
  const spent = Math.abs(Number(budget.spent ?? 0));
  const remaining = amount - spent;
  let percent = 0;
  if (amount > 0) {
    percent = (spent / amount) * 100;
  } else if (spent > 0) {
    percent = 100;
  }

  return {
    amount,
    spent,
    remaining,
    percent,
    isOverBudget: percent >= 100,
    isNearLimit: percent >= 80 && percent < 100,
  };
}

export function getProgressColor(
  metrics: BudgetMetrics,
  colors: {
    status: { error: string; warning: string };
    support: { primary: string };
  },
): string {
  if (metrics.isOverBudget) return colors.status.error;
  if (metrics.isNearLimit) return colors.status.warning;
  return colors.support.primary;
}

export function formatBudgetCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
      currencyDisplay: 'narrowSymbol',
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

export function formatTransactionDate(value: Date | string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
