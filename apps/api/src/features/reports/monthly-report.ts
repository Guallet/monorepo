import { Currency, Money } from '@guallet/money/node';
import type { MonthlyReportCurrencyDto } from './dto/monthly-report.dto';

type ReportCategory = { id: string; name: string; parentId?: string | null };
type ReportTransaction = {
  amount: number | string;
  currency: string;
  categoryId: string | null;
};

/** Expand selections only through the user-owned category tree. */
export function selectedCategoryIds(
  categories: ReportCategory[],
  selected: string[],
): string[] {
  const ids = new Set(
    categories
      .filter((category) => selected.includes(category.id))
      .map((category) => category.id),
  );
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) {
      if (
        category.parentId &&
        ids.has(category.parentId) &&
        !ids.has(category.id)
      ) {
        ids.add(category.id);
        changed = true;
      }
    }
  }
  return [...ids];
}

/** Gross inflows/outflows cannot be inferred from a category's net balance. */
export function aggregateMonthlyReport(
  categories: ReportCategory[],
  transactions: ReportTransaction[],
): MonthlyReportCurrencyDto[] {
  const groups = new Map<string, MonthlyReportCurrencyDto>();
  for (const transaction of transactions) {
    const currency = Currency.fromISOCode(transaction.currency);
    let group = groups.get(currency.code);
    if (!group) {
      const ownedIds = new Set(categories.map((category) => category.id));
      group = {
        currency: currency.code,
        income: '0',
        expenses: '0',
        net: '0',
        transactionCount: 0,
        categories: categories.map((category) => ({
          categoryId: category.id,
          categoryName: category.name,
          parentId:
            category.parentId && ownedIds.has(category.parentId)
              ? category.parentId
              : null,
          income: '0',
          expenses: '0',
          transactionCount: 0,
        })),
      };
      groups.set(currency.code, group);
    }
    let row = group.categories.find(
      (category) => category.categoryId === transaction.categoryId,
    );
    if (!row) {
      row = group.categories.find((category) => category.categoryId === null);
      if (!row) {
        row = {
          categoryId: null,
          categoryName: 'Untagged',
          parentId: null,
          income: '0',
          expenses: '0',
          transactionCount: 0,
        };
        group.categories.push(row);
      }
    }
    const amount = Money.from({
      amount: Number(transaction.amount),
      currency,
    }).round();
    const add = (current: string) =>
      Money.from({ amount: Number(current), currency })
        .add(amount.abs())
        .round()
        .amount.toString();
    if (amount.amount > 0) {
      row.income = add(row.income);
      group.income = add(group.income);
    } else if (amount.amount < 0) {
      row.expenses = add(row.expenses);
      group.expenses = add(group.expenses);
    }
    row.transactionCount++;
    group.transactionCount++;
    group.net = Money.from({ amount: Number(group.income), currency })
      .subtract(Money.from({ amount: Number(group.expenses), currency }))
      .round()
      .amount.toString();
  }
  return [...groups.values()].sort((a, b) =>
    a.currency.localeCompare(b.currency),
  );
}
