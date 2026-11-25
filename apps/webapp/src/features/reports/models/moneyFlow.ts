import type { MoneyFlowRowDto } from '@guallet/api-client';
import type { Currency } from '@guallet/money';

export type CategoryLevel = '1' | '2';

interface CategoryAmounts {
  id: string | null;
  name: string;
  fullName: string;
  moneyIn: bigint;
  moneyOut: bigint;
}

export interface MoneyFlowAmounts {
  categories: CategoryAmounts[];
  decimalPlaces: number;
  moneyIn: bigint;
  moneyOut: bigint;
  net: bigint;
}

export function getMoneyFlowAmounts(
  rows: MoneyFlowRowDto[],
  currency: Currency,
  level: CategoryLevel,
  uncategorised: string,
): MoneyFlowAmounts {
  const currencyRows = rows.filter((row) => row.currency === currency.code);
  const decimalPlaces = currencyRows.reduce(
    (places, row) =>
      Math.max(
        places,
        row.moneyIn.split('.')[1]?.length ?? 0,
        row.moneyOut.split('.')[1]?.length ?? 0,
      ),
    currency.decimalPlaces,
  );
  const toScaledAmount = (value: string) => {
    const [whole, fraction = ''] = value.split('.');
    return BigInt(whole + fraction.padEnd(decimalPlaces, '0'));
  };
  const categories = new Map<string | null, CategoryAmounts>();
  let moneyIn = 0n;
  let moneyOut = 0n;

  for (const row of currencyRows) {
    const subcategory = level === '2' ? row.subcategory : null;
    const category = subcategory ?? row.category;
    const id = category?.id ?? null;
    const name = category?.name ?? uncategorised;
    const amounts = categories.get(id) ?? {
      id,
      name,
      fullName:
        subcategory && row.category ? `${row.category.name} / ${name}` : name,
      moneyIn: 0n,
      moneyOut: 0n,
    };

    const inflow = toScaledAmount(row.moneyIn);
    const outflow = toScaledAmount(row.moneyOut);
    amounts.moneyIn += inflow;
    amounts.moneyOut += outflow;
    moneyIn += inflow;
    moneyOut += outflow;
    categories.set(id, amounts);
  }

  return {
    categories: [...categories.values()].filter(
      (category) => category.moneyIn > 0n || category.moneyOut > 0n,
    ),
    decimalPlaces,
    moneyIn,
    moneyOut,
    net: moneyIn - moneyOut,
  };
}

// The exponent places the decimal point without converting the scaled integer.
export function getMoneyFlowDecimal(
  amount: bigint,
  decimalPlaces: number,
): `${number}` {
  return `${amount}e-${decimalPlaces}` as `${number}`;
}

export type MoneyFlowNode = {
  name: string;
  fullName: string;
  kind: 'income' | 'expense' | 'total' | 'surplus' | 'shortfall';
  amount: bigint;
  uncategorised?: boolean;
};

export function getMoneyFlowChartData(
  { categories, decimalPlaces, moneyIn, moneyOut, net }: MoneyFlowAmounts,
  labels: { total: string; surplus: string; shortfall: string },
) {
  const inflows: MoneyFlowNode[] = categories
    .filter((category) => category.moneyIn > 0n)
    .sort(
      (a, b) =>
        Number(b.moneyIn - a.moneyIn) || a.fullName.localeCompare(b.fullName),
    )
    .map(({ id, name, fullName, moneyIn }) => ({
      name,
      fullName,
      kind: 'income',
      amount: moneyIn,
      uncategorised: id === null,
    }));
  const outflows: MoneyFlowNode[] = categories
    .filter((category) => category.moneyOut > 0n)
    .sort(
      (a, b) =>
        Number(b.moneyOut - a.moneyOut) || a.fullName.localeCompare(b.fullName),
    )
    .map(({ id, name, fullName, moneyOut }) => ({
      name,
      fullName,
      kind: 'expense',
      amount: -moneyOut,
      uncategorised: id === null,
    }));

  // Balance the centre with the difference between the two actual totals.
  if (net < 0n) {
    inflows.push({
      kind: 'shortfall',
      name: labels.shortfall,
      fullName: labels.shortfall,
      amount: net,
    });
  }
  if (net > 0n) {
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
      amount: moneyIn > moneyOut ? moneyIn : moneyOut,
    },
    ...outflows,
  ];
  const links = [
    ...inflows.map((node, source) => ({
      source,
      target: centre,
      value: Math.abs(Number(getMoneyFlowDecimal(node.amount, decimalPlaces))),
    })),
    ...outflows.map((node, index) => ({
      source: centre,
      target: centre + 1 + index,
      value: Math.abs(Number(getMoneyFlowDecimal(node.amount, decimalPlaces))),
    })),
  ];

  return {
    nodes,
    links,
    maxColumnSize: Math.max(inflows.length, outflows.length),
  };
}
