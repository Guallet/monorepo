import { describe, expect, it } from 'vitest';
import type { MonthlyReportCurrencyDto } from '@guallet/api-client';
import {
  categoryDetails,
  periodLabel,
  previousMonth,
  reportCategories,
  shiftMonth,
} from './reportModels';

const report: MonthlyReportCurrencyDto = {
  currency: 'GBP',
  income: '500',
  expenses: '35',
  net: '465',
  transactionCount: 4,
  categories: [
    {
      categoryId: 'food',
      categoryName: 'Food',
      parentId: null,
      income: '500',
      expenses: '5',
      transactionCount: 1,
    },
    {
      categoryId: 'groceries',
      categoryName: 'Groceries',
      parentId: 'food',
      income: '0',
      expenses: '10',
      transactionCount: 1,
    },
    {
      categoryId: 'coffee',
      categoryName: 'Coffee',
      parentId: 'groceries',
      income: '0',
      expenses: '15',
      transactionCount: 1,
    },
    {
      categoryId: null,
      categoryName: 'Untagged',
      parentId: null,
      income: '0',
      expenses: '5',
      transactionCount: 1,
    },
  ],
};

describe('mobile report models', () => {
  it('rolls up descendants once and preserves direct amounts in drilldowns', () => {
    const rows = reportCategories(report, 'spending');
    expect(rows.map((row) => row.amount)).toEqual([30, 5]);
    expect(categoryDetails(rows[0]).map((row) => row.amount)).toEqual([25, 5]);
    expect(rows[0].children[0].children[0].amount).toBe(15);
    expect(report.categories[0].expenses).toBe('5');
  });

  it('uses income totals independently and omits empty descendants', () => {
    const rows = reportCategories(report, 'income');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ amount: 500, children: [] });
  });

  it('tolerates malformed category cycles without losing or duplicating amounts', () => {
    const cyclic = {
      ...report,
      categories: report.categories.map((row) => {
        if (row.categoryId === 'food') return { ...row, parentId: 'coffee' };
        return row;
      }),
    };
    expect(
      reportCategories(cyclic, 'spending').reduce(
        (sum, row) => sum + row.amount,
        0,
      ),
    ).toBe(35);
  });

  it('moves through year boundaries and formats UTC calendar months', () => {
    expect(previousMonth(new Date(2026, 0, 15))).toEqual({
      year: 2025,
      month: 12,
    });
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    });
    expect(periodLabel({ year: 2026, month: 9 }, 'en-GB')).toBe(
      'September 2026',
    );
  });
});
