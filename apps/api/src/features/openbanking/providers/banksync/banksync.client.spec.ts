import { of } from 'rxjs';
import { BankSyncClient } from './banksync.client';

describe('BankSync transaction pagination', () => {
  afterEach(() => vi.useRealTimers());

  it('uses nextCursor and keeps the date range across pages', async () => {
    vi.useFakeTimers();
    const http = {
      get: vi
        .fn<(url: string) => unknown>()
        .mockReturnValueOnce(
          of({
            data: {
              data: [{ id: 'first' }],
              meta: { hasMore: true, nextCursor: 'next-page' },
            },
          }),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: [{ id: 'second' }],
              meta: { hasMore: false },
            },
          }),
        ),
    };
    const result = new BankSyncClient(http as never).getTransactions(
      'key',
      'bank',
      'account',
      '2026-01-01',
      '2026-02-01',
      'user',
    );
    await vi.runAllTimersAsync();
    expect(await result).toMatchObject({
      transactions: [{ id: 'first' }, { id: 'second' }],
    });
    const url = new URL(http.get.mock.calls[1][0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      from: '2026-01-01',
      to: '2026-02-01',
      cursor: 'next-page',
    });
  });
});
