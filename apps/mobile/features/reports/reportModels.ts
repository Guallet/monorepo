import type { MonthlyReportCurrencyDto } from '@guallet/api-client';
import { Money } from '@guallet/money';

export type ReportView = 'spending' | 'income' | 'cashflow';
export type ReportPeriod = { year: number; month: number };
export type ReportCategory = {
  id: string;
  name: string;
  amount: number;
  directAmount: number;
  children: ReportCategory[];
};

export function previousMonth(now = new Date()): ReportPeriod {
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function shiftMonth(period: ReportPeriod, offset: number): ReportPeriod {
  const date = new Date(Date.UTC(period.year, period.month - 1 + offset, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function periodLabel(period: ReportPeriod, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(period.year, period.month - 1, 1)));
}

/** Direct totals occur once; each parent includes its descendants once. */
export function reportCategories(
  report: MonthlyReportCurrencyDto,
  view: 'income' | 'spending',
): ReportCategory[] {
  const nodes = new Map<string, ReportCategory>();
  for (const row of report.categories) {
    let amount = Number(row.expenses);
    if (view === 'income') amount = Number(row.income);
    const id = row.categoryId ?? 'untagged';
    nodes.set(id, {
      id,
      name: row.categoryName,
      amount,
      directAmount: amount,
      children: [],
    });
  }
  const roots: ReportCategory[] = [];
  for (const row of report.categories) {
    const node = nodes.get(row.categoryId ?? 'untagged');
    if (!node) continue;
    const parent = row.parentId && nodes.get(row.parentId);
    // Malformed category cycles must never lead to recursive chart rendering.
    const ancestors = new Set<string>([node.id]);
    let next = row.parentId;
    let cyclic = false;
    while (next) {
      if (ancestors.has(next)) {
        cyclic = true;
        break;
      }
      ancestors.add(next);
      next =
        report.categories.find((category) => category.categoryId === next)
          ?.parentId ?? null;
    }
    if (parent && !cyclic) parent.children.push(node);
    else roots.push(node);
  }
  function total(node: ReportCategory): ReportCategory {
    node.children = node.children
      .map(total)
      .filter((child) => child.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    node.amount = node.children.reduce(
      (sum, child) =>
        sum
          .add(
            Money.fromCurrencyCode({
              amount: child.amount,
              currencyCode: report.currency,
            }),
          )
          .round(),
      Money.fromCurrencyCode({
        amount: node.directAmount,
        currencyCode: report.currency,
      }),
    ).amount;
    return node;
  }
  return roots
    .map(total)
    .filter((node) => node.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function categoryDetails(category: ReportCategory): ReportCategory[] {
  const rows = [...category.children];
  if (category.directAmount > 0) {
    rows.push({
      id: `${category.id}-direct`,
      name: `Directly in ${category.name}`,
      amount: category.directAmount,
      directAmount: category.directAmount,
      children: [],
    });
  }
  return rows.sort((a, b) => b.amount - a.amount);
}
