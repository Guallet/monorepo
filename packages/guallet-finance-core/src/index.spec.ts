import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { FinanceReadService, normalizePage } from './index.js';

describe('finance read core', () => {
  it('normalizes pagination and enforces the maximum page size', () => {
    expect(normalizePage({})).toEqual({ page: 1, pageSize: 50 });
    expect(normalizePage({ page: -2, pageSize: 500 })).toEqual({
      page: 1,
      pageSize: 100,
    });
  });

  it('always passes the authenticated user to account queries', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: '0' }] });
    const service = new FinanceReadService({ query } as unknown as Pool);

    await service.listAccounts('user-a', { page: 1, pageSize: 10 });

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE a.user_id = $1'),
      ['user-a', 10, 0],
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE user_id = $1'),
      ['user-a'],
    );
  });
});
