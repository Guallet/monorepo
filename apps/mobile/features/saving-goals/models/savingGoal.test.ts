import { describe, expect, it } from 'vitest';
import type { SavingGoalDto } from '@guallet/api-client';
import { goalProgress, goalStatus, validateGoal } from './savingGoal';

const goal = {
  progressPercentage: 64,
  isCompleted: false,
  isOverdue: false,
} as SavingGoalDto;

describe('saving goal view model', () => {
  it('clamps progress bars and shows completion status', () => {
    expect(goalProgress({ ...goal, progressPercentage: 132 })).toBe(100);
    expect(goalProgress({ ...goal, progressPercentage: -20 })).toBe(0);
    expect(goalStatus({ ...goal, isCompleted: true })).toBe('Complete');
    expect(goalStatus({ ...goal, isOverdue: true })).toBe('Overdue');
  });

  it('rejects missing goal fields and accepts a complete goal', () => {
    expect(
      validateGoal({
        name: '',
        targetAmount: '0',
        accountIds: [],
        targetDate: null,
      }).errors,
    ).toEqual({
      name: 'Enter a goal name.',
      targetAmount: 'Enter an amount above zero.',
      accountIds: 'Select at least one account.',
    });
    expect(
      validateGoal({
        name: 'Trip',
        targetAmount: '1500',
        accountIds: ['a'],
        targetDate: null,
      }).valid,
    ).toBe(true);
  });
});
