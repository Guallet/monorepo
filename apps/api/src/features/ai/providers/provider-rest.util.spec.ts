import { fetchProviderJson } from './provider-rest.util';
import { ProviderModelListError } from './provider-model-list.error';

describe('fetchProviderJson', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('adds bearer auth and returns JSON for successful provider responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: [{ id: 'model-1' }] }),
    }) as jest.Mock;

    const result = await fetchProviderJson<{ data: Array<{ id: string }> }>({
      url: 'https://provider.test/v1/models',
      apiToken: 'secret-token',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://provider.test/v1/models',
      {
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer secret-token',
        },
      },
    );
    expect(result).toEqual({ data: [{ id: 'model-1' }] });
  });

  it('throws a provider model-list error for non-2xx responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    }) as jest.Mock;

    await expect(
      fetchProviderJson({
        url: 'https://provider.test/v1/models',
        apiToken: 'bad-token',
      }),
    ).rejects.toThrow(ProviderModelListError);
  });
});
