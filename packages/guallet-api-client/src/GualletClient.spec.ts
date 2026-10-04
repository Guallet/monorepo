import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, GualletClientImpl } from './GualletClient';

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
});

describe('GualletClientImpl HTTP errors', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    { status: 400, body: JSON.stringify({ message: ['Invalid field'] }) },
    { status: 409, body: JSON.stringify({ message: 'Category conflict' }) },
    { status: 502, body: '<html>Error</html>' },
  ])(
    'exposes HTTP $status without reading its error body',
    async ({ status, body }) => {
      const response = new Response(body, { status });
      const json = vi.spyOn(response, 'json');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);
      const client = new GualletClientImpl({
        baseUrl: 'https://api.example.test',
      });

      await expect(client.categories.delete('category')).rejects.toBeInstanceOf(
        ApiError,
      );
      await expect(client.accounts.getAll()).rejects.toMatchObject({ status });

      expect(json).not.toHaveBeenCalled();
      expect(response.bodyUsed).toBe(false);
    },
  );
});
