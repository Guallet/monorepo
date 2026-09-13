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
    expect(requestInit.credentials).toBe('include');
  });
});
