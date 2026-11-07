# Bank connections

The public API uses saved, user-owned connections. Specify `providerId` once
when creating a connection; every subsequent request uses its UUID. The API
resolves the provider, decrypts the credentials, and calls its adapter.

Supported provider IDs are `lunchflow`, `banksync`, `synci`, and `nordigen`.
Each user can have one connection per provider. The first three accept
`credentials.apiKey` (a personal access token for Synci). Nordigen accepts
`credentials.secretId` and `credentials.secretKey`.

## Endpoints

All routes require the existing authenticated session. Connection IDs,
authorizations, and jobs are checked against the signed-in user.

| Method | Path                                                                    | Purpose                                                         |
| ------ | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| GET    | `/openbanking/providers`                                                | Provider catalog, credential fields, authorization capabilities |
| POST   | `/openbanking/connections`                                              | Validate and save a connection                                  |
| GET    | `/openbanking/connections`                                              | List your connections                                           |
| GET    | `/openbanking/connections/:id`                                          | Connection details and credential hint                          |
| PUT    | `/openbanking/connections/:id/credentials`                              | Validate and replace credentials                                |
| DELETE | `/openbanking/connections/:id`                                          | Remove credentials and stop syncing                             |
| GET    | `/openbanking/connections/:id/accounts`                                 | Cached discovered accounts and refresh timestamp                |
| POST   | `/openbanking/connections/:id/accounts/refresh`                         | Queue account discovery                                         |
| POST   | `/openbanking/connections/:id/accounts/import`                          | Queue import of selected accounts                               |
| DELETE | `/openbanking/connections/:id/accounts/:accountId/link`                 | Stop syncing one imported account                               |
| POST   | `/openbanking/connections/:id/sync`                                     | Queue balance and transaction sync                              |
| GET    | `/openbanking/connections/:id/jobs/:jobId`                              | Operation status and result                                     |
| GET    | `/openbanking/connections/:id/institutions?country=GB`                  | Available banks for providers with bank authorization           |
| POST   | `/openbanking/connections/:id/authorizations`                           | Start bank authorization                                        |
| POST   | `/openbanking/connections/:id/authorizations/:authorizationId/complete` | Verify authorization and queue discovery                        |

Create a connection:

```json
{
  "providerId": "lunchflow",
  "credentials": { "apiKey": "your-key" }
}
```

Use the returned connection `id` in subsequent requests. Refresh, import, sync,
and authorization completion return HTTP 202 with `{ "jobId": "..." }`.
Poll the job endpoint until `completed` or `failed`. A completed sync may
contain `result.errors` listing accounts that could not be synced. Jobs are
retained for up to 24 hours, subject to a 1,000-job limit per outcome.

Import accepts `{ "accountIds": ["..."] }`. Account IDs are opaque strings:
copy them unchanged from the accounts response and URL-encode path parameters.
BankSync IDs encode both bank and account identity internally; clients do not
need to interpret them. Import returns local Guallet account IDs in the job
result. Account discovery is explicit; reading accounts does not call providers.

## Checking an account's connection

`GET /accounts/:id/connection` checks a local Guallet account owned by the
signed-in user. An active provider link returns:

```json
{
  "connection": {
    "id": "connection-uuid",
    "providerId": "synci",
    "remoteAccountId": "opaque-provider-account-id",
    "lastRefresh": "2026-11-07T10:00:00.000Z",
    "daysRemaining": 45,
    "status": "connected"
  }
}
```

Manual accounts, unlinked accounts, and accounts whose provider connection was
removed return HTTP 200 with an empty object (`{}`). The presence of
`connection` indicates a persisted link; inspect its `status` for current usability.
Missing accounts and accounts owned by another user return HTTP 404.

The check uses persisted links even when the discovery cache is empty or the
account source label changes. It makes no provider requests and returns no
credentials. `lastRefresh` is the latest successful account refresh/sync or
initial link date.
`status` is `connected`, `expired`, or `connectionError`. Expiry takes precedence
over an operation error. Status reflects the latest background operation;
known expiry dates are also checked at request time.

`daysRemaining` rounds remaining consent time up to whole days and returns zero
for expired consent. It is null when expiry is unknown or not supplied by the
provider. Synci supplies `consent_expires_at`; Nordigen expiry is calculated from
the agreement's acceptance date and `access_valid_for_days`. Lunch Flow and
BankSync do not supply a documented consent expiry in account discovery.
The one-hour authorization callback deadline is unrelated to consent expiry.
Refresh available accounts to populate metadata for existing connections.
Internal connection timestamps still distinguish discovery from financial sync.
The connection `id` and opaque `remoteAccountId` work with the shared sync and
unlink endpoints.

The SDK exposes `client.accounts.getAccountConnection(accountId)`, and
`useAccountConnection(accountId)` provides the connection details or null to
apps. Bank operations, unlinking, and connection changes invalidate this query.

## Authorization

The catalog's `supportsBankAuthorization` flag controls the bank picker.
Nordigen uses this flow. Other providers manage their bank connections in their
own applications before Guallet discovers accounts.

Send `institutionId` and `redirectUrl` to the authorization endpoint. The
redirect URL must belong to an origin in `auth.allowedOrigins`. Guallet adds
`connectionId` and `authorizationId` to that callback URL and returns the
provider's authorization URL. The webapp redirects there, then confirms the
authorization when the user returns. The server checks ownership, the one-hour
completion deadline, and the provider's authorization state. Repeated completion
is safe. This deadline applies to completing the callback, not bank consent.

## Implementation

- `OpenbankingController` exposes only shared routes.
- `OpenbankingService` owns connections, authorization records, jobs, and the
  daily sync schedule. It selects an adapter from `BankProviderRegistry`.
- Provider services implement `BankProviderAdapter` and retain their own HTTP
  clients, data mappings, import rules, and provider-specific rate limits.
- Credentials are encrypted using `DATABASE_CREDENTIALS_ENCRYPTION_KEY`.
  Responses contain only a hint; queue payloads contain IDs and operation
  parameters. Provider errors are sanitized before storing failed job results.
- A database row lock serializes work, credential replacement, and disconnects
  for each connection across replicas. Queued jobs carry a credential version;
  replacing credentials invalidates work queued against an older version.
- Identical in-flight operations are deduplicated. Imports finish all writes
  before releasing the lock. Account and provider-link creation is atomic.
- Disconnecting and unlinking preserve imported accounts and transactions.
  These actions do not require decrypting the old credentials.
- The shared client is `client.openbanking`. React Query hooks own polling and
  invalidate the affected financial queries when operations finish.

Imports can partially succeed before an upstream failure. Refresh and retry
the selection to resume; existing account mappings and transaction identifiers
prevent creating duplicate imports. Provider availability and consent expiry
can still require reconnecting a bank.

## Database setup

This feature starts with an empty database. Run the API migrations to create
`bank_connections`, `bank_authorizations`, and `connected_accounts` directly.
There are no provider-specific account/credential tables or historical-data
conversions. Rollback removes the feature tables.

## Shared connected accounts

`connected_accounts` stores imported account links for every provider. Each row
contains:

| Column                 | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `user_id`              | Owner of the link                                        |
| `provider`             | Adapter used for discovery, sync, unlink, and disconnect |
| `guallet_account_id`   | Local account, with a cascading foreign key              |
| `remote_account_id`    | Opaque provider account identifier                       |
| `remote_connection_id` | Remote bank/connection identifier when supplied          |
| `is_linked`            | Whether automatic synchronization is enabled             |
| `last_synced_at`       | Most recent successful financial sync for this account   |
| `raw`                  | Latest original provider account JSON, stored as JSONB   |

The unique key is `(user_id, provider, remote_account_id)`. BankSync uses the
compact JSON array `[bankId, accountId]` as its opaque remote account ID so two
banks may use the same native account ID. The adapter decodes it for provider
requests; transaction identifiers retain their existing format.

Imports, syncs, and discovery refreshes update `raw` for connected accounts. Synci
retains the account object before normalization; Nordigen retains the full account
details response. Unknown fields are preserved. Unavailable accounts retain their
previous payload. `raw` is excluded from default entity selection, discovery
responses, and the account connection response.
