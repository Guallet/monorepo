import type { SavingGoalDto } from '@guallet/api-client';
import { Currency } from '@guallet/money';
import { formatMoney } from '../../../utils/formatMoney';

export function formatGoalAmount(amount: number, currency?: string | null) {
  return formatMoney(amount, currency ?? 'GBP', { locale: 'en-GB' });
}

export function goalProgress(goal: SavingGoalDto) {
  return Math.min(100, Math.max(0, goal.progressPercentage));
}

export function goalStatus(goal: SavingGoalDto) {
  if (goal.isCompleted) return 'Complete';
  if (goal.isOverdue) return 'Overdue';
  return null;
}

export type GoalFormValues = {
  name: string;
  targetAmount: string;
  accountIds: string[];
  currency: string | null;
  targetDate: Date | null;
};

export function availableGoalAccountIds(
  selectedIds: string[],
  accounts: { id: string }[],
): string[] {
  const availableIds = new Set(accounts.map((account) => account.id));
  return selectedIds.filter((id) => availableIds.has(id));
}

export function validateGoal(values: GoalFormValues) {
  const errors: {
    name?: string;
    targetAmount?: string;
    accountIds?: string;
    targetDate?: string;
  } = {};
  const amountText = values.targetAmount.trim().replace(',', '.');
  const amount = Number(amountText);
  if (!values.name.trim()) errors.name = 'Enter a goal name.';
  if (
    !/^\d+(?:\.\d+)?$/.test(amountText) ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    errors.targetAmount = 'Enter an amount above zero.';
  } else if (values.currency) {
    let decimalPlaces: number;
    try {
      decimalPlaces = Currency.fromISOCode(values.currency).decimalPlaces;
    } catch {
      errors.accountIds = 'Select accounts with a supported currency.';
      return { amount, errors, valid: false };
    }
    const fractionDigits = amountText.split('.')[1]?.length ?? 0;
    if (fractionDigits > decimalPlaces) {
      errors.targetAmount = `Enter no more than ${decimalPlaces} decimal places for ${values.currency}.`;
    }
  }
  if (values.accountIds.length === 0) {
    errors.accountIds = 'Select at least one account.';
  }
  if (values.targetDate && Number.isNaN(values.targetDate.getTime())) {
    errors.targetDate = 'Select a valid date.';
  }
  return { amount, errors, valid: Object.keys(errors).length === 0 };
}
