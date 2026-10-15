import { describe, expect, it } from 'vitest';
import type { SavingGoalDto } from '@guallet/api-client';
import {
  availableGoalAccountIds,
  goalProgress,
  goalStatus,
  validateGoal,
} from './savingGoal';

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
        currency: null,
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
        currency: 'GBP',
        targetDate: null,
      }).valid,
    ).toBe(true);
  });

  it('reports unsupported currencies without throwing', () => {
    expect(
      validateGoal({
        name: 'Trip',
        targetAmount: '10',
        accountIds: ['a'],
        currency: 'ZZZ',
        targetDate: null,
      }).errors.accountIds,
    ).toContain('supported currency');
  });

  it('drops deleted accounts from an edited goal selection', () => {
    expect(
      availableGoalAccountIds(['deleted', 'current'], [{ id: 'current' }]),
    ).toEqual(['current']);
    expect(availableGoalAccountIds(['deleted'], [])).toEqual([]);
  });

  it('validates the target against its currency precision', () => {
    const values = {
      name: 'Trip',
      accountIds: ['a'],
      targetDate: null,
    };
    expect(
      validateGoal({ ...values, targetAmount: '1.5', currency: 'JPY' }).errors
        .targetAmount,
    ).toContain('0 decimal places');
    expect(
      validateGoal({ ...values, targetAmount: '1.234', currency: 'GBP' }).errors
        .targetAmount,
    ).toContain('2 decimal places');
    expect(
      validateGoal({ ...values, targetAmount: '1.234', currency: 'BHD' }).valid,
    ).toBe(true);
    expect(
      validateGoal({ ...values, targetAmount: '1e-3', currency: 'GBP' }).valid,
    ).toBe(false);
  });
});
