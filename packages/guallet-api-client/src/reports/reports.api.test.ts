import { describe, expect, it, vi } from 'vitest';
import { GualletClientImpl } from '../GualletClient';

describe('monthly report client', () => {
  it('sends the selected calendar period and filters to the monthly endpoint', async () => {
    const client = new GualletClientImpl({ baseUrl: 'https://example.test' });
    const report = { year: 2026, month: 9, currencies: [] };
    const get = vi.spyOn(client, 'get').mockResolvedValue(report);
    expect(
      await client.reports.getMonthlyReport({
        year: 2026,
        month: 9,
        accounts: ['a', 'b'],
        categories: ['c'],
      }),
    ).toEqual(report);
    expect(get).toHaveBeenCalledWith({
      path: 'reports/monthly?year=2026&month=9&accounts=a%2Cb&categories=c',
    });
  });

  it('omits empty filter lists so they mean all accounts and categories', async () => {
    const client = new GualletClientImpl({ baseUrl: 'https://example.test' });
    const get = vi
      .spyOn(client, 'get')
      .mockResolvedValue({ year: 2026, month: 9, currencies: [] });
    await client.reports.getMonthlyReport({
      year: 2026,
      month: 9,
      accounts: [],
      categories: [],
    });
    expect(get).toHaveBeenCalledWith({
      path: 'reports/monthly?year=2026&month=9',
    });
  });
});
