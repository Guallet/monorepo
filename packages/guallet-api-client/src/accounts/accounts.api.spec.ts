import { afterEach, describe, expect, it, vi } from 'vitest';
import { GualletClientImpl } from '../GualletClient';
import { AccountConnectionDto } from './accounts.models';

describe('account connection API', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each<AccountConnectionDto>([
    {},
    {
      connection: {
        id: 'connection-1',
        providerId: 'synci',
        remoteAccountId: 'remote-account',
        lastRefresh: '2026-11-07T10:00:00.000Z',
        daysRemaining: null,
        status: 'connected' as const,
      },
    },
  ])(
    'reads the account connection response unchanged: %j',
    async (response) => {
      const fetch = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response(JSON.stringify(response), { status: 200 }),
        );
      const client = new GualletClientImpl({
        baseUrl: 'https://api.example.test',
      });

      await expect(
        client.accounts.getAccountConnection('account-1'),
      ).resolves.toEqual(response);
      expect(fetch.mock.calls[0][0]).toBe(
        'https://api.example.test/accounts/account-1/connection',
      );
    },
  );
});
