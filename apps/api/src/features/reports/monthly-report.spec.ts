import { aggregateMonthlyReport, selectedCategoryIds } from './monthly-report';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MonthlyReportQueryDto } from './dto/monthly-report-query.dto';

const categories = [
  { id: 'food', name: 'Food', parentId: null },
  { id: 'groceries', name: 'Groceries', parentId: 'food' },
  { id: 'coffee', name: 'Coffee', parentId: 'groceries' },
];

describe('monthly report totals', () => {
  it('keeps gross inflows and outflows separate within a category and currency', () => {
    const groups = aggregateMonthlyReport(categories, [
      { amount: '-0.1', currency: 'GBP', categoryId: 'groceries' },
      { amount: '-0.2', currency: 'GBP', categoryId: 'groceries' },
      { amount: '0.3', currency: 'GBP', categoryId: 'groceries' },
      { amount: '120', currency: 'USD', categoryId: 'food' },
      { amount: '-7', currency: 'GBP', categoryId: null },
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      currency: 'GBP',
      income: '0.3',
      expenses: '7.3',
      net: '-7',
      transactionCount: 4,
    });
    expect(
      groups[0].categories.find((row) => row.categoryId === 'food'),
    ).toMatchObject({ expenses: '0', income: '0' });
    expect(
      groups[0].categories.find((row) => row.categoryId === 'groceries'),
    ).toMatchObject({ income: '0.3', expenses: '0.3' });
    expect(
      groups[0].categories.find((row) => row.categoryId === null),
    ).toMatchObject({ categoryName: 'Untagged', expenses: '7' });
    expect(groups[1]).toMatchObject({
      currency: 'USD',
      income: '120',
      expenses: '0',
      net: '120',
    });
  });

  it('uses currency precision for zero- and three-decimal currencies', () => {
    const groups = aggregateMonthlyReport(
      [],
      [
        { amount: '-200', currency: 'JPY', categoryId: null },
        { amount: '-0.001', currency: 'KWD', categoryId: null },
        { amount: '-0.002', currency: 'KWD', categoryId: null },
      ],
    );
    expect(groups.find((group) => group.currency === 'JPY')?.expenses).toBe(
      '200',
    );
    expect(groups.find((group) => group.currency === 'KWD')?.expenses).toBe(
      '0.003',
    );
  });

  it('does not reveal names of categories outside the user-owned tree', () => {
    const [report] = aggregateMonthlyReport(categories, [
      { amount: '-2', currency: 'GBP', categoryId: 'foreign-category' },
    ]);
    expect(
      report.categories.find((row) => row.transactionCount === 1)?.categoryName,
    ).toBe('Untagged');
    expect(aggregateMonthlyReport(categories, [])).toEqual([]);
  });

  it('expands parent selections without admitting foreign category IDs or cycling', () => {
    expect(selectedCategoryIds(categories, ['food', 'foreign'])).toEqual([
      'food',
      'groceries',
      'coffee',
    ]);
    expect(selectedCategoryIds(categories, ['groceries'])).toEqual([
      'groceries',
      'coffee',
    ]);
    expect(selectedCategoryIds(categories, ['foreign'])).toEqual([]);
    expect(
      selectedCategoryIds(
        [
          { id: 'a', name: 'A', parentId: 'b' },
          { id: 'b', name: 'B', parentId: 'a' },
        ],
        ['a'],
      ),
    ).toEqual(['a', 'b']);
  });
});

describe('monthly report query validation', () => {
  it('transforms valid query strings and comma-separated UUID filters', async () => {
    const query = plainToInstance(MonthlyReportQueryDto, {
      year: '2026',
      month: '9',
      accounts:
        '11111111-1111-4111-8111-111111111111,22222222-2222-4222-8222-222222222222',
    });
    expect(await validate(query)).toEqual([]);
    expect(query.month).toBe(9);
    expect(query.accounts).toHaveLength(2);
  });

  it.each([
    { year: 2026, month: 0 },
    { year: 2026, month: 13 },
    { year: 2026, month: 1.5 },
    { year: 10000, month: 1 },
    { year: 2026, month: 1, accounts: 'not-a-uuid' },
    { year: 2026, month: 1, categories: '' },
    {},
  ])('rejects invalid periods and filter values: %j', async (input) => {
    expect(
      (await validate(plainToInstance(MonthlyReportQueryDto, input))).length,
    ).toBeGreaterThan(0);
  });
});
