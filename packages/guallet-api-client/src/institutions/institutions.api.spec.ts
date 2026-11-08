import { afterEach, describe, expect, it, vi } from 'vitest';
import { GualletClientImpl } from '../GualletClient';
import type {
  InstitutionDto,
  UpdateInstitutionRequest,
} from './institutions.models';

describe('institution API contract', () => {
  afterEach(() => vi.restoreAllMocks());

  it('patches the institution using its partial update request', async () => {
    const response: InstitutionDto = { id: 'institution', name: 'Bank' };
    const request: UpdateInstitutionRequest = {
      image_src: 'https://bank.example/logo.png',
    };
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(response)));
    const client = new GualletClientImpl({ baseUrl: 'https://api.example' });
    await expect(
      client.institutions.edit('institution', request),
    ).resolves.toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example/institutions/institution',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(request),
      }),
    );
  });
});
