import { describe, expect, it } from 'vitest';
import type { BudgetDto } from '@guallet/api-client';
import {
  getBudgetMetrics,
  getBudgetMonth,
  getMonthStart,
  shiftBudgetMonth,
} from './models';

describe('budget month navigation', () => {
  it('uses one-based API months across year boundaries', () => {
    const december = getMonthStart(new Date(2026, 11, 28));
    expect(getBudgetMonth(december)).toEqual({ month: 12, year: 2026 });
    expect(getBudgetMonth(shiftBudgetMonth(december, 1))).toEqual({
      month: 1,
      year: 2027,
    });
    expect(getBudgetMonth(shiftBudgetMonth(december, -12))).toEqual({
      month: 12,
      year: 2025,
    });
  });

  it('keeps recurring budgets visible when the selected month has no spending', () => {
    const budget: BudgetDto = {
      id: 'budget-one',
      name: 'Groceries',
      amount: 400,
      currency: 'GBP',
      spent: 0,
      categories: ['category-one'],
    };
    expect(getBudgetMetrics(budget)).toMatchObject({
      amount: 400,
      spent: 0,
      remaining: 400,
      percent: 0,
    });
  });

  it('classifies on-track, near-limit, and over-limit progress', () => {
    const budget: BudgetDto = {
      id: 'budget-one',
      name: 'Groceries',
      amount: 400,
      currency: 'GBP',
      spent: 200,
      categories: ['category-one'],
    };

    expect(getBudgetMetrics(budget)).toMatchObject({
      percent: 50,
      isNearLimit: false,
      isOverBudget: false,
    });
    expect(getBudgetMetrics({ ...budget, spent: 340 })).toMatchObject({
      percent: 85,
      isNearLimit: true,
      isOverBudget: false,
    });
    expect(getBudgetMetrics({ ...budget, spent: 450 })).toMatchObject({
      remaining: -50,
      percent: 112.5,
      isNearLimit: false,
      isOverBudget: true,
    });
  });
});
