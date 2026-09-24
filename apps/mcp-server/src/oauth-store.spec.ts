import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { OAuthStore } from './oauth-store.js';

const config = {
  accessTokenTtlSeconds: 900,
  refreshTokenTtlSeconds: 86_400,
  resource: 'https://mcp.example.com/mcp',
};

describe('OAuthStore', () => {
  it('creates a denial redirect without issuing a token', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            id: '00000000-0000-0000-0000-000000000001',
            client_id: 'client-1',
            redirect_uri: 'https://client.example/callback',
            scopes: ['accounts:read'],
            state: 'state-1',
            code_challenge: 'challenge',
            code_challenge_method: 'S256',
            resource: config.resource,
            expires_at: new Date(Date.now() + 60_000),
            status: 'pending',
          },
        ],
      })
      .mockResolvedValueOnce({ rowCount: 1 });
    const store = new OAuthStore({ query } as unknown as Pool, config);

    const redirect = await store.approveAuthorization(
      '00000000-0000-0000-0000-000000000001',
      'user-1',
      false,
    );

    expect(redirect).toContain('error=access_denied');
    expect(redirect).toContain('state=state-1');
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('rejects a code verifier that does not match the stored challenge', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          client_id: 'client-1',
          redirect_uri: 'https://client.example/callback',
          scopes: ['accounts:read'],
          state: null,
          code_challenge: createHash('sha256')
            .update('expected-verifier')
            .digest('base64url'),
          code_challenge_method: 'S256',
          resource: config.resource,
          expires_at: new Date(Date.now() + 60_000),
          code_expires_at: new Date(Date.now() + 60_000),
          user_id: 'user-1',
          status: 'approved',
        },
      ],
    });
    const store = new OAuthStore({ query } as unknown as Pool, config);

    await expect(
      store.exchangeCode({
        code: 'authorization-code',
        clientId: 'client-1',
        redirectUri: 'https://client.example/callback',
        codeVerifier: 'wrong-verifier',
      }),
    ).rejects.toThrow('Invalid code verifier');
    expect(query).toHaveBeenCalledTimes(1);
  });
});
