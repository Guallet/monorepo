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
});

describe('GualletClientImpl HTTP errors', () => {
  afterEach(() => vi.restoreAllMocks());

  it('retains a deletion conflict message and status for the UI', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Move or delete the subcategories in this category first.',
        }),
        { status: 409, statusText: 'Conflict' },
      ),
    );
    const client = new GualletClientImpl({
      baseUrl: 'https://api.example.test',
    });
    await expect(client.categories.delete('category')).rejects.toMatchObject({
      status: 409,
      message: 'Move or delete the subcategories in this category first.',
    });
  });

  it('combines API field validation messages', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: ['name must be a string', 'parentId must be a UUID'],
        }),
        { status: 400 },
      ),
    );
    const client = new GualletClientImpl({
      baseUrl: 'https://api.example.test',
    });
    await expect(client.categories.getAll()).rejects.toMatchObject({
      status: 400,
      message: 'name must be a string\nparentId must be a UUID',
    });
  });

  it('falls back to HTTP status text for non-JSON errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>Error</html>', {
        status: 502,
        statusText: 'Bad Gateway',
      }),
    );
    const client = new GualletClientImpl({
      baseUrl: 'https://api.example.test',
    });
    await expect(client.categories.getAll()).rejects.toMatchObject({
      status: 502,
      message: 'Bad Gateway',
    });
  });
});
