import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { Pool } from 'pg';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { FinanceReadService } from '@guallet/finance-core';
import { getConfig } from './config.js';
import { OAuthStore, READ_SCOPES, type TokenPrincipal } from './oauth-store.js';
import { registerTools } from './tools.js';

const config = getConfig(process.env);
const pool = new Pool({
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  user: config.DATABASE_USERNAME,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  ssl: config.DATABASE_SSL_ENABLED ? { rejectUnauthorized: false } : false,
});
const finance = new FinanceReadService(pool);
const oauth = new OAuthStore(pool, {
  accessTokenTtlSeconds: config.MCP_ACCESS_TOKEN_TTL_SECONDS,
  refreshTokenTtlSeconds: config.MCP_REFRESH_TOKEN_TTL_SECONDS,
  resource: config.MCP_RESOURCE,
});

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));
app.use(cors);

app.get('/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ status: 'ok' });
  } catch {
    response.status(503).json({ status: 'unavailable' });
  }
});

app.get('/.well-known/oauth-protected-resource', (_request, response) => {
  response.json({
    resource: config.MCP_RESOURCE,
    authorization_servers: [config.MCP_PUBLIC_URL],
    scopes_supported: READ_SCOPES,
    bearer_methods_supported: ['header'],
  });
});

app.get('/.well-known/oauth-protected-resource/mcp', (_request, response) => {
  response.redirect('/.well-known/oauth-protected-resource');
});

app.get('/.well-known/oauth-authorization-server', (_request, response) => {
  response.json({
    issuer: config.MCP_PUBLIC_URL,
    authorization_endpoint: `${config.MCP_PUBLIC_URL}/oauth/authorize`,
    token_endpoint: `${config.MCP_PUBLIC_URL}/oauth/token`,
    registration_endpoint: `${config.MCP_PUBLIC_URL}/oauth/register`,
    revocation_endpoint: `${config.MCP_PUBLIC_URL}/oauth/revoke`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: READ_SCOPES,
  });
});

app.get(
  '/oauth/requests/:id',
  asyncHandler(async (request, response) => {
    const authorizationRequest = await oauth.getAuthorizationRequest(
      request.params.id,
    );
    if (!authorizationRequest)
      return response.status(404).json({ error: 'not_found' });
    return response.json({
      clientName: authorizationRequest.clientName,
      scopes: authorizationRequest.scopes,
      expiresAt: authorizationRequest.expiresAt,
    });
  }),
);

app.post(
  '/oauth/register',
  asyncHandler(async (request, response) => {
    const body = request.body as {
      client_name?: unknown;
      redirect_uris?: unknown;
    };
    if (
      typeof body.client_name !== 'string' ||
      !Array.isArray(body.redirect_uris) ||
      body.redirect_uris.length === 0 ||
      !body.redirect_uris.every((value) => typeof value === 'string')
    ) {
      return response.status(400).json({ error: 'invalid_client_metadata' });
    }
    const redirectUris = body.redirect_uris as string[];
    if (!redirectUris.every(isAllowedRedirectUri)) {
      return response.status(400).json({ error: 'invalid_redirect_uri' });
    }
    const client = await oauth.registerClient({
      clientName: body.client_name,
      redirectUris,
    });
    return response.status(201).json({
      client_id: client.clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: client.clientName,
      redirect_uris: client.redirectUris,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    });
  }),
);

app.get(
  '/oauth/authorize',
  asyncHandler(async (request, response) => {
    const clientId = stringParam(request.query.client_id);
    const redirectUri = stringParam(request.query.redirect_uri);
    const responseType = stringParam(request.query.response_type);
    const scopeValue = stringParam(request.query.scope);
    const state = stringParam(request.query.state);
    const codeChallenge = stringParam(request.query.code_challenge);
    const codeChallengeMethod = stringParam(
      request.query.code_challenge_method,
    );
    const resource = stringParam(request.query.resource);
    const client = clientId ? await oauth.getClient(clientId) : null;
    if (
      !clientId ||
      !client ||
      !redirectUri ||
      !client.redirectUris.includes(redirectUri)
    )
      return response.status(400).send('Invalid OAuth client or redirect URI');
    if (
      responseType !== 'code' ||
      !codeChallenge ||
      codeChallengeMethod !== 'S256'
    )
      return response
        .status(400)
        .send('PKCE authorization code flow is required');
    const scopes = (scopeValue ?? '').split(' ').filter(Boolean);
    if (
      scopes.length === 0 ||
      scopes.some(
        (scope) => !READ_SCOPES.includes(scope as (typeof READ_SCOPES)[number]),
      )
    )
      return response.status(400).send('Invalid scope');
    if (resource && resource !== config.MCP_RESOURCE)
      return response.status(400).send('Invalid resource');
    const requestId = await oauth.createAuthorizationRequest({
      clientId,
      redirectUri,
      scopes,
      state,
      codeChallenge,
      codeChallengeMethod,
      resource: resource ?? config.MCP_RESOURCE,
      expiresAt: new Date(Date.now() + 10 * 60_000),
    });
    const consent = new URL('/mcp/authorize', config.MCP_WEBAPP_URL);
    consent.searchParams.set('requestId', requestId);
    return response.redirect(consent.toString());
  }),
);

app.post(
  '/oauth/approve',
  asyncHandler(async (request, response) => {
    if (
      request.header('x-guallet-mcp-approval-secret') !==
      config.MCP_APPROVAL_SECRET
    )
      return response.status(401).json({ error: 'unauthorized' });
    const body = request.body as {
      requestId?: unknown;
      userId?: unknown;
      approved?: unknown;
    };
    if (
      typeof body.requestId !== 'string' ||
      typeof body.userId !== 'string' ||
      typeof body.approved !== 'boolean'
    )
      return response.status(400).json({ error: 'invalid_request' });
    const redirectUrl = await oauth.approveAuthorization(
      body.requestId,
      body.userId,
      body.approved,
    );
    return response.json({ redirectUrl });
  }),
);

app.post(
  '/oauth/token',
  asyncHandler(async (request, response) => {
    const body = request.body as Record<string, unknown>;
    const grantType = body.grant_type;
    try {
      if (
        grantType === 'authorization_code' &&
        typeof body.code === 'string' &&
        typeof body.client_id === 'string' &&
        typeof body.redirect_uri === 'string' &&
        typeof body.code_verifier === 'string'
      ) {
        const tokens = await oauth.exchangeCode({
          code: body.code,
          clientId: body.client_id,
          redirectUri: body.redirect_uri,
          codeVerifier: body.code_verifier,
        });
        return response.json(tokenResponse(tokens));
      }
      if (
        grantType === 'refresh_token' &&
        typeof body.refresh_token === 'string' &&
        typeof body.client_id === 'string'
      ) {
        const tokens = await oauth.refresh(body.refresh_token, body.client_id);
        return response.json(tokenResponse(tokens));
      }
    } catch {
      return response.status(400).json({ error: 'invalid_grant' });
    }
    return response.status(400).json({ error: 'invalid_request' });
  }),
);

app.post(
  '/oauth/revoke',
  asyncHandler(async (request, response) => {
    if (typeof request.body?.token === 'string')
      await oauth.revoke(request.body.token);
    return response.status(200).end();
  }),
);

app.post(
  '/mcp',
  authenticate,
  asyncHandler(async (request, response) => {
    const principal = (request as McpRequest).mcpPrincipal!;
    const server = new McpServer({ name: 'guallet-finance', version: '0.1.0' });
    registerTools(server, finance, principal);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    response.on('close', () => {
      void transport.close();
      void server.close();
    });
    await transport.handleRequest(request, response, request.body);
  }),
);

app.use((_request, response) =>
  response.status(404).json({ error: 'not_found' }),
);
app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    console.error(
      'MCP request failed',
      error instanceof Error ? error.message : 'unknown error',
    );
    if (!response.headersSent)
      response.status(500).json({ error: 'internal_error' });
  },
);

await oauth.ensureSchema();
app.listen(config.MCP_PORT, () => {
  console.log(`Guallet MCP server listening on ${config.MCP_PORT}`);
});

interface McpRequest extends Request {
  mcpPrincipal?: TokenPrincipal;
}

async function authenticate(
  request: McpRequest,
  response: Response,
  next: NextFunction,
) {
  const header = request.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const principal = token
    ? await oauth.validateAccessToken(token, config.MCP_RESOURCE)
    : null;
  if (!principal) {
    response.setHeader(
      'WWW-Authenticate',
      `Bearer resource_metadata="${config.MCP_PUBLIC_URL}/.well-known/oauth-protected-resource"`,
    );
    return response.status(401).json({ error: 'unauthorized' });
  }
  request.mcpPrincipal = principal;
  return next();
}

function cors(_request: Request, response: Response, next: NextFunction) {
  response.setHeader('Access-Control-Allow-Origin', config.MCP_WEBAPP_URL);
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, MCP-Protocol-Version, MCP-Session-Id',
  );
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (_request.method === 'OPTIONS') return response.status(204).end();
  return next();
}

function isAllowedRedirectUri(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' ||
      (url.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    );
  } catch {
    return false;
  }
}

function stringParam(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function tokenResponse(tokens: Awaited<ReturnType<OAuthStore['refresh']>>) {
  return {
    token_type: 'Bearer',
    access_token: tokens.accessToken,
    expires_in: Math.max(
      1,
      Math.floor((tokens.accessExpiresAt.getTime() - Date.now()) / 1000),
    ),
    refresh_token: tokens.refreshToken,
    scope: tokens.scopes.join(' '),
  };
}

function asyncHandler(
  handler: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<unknown>,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    void handler(request, response, next).catch(next);
  };
}

process.on('SIGTERM', () => {
  void pool.end();
});
process.on('SIGINT', () => {
  void pool.end();
});
