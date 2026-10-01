import type { SavingGoalDto } from '@guallet/api-client';
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
  targetDate: Date | null;
};

export function validateGoal(values: GoalFormValues) {
  const errors: {
    name?: string;
    targetAmount?: string;
    accountIds?: string;
    targetDate?: string;
  } = {};
  const amount = Number(values.targetAmount.replace(',', '.'));
  if (!values.name.trim()) errors.name = 'Enter a goal name.';
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.targetAmount = 'Enter an amount above zero.';
  }
  if (values.accountIds.length === 0) {
    errors.accountIds = 'Select at least one account.';
  }
  if (values.targetDate && Number.isNaN(values.targetDate.getTime())) {
    errors.targetDate = 'Select a valid date.';
  }
  return { amount, errors, valid: Object.keys(errors).length === 0 };
}
