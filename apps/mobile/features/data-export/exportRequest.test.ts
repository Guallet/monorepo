import { describe, expect, it, vi } from 'vitest';
import { buildExportRequest, submitExportRequest } from './exportRequest';

describe('mobile data export request', () => {
  it('omits optional filters when all accounts and dates are selected', () => {
    expect(
      buildExportRequest({ accountIds: [], dateRange: null, format: 'csv' }),
    ).toEqual({ format: 'csv' });
  });

  it('passes selected accounts, exact date boundaries and format', () => {
    expect(
      buildExportRequest({
        accountIds: ['account-1', 'account-2'],
        dateRange: {
          startDate: new Date('2026-09-01T00:00:00.000Z'),
          endDate: new Date('2026-09-30T23:59:59.999Z'),
        },
        format: 'json',
      }),
    ).toEqual({
      accounts: ['account-1', 'account-2'],
      startDate: '2026-09-01T00:00:00.000Z',
      endDate: '2026-09-30T23:59:59.999Z',
      preserveDateTime: true,
      format: 'json',
    });
  });

  it('preserves local day boundaries when UTC falls on another day', () => {
    const previousZone = process.env.TZ;
    try {
      process.env.TZ = 'Australia/Sydney';
      const startDate = new Date(2026, 8, 1);
      const endDate = new Date(2026, 8, 30, 23, 59, 59, 999);
      expect(startDate.toISOString()).toContain('2026-08-31');
      expect(
        buildExportRequest({
          accountIds: [],
          dateRange: { startDate, endDate },
          format: 'csv',
        }),
      ).toEqual({
        startDate: '2026-08-31T14:00:00.000Z',
        endDate: '2026-09-30T13:59:59.999Z',
        preserveDateTime: true,
        format: 'csv',
      });
    } finally {
      if (previousZone === undefined) delete process.env.TZ;
      else process.env.TZ = previousZone;
    }
  });

  it('rejects invalid dates before submitting', async () => {
    const exportData = vi.fn();
    const result = await submitExportRequest(exportData, {
      accountIds: [],
      dateRange: {
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-09-01'),
      },
      format: 'csv',
    });
    expect(result.status).toBe('failed');
    expect(exportData).not.toHaveBeenCalled();
  });

  it('confirms only an accepted API request', async () => {
    const exportData = vi.fn().mockResolvedValue({
      message: 'Export started. You will receive an email.',
    });
    const result = await submitExportRequest(exportData, {
      accountIds: [],
      dateRange: null,
      format: 'ofe',
    });
    expect(exportData).toHaveBeenCalledWith({ format: 'ofe' });
    expect(result).toEqual({ status: 'accepted' });
  });

  it('returns a retryable failure when the API rejects the request', async () => {
    const failure = new Error('Network unavailable');
    const result = await submitExportRequest(
      vi.fn().mockRejectedValue(failure),
      { accountIds: ['account-1'], dateRange: null, format: 'csv' },
    );
    expect(result).toEqual({ status: 'failed', error: failure });
  });
});
