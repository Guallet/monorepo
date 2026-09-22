# Guallet MCP Server – Agent Reference

This file is the quick-orientation guide for agents working in
`apps/mcp-server`. The service exposes read-only Guallet finance data through
the Model Context Protocol and runs separately from the NestJS API.

## Project at a Glance

| Area | Implementation |
| ---- | -------------- |
| Runtime | Node.js, TypeScript, Express |
| MCP transport | `@modelcontextprotocol/sdk` Streamable HTTP |
| Authorization | OAuth 2.1 authorization code flow with S256 PKCE |
| Token storage | PostgreSQL, opaque hashed access and refresh tokens |
| Finance reads | `@guallet/finance-core` shared package |
| Consent UI | `apps/webapp/src/routes/mcp/authorize.tsx` |
| Approval bridge | `apps/api/src/features/mcp/` |

## Common Commands

```bash
pnpm --filter mcp-server dev
pnpm --filter mcp-server build
pnpm --filter mcp-server typecheck
pnpm --filter mcp-server test
pnpm --filter @guallet/finance-core build
pnpm --filter @guallet/finance-core typecheck
```

The MCP server requires the variables in `mcp.env.sample`. For local consent
approval, use the same `MCP_APPROVAL_SECRET` in `mcp.env` and `api.env`.

## Architecture

```text
MCP client
  -> apps/mcp-server/src/main.ts
     -> OAuthStore (PostgreSQL OAuth tables)
     -> registerTools (scope checks and MCP responses)
        -> @guallet/finance-core (user-scoped SQL read service)
           -> PostgreSQL

OAuth consent:
MCP client -> MCP OAuth endpoints -> webapp consent route
  -> authenticated API approval bridge -> MCP OAuth store
```

- `src/main.ts` owns Express routes, CORS, OAuth discovery, bearer
  authentication, and the stateless MCP transport.
- `src/oauth-store.ts` owns client registration, authorization requests, PKCE,
  token rotation, revocation, and token validation.
- `src/tools.ts` defines one explicit MCP tool per read capability.
- `@guallet/finance-core` owns the database read models and SQL queries shared
  by this service.
- `SPEC.md` documents the public protocol and data contract.

## Security Rules

- Every finance query must receive the authenticated `userId` from the token
  principal. Never accept a user ID as a tool argument.
- Keep all SQL user-scoped. Joins must not allow records from another user to
  leak through related tables.
- Keep MCP tools read-only. Do not add mutation tools without an explicit
  security and product review.
- Keep scopes resource-specific and check the required scope before executing a
  tool.
- Use S256 PKCE for public OAuth clients. Do not add client secrets to the
  public-client flow.
- Store only hashes of access and refresh tokens. Never log tokens, OAuth
  authorization codes, database credentials, Better Auth cookies, or the
  approval secret.
- Validate redirect URIs strictly. HTTPS is required outside localhost.
- Do not expose provider credentials, raw provider payloads, IBANs, owner data,
  or internal database metadata in MCP output.
- The API approval bridge is the only component that translates the existing
  Better Auth session into the MCP user identity.

## MCP Tool Conventions

- Define tools explicitly in `src/tools.ts`; avoid a generic unrestricted query
  tool.
- Keep inputs bounded with Zod schemas. Pagination is limited to 100 records
  per page and transaction date ranges are limited to one year.
- Return stable JSON read models in both text content and structured content.
- Map missing records to MCP invalid-parameter errors without revealing other
  users’ records.
- Add or update tests when changing OAuth state transitions, scope checks,
  pagination, or user-scoping SQL.

## Database and Schema Changes

- The MCP service uses the existing Guallet PostgreSQL schema for finance data.
- Its OAuth tables are created by `OAuthStore.ensureSchema()`:
  `mcp_oauth_clients`, `mcp_oauth_requests`, and `mcp_oauth_tokens`.
- Use parameterized queries exclusively. Never interpolate user input into SQL.
- If a finance table or column changes, verify the corresponding API entity and
  update `packages/guallet-finance-core` together with its tests.

## Deployment

- Build the finance core before the MCP server in the Docker image.
- Production deployments require a stable HTTPS `MCP_PUBLIC_URL` and a matching
  `MCP_RESOURCE` ending in `/mcp`.
- Keep `MCP_APPROVAL_SECRET` private and identical only between the API bridge
  and MCP service.
- Allow browser CORS only for `MCP_WEBAPP_URL`.
- Do not commit local `mcp.env` files or generated `dist/` output.

## Code Style

- TypeScript strict mode; avoid `any`.
- Use single quotes, trailing commas, and Oxfmt formatting.
- Prefer small helpers with explicit return types for OAuth and SQL mapping.
- Run focused MCP/core tests and typechecks before committing.
