import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Pool, QueryResultRow } from 'pg';

export const READ_SCOPES = [
  'accounts:read',
  'transactions:read',
  'categories:read',
  'rules:read',
  'budgets:read',
  'saving-goals:read',
  'recurring-payments:read',
  'reports:read',
  'notifications:read',
  'connections:read',
] as const;

export type ReadScope = (typeof READ_SCOPES)[number];

export interface OAuthClient {
  clientId: string;
  clientName: string;
  redirectUris: string[];
}

export interface TokenPrincipal {
  userId: string;
  clientId: string;
  scopes: string[];
  tokenId: string;
}

export interface AuthorizationRequest {
  id: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string | null;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string | null;
  expiresAt: Date;
}

export class OAuthStore {
  constructor(
    private readonly pool: Pool,
    private readonly config: {
      accessTokenTtlSeconds: number;
      refreshTokenTtlSeconds: number;
      resource: string;
    },
  ) {}

  async ensureSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS mcp_oauth_clients (
        client_id text PRIMARY KEY,
        client_name text NOT NULL,
        redirect_uris jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS mcp_oauth_requests (
        id uuid PRIMARY KEY,
        client_id text NOT NULL REFERENCES mcp_oauth_clients(client_id) ON DELETE CASCADE,
        redirect_uri text NOT NULL,
        scopes text[] NOT NULL,
        state text,
        code_challenge text NOT NULL,
        code_challenge_method text NOT NULL,
        resource text,
        user_id text,
        code_hash text,
        status text NOT NULL DEFAULT 'pending',
        expires_at timestamptz NOT NULL,
        code_expires_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS mcp_oauth_tokens (
        id uuid PRIMARY KEY,
        client_id text NOT NULL REFERENCES mcp_oauth_clients(client_id) ON DELETE CASCADE,
        user_id text NOT NULL,
        scopes text[] NOT NULL,
        access_token_hash text NOT NULL UNIQUE,
        refresh_token_hash text NOT NULL UNIQUE,
        access_expires_at timestamptz NOT NULL,
        refresh_expires_at timestamptz NOT NULL,
        resource text NOT NULL DEFAULT '',
        revoked_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE mcp_oauth_tokens ADD COLUMN IF NOT EXISTS resource text NOT NULL DEFAULT '';
      CREATE INDEX IF NOT EXISTS mcp_oauth_requests_code_hash_idx
        ON mcp_oauth_requests(code_hash);
      CREATE INDEX IF NOT EXISTS mcp_oauth_tokens_access_hash_idx
        ON mcp_oauth_tokens(access_token_hash);
      CREATE INDEX IF NOT EXISTS mcp_oauth_tokens_refresh_hash_idx
        ON mcp_oauth_tokens(refresh_token_hash);
    `);
  }

  async registerClient(input: {
    clientName: string;
    redirectUris: string[];
  }): Promise<OAuthClient> {
    const clientId = `guallet_${randomBytes(18).toString('base64url')}`;
    await this.pool.query(
      `INSERT INTO mcp_oauth_clients (client_id, client_name, redirect_uris)
       VALUES ($1, $2, $3::jsonb)`,
      [
        clientId,
        input.clientName.slice(0, 120),
        JSON.stringify(input.redirectUris),
      ],
    );
    return {
      clientId,
      clientName: input.clientName.slice(0, 120),
      redirectUris: input.redirectUris,
    };
  }

  async getClient(clientId: string): Promise<OAuthClient | null> {
    const result = await this.pool.query<ClientRow>(
      'SELECT client_id, client_name, redirect_uris FROM mcp_oauth_clients WHERE client_id = $1',
      [clientId],
    );
    const row = result.rows[0];
    return row
      ? {
          clientId: row.client_id,
          clientName: row.client_name,
          redirectUris: row.redirect_uris as string[],
        }
      : null;
  }

  async createAuthorizationRequest(
    input: Omit<AuthorizationRequest, 'id'>,
  ): Promise<string> {
    const id = randomUUID();
    await this.pool.query(
      `INSERT INTO mcp_oauth_requests
        (id, client_id, redirect_uri, scopes, state, code_challenge,
         code_challenge_method, resource, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        input.clientId,
        input.redirectUri,
        input.scopes,
        input.state,
        input.codeChallenge,
        input.codeChallengeMethod,
        input.resource,
        input.expiresAt,
      ],
    );
    return id;
  }

  async getAuthorizationRequest(id: string) {
    const result = await this.pool.query<
      AuthorizationRequestRow & { client_name: string }
    >(
      `SELECT r.id, r.client_id, c.client_name, r.redirect_uri, r.scopes,
              r.state, r.code_challenge, r.code_challenge_method, r.resource,
              r.expires_at, r.status
         FROM mcp_oauth_requests r
         JOIN mcp_oauth_clients c ON c.client_id = r.client_id
        WHERE r.id = $1 AND r.status = 'pending' AND r.expires_at > now()`,
      [id],
    );
    const row = result.rows[0];
    return row
      ? {
          id: row.id,
          clientName: row.client_name,
          scopes: row.scopes,
          expiresAt: row.expires_at,
        }
      : null;
  }

  async approveAuthorization(id: string, userId: string, approved: boolean) {
    const requestResult = await this.pool.query<AuthorizationRequestRow>(
      `SELECT id, client_id, redirect_uri, scopes, state, code_challenge,
              code_challenge_method, resource, expires_at, status
         FROM mcp_oauth_requests
        WHERE id = $1 AND status = 'pending' AND expires_at > now()`,
      [id],
    );
    const request = requestResult.rows[0];
    if (!request)
      throw new Error('Authorization request is expired or already used');

    if (!approved) {
      await this.pool.query(
        `UPDATE mcp_oauth_requests SET status = 'denied', user_id = $2 WHERE id = $1`,
        [id, userId],
      );
      return buildRedirect(request.redirect_uri, {
        error: 'access_denied',
        state: request.state,
      });
    }

    const code = randomBytes(32).toString('base64url');
    await this.pool.query(
      `UPDATE mcp_oauth_requests
          SET status = 'approved', user_id = $2, code_hash = $3,
              code_expires_at = now() + interval '5 minutes'
        WHERE id = $1`,
      [id, userId, hash(code)],
    );
    return buildRedirect(request.redirect_uri, { code, state: request.state });
  }

  async exchangeCode(input: {
    code: string;
    clientId: string;
    redirectUri: string;
    codeVerifier: string;
  }) {
    const result = await this.pool.query<AuthorizationRequestRow>(
      `SELECT id, client_id, redirect_uri, scopes, state, code_challenge,
              code_challenge_method, resource, expires_at, code_expires_at, user_id, status
         FROM mcp_oauth_requests
        WHERE code_hash = $1 AND client_id = $2 AND status = 'approved'
          AND code_expires_at > now()`,
      [hash(input.code), input.clientId],
    );
    const request = result.rows[0];
    if (
      !request ||
      request.redirect_uri !== input.redirectUri ||
      !request.user_id
    ) {
      throw new Error('Invalid authorization code');
    }
    if (!verifyPkce(input.codeVerifier, request.code_challenge)) {
      throw new Error('Invalid code verifier');
    }
    const consumed = await this.pool.query(
      `UPDATE mcp_oauth_requests SET status = 'consumed' WHERE id = $1 AND status = 'approved'`,
      [request.id],
    );
    if (consumed.rowCount !== 1)
      throw new Error('Authorization code already used');
    return this.issueTokens(
      request.user_id,
      request.client_id,
      request.scopes,
      request.resource ?? this.config.resource,
    );
  }

  async refresh(refreshToken: string, clientId: string) {
    const result = await this.pool.query<TokenRow>(
      `SELECT id, user_id, client_id, scopes, resource
         FROM mcp_oauth_tokens
        WHERE refresh_token_hash = $1 AND client_id = $2
          AND revoked_at IS NULL AND refresh_expires_at > now()`,
      [hash(refreshToken), clientId],
    );
    const token = result.rows[0];
    if (!token) throw new Error('Invalid refresh token');
    const revoked = await this.pool.query(
      'UPDATE mcp_oauth_tokens SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL',
      [token.id],
    );
    if (revoked.rowCount !== 1) throw new Error('Refresh token already used');
    return this.issueTokens(
      token.user_id,
      token.client_id,
      token.scopes,
      token.resource || this.config.resource,
    );
  }

  async revoke(token: string): Promise<void> {
    await this.pool.query(
      `UPDATE mcp_oauth_tokens SET revoked_at = now()
        WHERE access_token_hash = $1 OR refresh_token_hash = $1`,
      [hash(token)],
    );
  }

  async validateAccessToken(
    token: string,
    resource: string,
  ): Promise<TokenPrincipal | null> {
    const result = await this.pool.query<TokenRow>(
      `SELECT id, user_id, client_id, scopes
         FROM mcp_oauth_tokens
        WHERE access_token_hash = $1 AND revoked_at IS NULL
          AND access_expires_at > now() AND resource = $2`,
      [hash(token), resource],
    );
    const row = result.rows[0];
    return row
      ? {
          userId: row.user_id,
          clientId: row.client_id,
          scopes: row.scopes,
          tokenId: row.id,
        }
      : null;
  }

  private async issueTokens(
    userId: string,
    clientId: string,
    scopes: string[],
    resource: string,
  ) {
    const accessToken = randomBytes(32).toString('base64url');
    const refreshToken = randomBytes(48).toString('base64url');
    const accessExpiresAt = new Date(
      Date.now() + this.config.accessTokenTtlSeconds * 1000,
    );
    const refreshExpiresAt = new Date(
      Date.now() + this.config.refreshTokenTtlSeconds * 1000,
    );
    await this.pool.query(
      `INSERT INTO mcp_oauth_tokens
        (id, client_id, user_id, scopes, access_token_hash, refresh_token_hash,
        access_expires_at, refresh_expires_at, resource)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        randomUUID(),
        clientId,
        userId,
        scopes,
        hash(accessToken),
        hash(refreshToken),
        accessExpiresAt,
        refreshExpiresAt,
        resource,
      ],
    );
    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      scopes,
    };
  }
}

interface ClientRow extends QueryResultRow {
  client_id: string;
  client_name: string;
  redirect_uris: unknown;
}

interface AuthorizationRequestRow extends QueryResultRow {
  id: string;
  client_id: string;
  redirect_uri: string;
  scopes: string[];
  state: string | null;
  code_challenge: string;
  code_challenge_method: string;
  resource: string | null;
  expires_at: Date;
  code_expires_at?: Date;
  user_id?: string;
  status: string;
}

interface TokenRow extends QueryResultRow {
  id: string;
  user_id: string;
  client_id: string;
  scopes: string[];
  resource: string;
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function verifyPkce(verifier: string, challenge: string): boolean {
  return (
    createHash('sha256').update(verifier).digest('base64url') === challenge
  );
}

function buildRedirect(
  redirectUri: string,
  values: Record<string, string | null>,
) {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}
