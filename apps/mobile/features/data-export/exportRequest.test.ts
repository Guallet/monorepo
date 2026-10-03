import { describe, expect, it, vi } from 'vitest';
import {
  buildExportRequest,
  snapshotExportSelection,
  submitExportRequest,
} from './exportRequest';

describe('mobile data export request', () => {
  it('omits optional filters when all accounts and dates are selected', () => {
    expect(
      buildExportRequest({ accountIds: [], dateRange: null, format: 'csv' }),
    ).toEqual({ format: 'csv' });
  });

  it('passes selected accounts, dates and format', () => {
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
      format: 'json',
    });
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

  it('keeps a submitted snapshot when the form selection later changes', () => {
    const accountIds = ['account-1'];
    const startDate = new Date('2026-09-01T00:00:00.000Z');
    const submitted = snapshotExportSelection({
      accountIds,
      dateRange: { startDate, endDate: new Date('2026-09-30T23:59:59.999Z') },
      format: 'csv',
    });

    accountIds.push('account-2');
    startDate.setUTCDate(2);

    expect(submitted.accountIds).toEqual(['account-1']);
    expect(submitted.dateRange?.startDate.toISOString()).toBe(
      '2026-09-01T00:00:00.000Z',
    );
    expect(submitted.format).toBe('csv');
  });
});
