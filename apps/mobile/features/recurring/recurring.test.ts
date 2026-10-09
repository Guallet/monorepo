import { describe, expect, it } from 'vitest';
import {
  RecurrenceCadence,
  RecurringPaymentType,
  type SubscriptionDto,
} from '@guallet/api-client';
import {
  addDays,
  calendarDate,
  nextPaymentDate,
  parseCalendarDate,
  summarise,
  upcomingPayments,
  validateRecurring,
  yearlyEstimate,
} from './recurring';

const base: SubscriptionDto = {
  id: 'spotify',
  user_id: 'user',
  name: 'Spotify',
  amount: 10.99,
  currency: 'GBP',
  type: RecurringPaymentType.SUBSCRIPTION,
  cadence: RecurrenceCadence.MONTHLY,
  startDate: '2024-01-31',
};
const date = (value: string) => parseCalendarDate(value)!;
const next = (item: SubscriptionDto, from: string) => {
  const result = nextPaymentDate(item, date(from));
  if (!result) return null;
  return calendarDate(result);
};

describe('recurring payment dates', () => {
  it('preserves the original monthly anchor after a shorter month', () => {
    expect(next(base, '2024-02-01')).toBe('2024-02-29');
    expect(next(base, '2024-03-01')).toBe('2024-03-31');
    expect(next(base, '2025-02-01')).toBe('2025-02-28');
    expect(next(base, '2025-03-01')).toBe('2025-03-31');
  });
  it('includes today and does not project before the first payment', () => {
    expect(next(base, '2024-01-31')).toBe('2024-01-31');
    expect(next(base, '2020-01-01')).toBe('2024-01-31');
  });
  it('clamps quarterly and annual occurrences without drifting the anchor', () => {
    expect(
      next({ ...base, cadence: RecurrenceCadence.QUARTERLY }, '2024-02-01'),
    ).toBe('2024-04-30');
    expect(
      next({ ...base, cadence: RecurrenceCadence.QUARTERLY }, '2024-05-01'),
    ).toBe('2024-07-31');
    const leap = {
      ...base,
      cadence: RecurrenceCadence.YEARLY,
      startDate: '2024-02-29',
    };
    expect(next(leap, '2025-02-01')).toBe('2025-02-28');
    expect(next(leap, '2028-02-01')).toBe('2028-02-29');
  });
  it('uses calendar days for weekly and fortnightly schedules across DST', () => {
    const weekly = {
      ...base,
      cadence: RecurrenceCadence.WEEKLY,
      startDate: '2024-03-03',
    };
    expect(
      upcomingPayments([weekly], date('2024-03-03'), date('2024-03-24')).map(
        (row) => calendarDate(row.date),
      ),
    ).toEqual(['2024-03-03', '2024-03-10', '2024-03-17', '2024-03-24']);
    expect(
      next({ ...weekly, cadence: RecurrenceCadence.BIWEEKLY }, '2024-03-04'),
    ).toBe('2024-03-17');
  });
  it('handles dates saved decades ago without iterating every old occurrence', () => {
    expect(
      next(
        { ...base, cadence: RecurrenceCadence.WEEKLY, startDate: '1970-01-01' },
        '2026-10-09',
      ),
    ).toBe('2026-10-15');
  });
  it('does not invent dates for missing or invalid anchors', () => {
    for (const startDate of [
      undefined,
      '',
      'not a date',
      '2024-02-30',
      '2024-13-01',
    ]) {
      expect(next({ ...base, startDate }, '2024-03-01')).toBeNull();
      expect(
        upcomingPayments(
          [{ ...base, startDate }],
          date('2024-03-01'),
          date('2024-03-31'),
        ),
      ).toEqual([]);
    }
    expect(parseCalendarDate(null)).toBeNull();
  });
  it('uses the stored calendar portion regardless of an ISO timestamp offset', () => {
    expect(calendarDate(date('2024-05-01T23:00:00-08:00'))).toBe('2024-05-01');
  });
  it('sorts occurrences and gives repeated payments distinct stable keys', () => {
    const weekly = {
      ...base,
      cadence: RecurrenceCadence.WEEKLY,
      startDate: '2024-01-01',
    };
    const other = {
      ...base,
      id: 'rent',
      name: 'Rent',
      startDate: '2024-01-08',
    };
    const rows = upcomingPayments(
      [weekly, other],
      date('2024-01-01'),
      date('2024-01-15'),
    );
    expect(rows.map((row) => row.key)).toEqual([
      'spotify:2024-01-01',
      'rent:2024-01-08',
      'spotify:2024-01-08',
      'spotify:2024-01-15',
    ]);
    expect(
      upcomingPayments([weekly], date('2024-02-01'), date('2024-01-01')),
    ).toEqual([]);
  });
  it('covers exactly 30 calendar days in the upcoming view', () => {
    expect(calendarDate(addDays(date('2024-03-01'), 29))).toBe('2024-03-30');
  });
});

describe('recurring money summaries', () => {
  it('groups currencies and separates income from expenses', () => {
    const totals = summarise(
      [
        base,
        {
          ...base,
          id: 'salary',
          type: RecurringPaymentType.REGULAR_INCOME,
          amount: 2400,
        },
        { ...base, id: 'usd', currency: 'USD', amount: 9.99 },
      ],
      false,
    );
    expect(
      totals.map((total) => [
        total.currency,
        total.payments.amount,
        total.income.amount,
      ]),
    ).toEqual([
      ['GBP', -10.99, 2400],
      ['USD', -9.99, 0],
    ]);
  });
  it('annualises weekly and fortnightly costs rather than assuming four weeks', () => {
    expect(
      yearlyEstimate({ ...base, amount: 10, cadence: RecurrenceCadence.WEEKLY })
        .amount,
    ).toBe(-520);
    expect(
      yearlyEstimate({
        ...base,
        amount: 10,
        cadence: RecurrenceCadence.BIWEEKLY,
      }).amount,
    ).toBe(-260);
    expect(
      summarise(
        [{ ...base, amount: 120, cadence: RecurrenceCadence.YEARLY }],
        true,
      )[0].payments.amount,
    ).toBe(-10);
  });
  it('counts actual occurrences separately from normalised estimates', () => {
    const weekly = {
      ...base,
      amount: 10,
      startDate: '2024-03-01',
      cadence: RecurrenceCadence.WEEKLY,
    };
    const rows = upcomingPayments(
      [weekly],
      date('2024-03-01'),
      date('2024-03-31'),
    );
    expect(
      summarise(
        rows.map((row) => row.item),
        false,
      )[0].payments.amount,
    ).toBe(-50);
    expect(summarise([weekly], true)[0].payments.amount).toBeCloseTo(
      -43.333333,
    );
  });
  it('totals undated plans by cadence but excludes them from projections', () => {
    expect(
      summarise([{ ...base, startDate: undefined }], true)[0].payments.amount,
    ).toBe(-10.99);
    expect(
      upcomingPayments(
        [{ ...base, startDate: undefined }],
        date('2024-01-01'),
        date('2024-12-31'),
      ),
    ).toEqual([]);
  });
  it('excludes unsupported legacy currencies from totals without blocking other records', () => {
    expect(summarise([{ ...base, currency: 'ZZZ' }, base], false)).toHaveLength(
      1,
    );
  });
});

describe('recurring form validation', () => {
  const values = {
    name: 'Spotify',
    amount: 10.99,
    currency: 'GBP',
    cadence: RecurrenceCadence.MONTHLY,
    type: RecurringPaymentType.SUBSCRIPTION,
    startDate: null,
    categoryId: null,
  };
  it('accepts optional date/category and requires a name and positive finite amount', () => {
    expect(validateRecurring(values)).toEqual({});
    expect(validateRecurring({ ...values, name: '  ', amount: 0 })).toEqual({
      name: 'Enter a name.',
      amount: 'Enter an amount above zero.',
    });
    for (const amount of [null, -1, Infinity, NaN])
      expect(validateRecurring({ ...values, amount }).amount).toBeTruthy();
  });
  it('validates JPY, GBP and BHD at their own precision', () => {
    expect(
      validateRecurring({ ...values, currency: 'JPY', amount: 1.5 }).amount,
    ).toContain('0 decimal');
    expect(validateRecurring({ ...values, amount: 1.234 }).amount).toContain(
      '2 decimal',
    );
    expect(
      validateRecurring({ ...values, currency: 'BHD', amount: 1.234 }),
    ).toEqual({});
    expect(
      validateRecurring({ ...values, currency: 'JPY', amount: 123 }),
    ).toEqual({});
  });
  it('rejects unsupported codes, invalid dates and unsafe amount precision', () => {
    expect(validateRecurring({ ...values, currency: 'ZZZ' }).amount).toContain(
      'supported currency',
    );
    expect(
      validateRecurring({ ...values, startDate: new Date(NaN) }).startDate,
    ).toBeTruthy();
    expect(
      validateRecurring({ ...values, amount: Number.MAX_SAFE_INTEGER }).amount,
    ).toBeTruthy();
  });
});
