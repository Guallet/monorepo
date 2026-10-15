import { afterEach, describe, expect, it, vi } from 'vitest';
import { GualletClientImpl } from '../GualletClient';
const client = new GualletClientImpl({ baseUrl: 'https://api.example.test' });
const institution = {
  id: 'pension',
  name: 'Pension',
  user_id: 'user',
  countries: ['GB'],
};
afterEach(() => vi.restoreAllMocks());
describe('Institution HTTP contract', () => {
  it('updates institutions with PATCH rather than PUT or the accounts endpoint', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(institution)));
    expect(
      await client.institutions.update('pension', {
        name: 'Pension',
        image_src: null,
        country: 'GB',
      }),
    ).toEqual(institution);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/institutions/pension',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Pension',
          image_src: null,
          country: 'GB',
        }),
      }),
    );
  });
  it('keeps the edit alias on the correct endpoint', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(institution)));
    await client.institutions.edit('pension', { name: 'Pension' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/institutions/pension',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
  it('deletes the institution and propagates conflicts', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(institution)));
    await client.institutions.delete('pension');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/institutions/pension',
      expect.objectContaining({ method: 'DELETE' }),
    );
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Institution has accounts' }), {
        status: 409,
      }),
    );
    await expect(client.institutions.delete('pension')).rejects.toMatchObject({
      status: 409,
    });
  });
});
