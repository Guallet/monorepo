# Guallet MCP Server

## Purpose

Provide authenticated AI clients with read-only, user-scoped Guallet financial
data through the Model Context Protocol.

## Transport

- Remote clients use `POST /mcp` with the MCP Streamable HTTP transport.
- The server is stateless and does not enable legacy SSE or stdio.
- Every request requires a bearer access token whose resource is the MCP URL.

## Authorization

OAuth 2.1 authorization-code flow with S256 PKCE is used for public clients.
Clients register through `/oauth/register`. Authorization requests are approved
in the Guallet webapp using the existing Better Auth browser session. Access and
refresh tokens are opaque, hashed before persistence, and stored in Postgres.

The server currently grants only resource-specific read scopes:

`accounts:read`, `transactions:read`, `categories:read`, `rules:read`,
`budgets:read`, `saving-goals:read`, `recurring-payments:read`, `reports:read`,
`notifications:read`, and `connections:read`.

## Data contract

Tool arguments never contain a user identifier. The authenticated principal is
passed into every finance read operation, and every database query includes that
user scope. Outputs use stable read DTO fields and omit provider credentials,
raw provider payloads, IBAN/owner data, and internal database metadata.

All list tools are bounded to 100 records per page. Transaction queries accept
account/category filters and date ranges of at most one year.
