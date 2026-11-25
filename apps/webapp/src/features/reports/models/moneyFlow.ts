import type { MoneyFlowRowDto } from '@guallet/api-client';
import { Money, type Currency } from '@guallet/money';

export type CategoryLevel = '1' | '2';

interface CategoryAmounts {
  id: string | null;
  name: string;
  fullName: string;
  moneyIn: number;
  moneyOut: number;
}

export interface MoneyFlowAmounts {
  categories: CategoryAmounts[];
  moneyIn: number;
  moneyOut: number;
  net: number;
}

export function getMoneyFlowAmounts(
  rows: MoneyFlowRowDto[],
  currency: Currency,
  level: CategoryLevel,
  uncategorised: string,
): MoneyFlowAmounts {
  const categories = new Map<string | null, CategoryAmounts>();
  const minorUnit = 10 ** currency.decimalPlaces;
  const toMinorUnits = (value: string) => {
    const money = Money.from({ amount: Number(value), currency }).round();
    return Math.round(money.amount * minorUnit);
  };
  let moneyIn = 0;
  let moneyOut = 0;

  for (const row of rows) {
    if (row.currency !== currency.code) continue;

    const subcategory = level === '2' ? row.subcategory : null;
    const category = subcategory ?? row.category;
    const id = category?.id ?? null;
    const name = category?.name ?? uncategorised;
    const amounts = categories.get(id) ?? {
      id,
      name,
      fullName:
        subcategory && row.category ? `${row.category.name} / ${name}` : name,
      moneyIn: 0,
      moneyOut: 0,
    };

    const inflow = toMinorUnits(row.moneyIn);
    const outflow = toMinorUnits(row.moneyOut);
    amounts.moneyIn += inflow;
    amounts.moneyOut += outflow;
    moneyIn += inflow;
    moneyOut += outflow;
    categories.set(id, amounts);
  }

  return {
    categories: [...categories.values()].filter(
      (category) => category.moneyIn > 0 || category.moneyOut > 0,
    ),
    moneyIn,
    moneyOut,
    net: moneyIn - moneyOut,
  };
}

type MoneyFlowNode = {
  name: string;
  fullName: string;
  kind: 'income' | 'expense' | 'total' | 'surplus' | 'shortfall';
  amount: number;
  uncategorised?: boolean;
};

export function getMoneyFlowChartData(
  { categories, moneyIn, moneyOut, net }: MoneyFlowAmounts,
  labels: { total: string; surplus: string; shortfall: string },
) {
  const inflows: MoneyFlowNode[] = categories
    .filter((category) => category.moneyIn > 0)
    .sort(
      (a, b) => b.moneyIn - a.moneyIn || a.fullName.localeCompare(b.fullName),
    )
    .map(({ id, name, fullName, moneyIn }) => ({
      name,
      fullName,
      kind: 'income',
      amount: moneyIn,
      uncategorised: id === null,
    }));
  const outflows: MoneyFlowNode[] = categories
    .filter((category) => category.moneyOut > 0)
    .sort(
      (a, b) => b.moneyOut - a.moneyOut || a.fullName.localeCompare(b.fullName),
    )
    .map(({ id, name, fullName, moneyOut }) => ({
      name,
      fullName,
      kind: 'expense',
      amount: -moneyOut,
      uncategorised: id === null,
    }));

  // Balance the centre with the difference between the two actual totals.
  if (net < 0) {
    inflows.push({
      kind: 'shortfall',
      name: labels.shortfall,
      fullName: labels.shortfall,
      amount: net,
    });
  }
  if (net > 0) {
    outflows.push({
      kind: 'surplus',
      name: labels.surplus,
      fullName: labels.surplus,
      amount: net,
    });
  }

  const centre = inflows.length;
  const nodes: MoneyFlowNode[] = [
    ...inflows,
    {
      kind: 'total',
      name: labels.total,
      fullName: labels.total,
      amount: Math.max(moneyIn, moneyOut),
    },
    ...outflows,
  ];
  const links = [
    ...inflows.map((node, source) => ({
      source,
      target: centre,
      value: Math.abs(node.amount),
    })),
    ...outflows.map((node, index) => ({
      source: centre,
      target: centre + 1 + index,
      value: Math.abs(node.amount),
    })),
  ];

  return {
    nodes,
    links,
    maxColumnSize: Math.max(inflows.length, outflows.length),
  };
}
