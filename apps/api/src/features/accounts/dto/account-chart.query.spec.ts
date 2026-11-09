import { accountChartQuerySchema } from './account-chart.query';

describe('account chart query validation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-07T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it.each([{}, { startDate: '', endDate: '' }])(
    'defaults omitted or empty dates: %j',
    (query) => {
      expect(accountChartQuerySchema.parse(query)).toEqual({
        startDate: new Date(2026, 7, 1),
        endDate: new Date(),
      });
    },
  );
  it('transforms date-only and timestamp values to dates', () => {
    expect(
      accountChartQuerySchema.parse({
        startDate: '2026-10-01',
        endDate: '2026-11-07T12:00:00Z',
      }),
    ).toEqual({ startDate: new Date('2026-10-01'), endDate: new Date() });
  });
  it('accepts equal start and end dates', () => {
    expect(
      accountChartQuerySchema.safeParse({
        startDate: '2026-10-01',
        endDate: '2026-10-01',
      }).success,
    ).toBe(true);
  });
  it.each([
    { startDate: 'not-a-date' },
    { endDate: 'not-a-date' },
    { startDate: ['2026-10-01', '2026-10-02'] },
    { endDate: { value: '2026-10-01' } },
    { startDate: '2026-11-07', endDate: '2026-10-01' },
  ])('rejects invalid dates and reversed ranges: %j', (query) => {
    expect(accountChartQuerySchema.safeParse(query).success).toBe(false);
  });
});
