import type { MoneyFlowRowDto } from '@guallet/api-client';
import { Currency } from '@guallet/money';
import { describe, expect, it } from 'vitest';
import { getMoneyFlowAmounts, getMoneyFlowChartData } from './moneyFlow';

const currency = Currency.fromISOCode('GBP');
const food = { id: 'food', name: 'Food' };
const groceries = { id: 'groceries', name: 'Groceries' };
const labels = {
  total: 'Cash flow',
  surplus: 'Left over',
  shortfall: 'Shortfall',
};

describe('money flow amounts', () => {
  it('keeps each direction, direct parent amounts, and uncategorised activity at both levels', () => {
    const rows: MoneyFlowRowDto[] = [
      {
        currency: 'GBP',
        category: food,
        subcategory: groceries,
        moneyIn: '0.10',
        moneyOut: '0.20',
      },
      {
        currency: 'GBP',
        category: food,
        subcategory: null,
        moneyIn: '0.20',
        moneyOut: '0',
      },
      {
        currency: 'GBP',
        category: null,
        subcategory: null,
        moneyIn: '0',
        moneyOut: '0.10',
      },
      {
        currency: 'EUR',
        category: food,
        subcategory: groceries,
        moneyIn: '100',
        moneyOut: '200',
      },
    ];

    const overview = getMoneyFlowAmounts(rows, currency, '1', 'Uncategorised');
    expect(overview).toMatchObject({ moneyIn: 30, moneyOut: 30, net: 0 });
    expect(overview.categories).toMatchObject([
      { id: 'food', fullName: 'Food', moneyIn: 30, moneyOut: 20 },
      { id: null, fullName: 'Uncategorised', moneyIn: 0, moneyOut: 10 },
    ]);

    const details = getMoneyFlowAmounts(rows, currency, '2', 'Uncategorised');
    expect(details).toMatchObject({ moneyIn: 30, moneyOut: 30, net: 0 });
    expect(details.categories).toMatchObject([
      {
        id: 'groceries',
        fullName: 'Food / Groceries',
        moneyIn: 10,
        moneyOut: 20,
      },
      { id: 'food', fullName: 'Food', moneyIn: 20, moneyOut: 0 },
      { id: null, fullName: 'Uncategorised', moneyIn: 0, moneyOut: 10 },
    ]);
  });

  it.each([
    ['500', '150', 'surplus', 500, 350],
    ['150', '500', 'shortfall', 500, -350],
    ['500', '0', 'surplus', 500, 500],
    ['0', '500', 'shortfall', 500, -500],
    ['500', '500', 'total', 500, 500],
  ])(
    'balances links for %s in and %s out in a zero-decimal currency',
    (moneyIn, moneyOut, kind, total, difference) => {
      const amounts = getMoneyFlowAmounts(
        [
          {
            currency: 'JPY',
            category: food,
            subcategory: null,
            moneyIn,
            moneyOut,
          },
        ],
        Currency.fromISOCode('JPY'),
        '1',
        'Uncategorised',
      );
      const { nodes, links } = getMoneyFlowChartData(amounts, labels);
      const centre = nodes.findIndex((node) => node.kind === 'total');
      const incoming = links.filter((link) => link.target === centre);
      const outgoing = links.filter((link) => link.source === centre);

      expect(incoming.reduce((sum, link) => sum + link.value, 0)).toBe(total);
      expect(outgoing.reduce((sum, link) => sum + link.value, 0)).toBe(total);
      expect(nodes.find((node) => node.kind === kind)?.amount).toBe(difference);
      expect(links.every((link) => link.value > 0)).toBe(true);
    },
  );
});
