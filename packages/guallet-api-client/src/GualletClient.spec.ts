import { afterEach, describe, expect, it, vi } from 'vitest';
import { GualletClientImpl } from './GualletClient';

describe('GualletClientImpl authentication', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards the Better Auth session cookie without using bearer auth', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    const client = new GualletClientImpl({
      baseUrl: 'https://api.example.test',
      cookieHelper: {
        getCookie: () => 'better-auth.session_token=session-token',
      },
    });

    await client.accounts.getAll();

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(requestInit.headers);

    expect(headers.get('cookie')).toBe(
      'better-auth.session_token=session-token',
    );
    expect(headers.get('authorization')).toBeNull();
    expect(requestInit.credentials).toBe('omit');
  });

  it('uses browser-managed credentials when no session cookie is available', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    const client = new GualletClientImpl({
      baseUrl: 'https://api.example.test',
    });

    await client.accounts.getAll();

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(requestInit.credentials).toBe('include');
  });

  it('keeps credentials isolated between clients for different users', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response('[]', { status: 200 }));
    const firstUser = new GualletClientImpl({
      baseUrl: 'https://api.example.test',
      cookieHelper: { getCookie: () => 'session=first-user' },
    });
    const secondUser = new GualletClientImpl({
      baseUrl: 'https://api.example.test',
      cookieHelper: { getCookie: () => 'session=second-user' },
    });

    expect(await firstUser.accounts.getAll()).toEqual([]);
    expect(await secondUser.accounts.getAll()).toEqual([]);

    const firstRequest = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const secondRequest = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(new Headers(firstRequest.headers).get('cookie')).toBe(
      'session=first-user',
    );
    expect(new Headers(secondRequest.headers).get('cookie')).toBe(
      'session=second-user',
    );
  });

  it('returns an empty collection response as an empty collection', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('[]', { status: 200 }),
    );
    const client = new GualletClientImpl({
      baseUrl: 'https://api.example.test',
    });

    await expect(client.accounts.getAll()).resolves.toEqual([]);
  });

  it('accepts an empty successful response from delete endpoints', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }));
    const client = new GualletClientImpl({
      baseUrl: 'https://api.example.test',
    });

    await expect(client.accounts.delete('account-1')).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'DELETE' });
  });

  it('serializes explicit nulls and UTC date boundaries in transaction requests', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response(JSON.stringify({ transactions: [], meta: {} }), {
          status: 200,
        }),
    );
    const client = new GualletClientImpl({
      baseUrl: 'https://api.example.test',
    });
    const startDate = new Date('2024-03-31T23:00:00-01:00');
    const endDate = new Date('2024-04-01T00:00:00Z');

    await client.transactions.update({
      transactionId: 'transaction-1',
      request: {
        description: null,
        notes: null,
        amount: null,
        currency: null,
        date: null,
        categoryId: null,
      },
    });
    await client.transactions.loadTransactions({
      page: 1,
      startDate,
      endDate,
    });

    const updateInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(updateInit.body as string)).toEqual({
      description: null,
      notes: null,
      amount: null,
      currency: null,
      date: null,
      categoryId: null,
    });
    const requestUrl = new URL(fetchMock.mock.calls[1]?.[0] as string);
    expect(requestUrl.searchParams.get('startDate')).toBe(
      '2024-04-01T00:00:00.000Z',
    );
    expect(requestUrl.searchParams.get('endDate')).toBe(
      '2024-04-01T00:00:00.000Z',
    );
  });
});
