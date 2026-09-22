# Guallet MCP server

The MCP server exposes read-only Guallet financial data to remote MCP clients.
It runs separately from the REST API and shares the same PostgreSQL database.

## Local setup

1. Start PostgreSQL and copy `mcp.env.sample` to `mcp.env`.
2. Set the same `MCP_APPROVAL_SECRET` in `api.env` and `mcp.env`.
3. Set `MCP_INTERNAL_URL` in `api.env` to the MCP server URL.
4. Set `VITE_MCP_URL` in `webapp.env` and rebuild the webapp.
5. Start the server:

   ```bash
   pnpm --filter mcp-server dev
   ```

The default endpoint is `http://localhost:5100/mcp`.

## Connecting a client

Use the MCP endpoint in an MCP-compatible client such as MCP Inspector or
Claude Desktop. The client discovers OAuth metadata, registers a public client,
opens the Guallet consent page, and receives a read-only token after approval.

Useful discovery endpoints:

- `/.well-known/oauth-protected-resource`
- `/.well-known/oauth-authorization-server`
- `/mcp`

Do not place access tokens, refresh tokens, database credentials, or Better Auth
cookies in client configuration files or logs.

## Production deployment

Deploy `apps/mcp-server` as its own service with a stable HTTPS
`MCP_PUBLIC_URL`. Keep `MCP_APPROVAL_SECRET` private and identical only between
the API approval bridge and the MCP service. Put the MCP endpoint behind the
same TLS/reverse-proxy policy as the REST API and allow only the webapp origin
for browser CORS.
