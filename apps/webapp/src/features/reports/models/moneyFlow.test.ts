import type { MoneyFlowRowDto } from '@guallet/api-client';
import { Currency, Money } from '@guallet/money';
import { describe, expect, it } from 'vitest';
import {
  getMoneyFlowAmounts,
  getMoneyFlowChartData,
  getMoneyFlowDecimal,
} from './moneyFlow';

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
    expect(overview).toMatchObject({ moneyIn: 30n, moneyOut: 30n, net: 0n });
    expect(overview.categories).toMatchObject([
      { id: 'food', fullName: 'Food', moneyIn: 30n, moneyOut: 20n },
      { id: null, fullName: 'Uncategorised', moneyIn: 0n, moneyOut: 10n },
    ]);

    const details = getMoneyFlowAmounts(rows, currency, '2', 'Uncategorised');
    expect(details).toMatchObject({ moneyIn: 30n, moneyOut: 30n, net: 0n });
    expect(details.categories).toMatchObject([
      {
        id: 'groceries',
        fullName: 'Food / Groceries',
        moneyIn: 10n,
        moneyOut: 20n,
      },
      { id: 'food', fullName: 'Food', moneyIn: 20n, moneyOut: 0n },
      { id: null, fullName: 'Uncategorised', moneyIn: 0n, moneyOut: 10n },
    ]);
  });

  it.each(['0.004', '0.005'])(
    'preserves two £%s entries through aggregation and rounds only the display',
    (value) => {
      const rows: MoneyFlowRowDto[] = [
        {
          currency: 'GBP',
          category: food,
          subcategory: groceries,
          moneyIn: value,
          moneyOut: '0',
        },
        {
          currency: 'GBP',
          category: food,
          subcategory: null,
          moneyIn: value,
          moneyOut: '0',
        },
      ];
      const overview = getMoneyFlowAmounts(
        rows,
        currency,
        '1',
        'Uncategorised',
      );
      const details = getMoneyFlowAmounts(rows, currency, '2', 'Uncategorised');
      expect(overview.categories).toHaveLength(1);
      expect(details.categories).toHaveLength(2);
      expect(details.net).toBe(overview.net);
      const amount = getMoneyFlowDecimal(
        details.moneyIn,
        details.decimalPlaces,
      );
      expect(Money.formatDecimal(amount, currency, 'en-GB')).toBe('£0.01');

      const { links, nodes } = getMoneyFlowChartData(details, labels);
      const centre = nodes.findIndex((node) => node.kind === 'total');
      expect(
        links
          .filter((link) => link.target === centre)
          .map((link) => link.value),
      ).toEqual([Number(value), Number(value)]);
    },
  );

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
      expect(nodes.find((node) => node.kind === kind)?.amount).toBe(
        BigInt(difference),
      );
      expect(links.every((link) => link.value > 0)).toBe(true);
    },
  );
});
