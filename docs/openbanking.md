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

## Migration and deployment

`UnifyBankConnections1792800000000` replaces the destructive, unreleased
`RemoveLegacyOpenBanking` migration from this PR. It copies encrypted credentials
without decrypting or re-encrypting them, preserves Nordigen account links and
authorizations, and leaves imported accounts and transactions intact. It clears
redundant legacy credentials and tokens. Keep the existing encryption key.

Stop old API/worker replicas and drain their queues before applying this
migration. Deploy the new API, workers, client, and webapp together: legacy
provider routes and SDK wrappers have been removed. Old queued jobs are not
converted to the shared queue; users can start new syncs after deployment.

The legacy table schemas remain for rollback. Reverting restores credentials
and existing Nordigen link state. Rollback refuses to discard new Nordigen
links or authorizations that cannot be represented safely by the old model;
use a database backup or an explicit data conversion in that case.

If the removed destructive migration was already applied to a development
database, restore its pre-migration backup before applying this migration.
Deleted legacy records cannot be reconstructed from the new schema.
