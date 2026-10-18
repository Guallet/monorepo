# Transaction classification v1

Status: implemented for validation; provider accuracy requires evaluation on an
authorised representative dataset before making quality claims.

## Behaviour

Settings → Transaction classification manages one Jev-compatible connection.
Creating/updating tests it; failed tests save it inactive. Draft tests use neutral
text only. Notes sharing is off by default. Credentials omitted on update are
retained; switching authentication to `none` removes them. Custom headers are
restricted to `x-...key` and `x-...token` to exclude transport/routing headers.

New uncategorised transactions from manual creation, bank upsert, CSV, JSON and
OFE writes create durable work in the same database transaction. Rules run even
without a provider. `notes` is supported by the rules engine. Remaining work uses
bounded yes/no batches across all leaf categories, with direction as context and
no name-based category filtering. Scores are estimates, not measured accuracy.

The inbox offers accept, choose another category, and dismiss. Accepted/corrected
feedback is committed atomically with the transaction update. A dismissed
fingerprint is not suggested again unless inputs/configuration change. Existing
inbox transactions can be submitted manually. Category/rule/connection edits
invalidate pending results without automatically incurring new provider charges.

Auto-apply, multiple choice, hierarchical selection, persistent decision caching,
mobile settings, bulk acceptance and automatic rule creation remain deferred.

## Persistence and delivery

The generated `AddTransactionClassification` migration adds connections,
suggestions, per-user configuration revisions, a durable work/outbox ledger, and
transaction revisions. Hand-authored PostgreSQL triggers supplement the generated
schema. Database foreign keys purge classification data on user deletion.

Triggers ensure all ingestion paths, including direct importer writes and
upserts, obey the same transaction boundary. Rolled-back writes publish nothing.
Every transaction update advances its revision; every relevant configuration
mutation advances the user's configuration revision. Workers validate both before
persisting. HTTP calls happen outside database transactions. Concurrent workers
serialize persistence with row locks and a unique pending-suggestion index.

The dispatcher re-delivers unfinished rows to BullMQ until terminal, with one
outstanding job per user and two workers. Each delivery handles at most ten
transactions, yielding after 15 seconds between transactions. Queue retention is not the idempotency
mechanism. Provider request budgets and cooldowns are stored in Redis. Retries
are bounded (three transient attempts, at most twenty rate-limit delays).
Unrecoverable protocol failures are terminal; authentication/address failures
disable the connection. Users can retry terminal work with a new inbox run.
A process crash after delivery or during HTTP leaves durable work for recovery.

## API and clients

- `GET/POST/PATCH/DELETE /decision-connections`: single connection, with GET
  returning zero or one item. Connection responses never include credentials.
- `POST /decision-connections/test`: test an unsaved payload.
- `POST /decision-connections/test-saved`: test saved credentials.
- `POST /classification/run`: exactly one of `{ scope: 'inbox' }` or
  `{ transactionIds: [...] }` (maximum 500 IDs; inbox cap 10,000). Returns a run
  identifier and aggregate counts. Empty inbox requests return 400.
- `GET /classification/runs/:id`: queued/processed/suggested/abstained/skipped/
  failed counts and completion. Runs are owner-scoped.
- `POST /classification/suggestions/:id/dismiss`: dismiss a pending suggestion.
- `GET /classification/stats`: review counts for suggestions created in the last
  30 days; acceptance rate is accepted / (accepted + rejected), null without
  reviews. This is not classification accuracy.

Inbox responses add `suggestion` and populate existing `processedCategoryId` and
`ruleId` fields. Shared client/hooks live in the `classification` domain. Category
updates distinguish omitted fields from explicit null (clear category).

## Validation

```bash
pnpm --filter api test
pnpm --filter webapp typecheck
pnpm lint
# Use an isolated database whose name ends in _classification_test:
DATABASE_NAME=guallet_classification_test CLASSIFICATION_TEST_REDIS_PORT=6379 pnpm --filter api test:classification:integration
```

The integration command builds first and applies migrations to the explicitly
selected test database. It uses a local fake provider, synthetic users and
transactions, and cleans up its fixtures. It checks rollback, duplicate delivery,
feedback, dismissal, rule priority, credential handling, stale responses and user
isolation/deletion. Setting `CLASSIFICATION_TEST_REDIS_PORT` also exercises real
BullMQ delivery, failed dispatch recovery, and connection-scoped Redis limits.
The evaluation harness is also exercised against synthetic labelled fixtures.
API CI runs these checks with PostgreSQL 18 and Redis 8. HTTP tests cover address policy, mixed DNS responses, pinned
addresses, redirects, upstream errors, size limits and total deadlines.

Verify migration rollback/reapply on an isolated database. Review the migration's
triggers whenever changing transaction ingestion, category/rule writes or deletion.

## Evaluation

```bash
pnpm --filter api classification:eval --user USER_ID --allow-send --limit 500 --seed 1 --output classification-evaluation
```

Run only against an explicitly authorised development dataset and its configured
provider. Production is disabled. The harness runs the production state/options/
HTTP/resolver logic, groups identical inputs, excludes conflicting labels, tunes
thresholds on a deterministic 60% split, and reports held-out precision/coverage,
sample counts, category confusions, latency and request counts in Markdown/CSV.
Reports contain category IDs but no transaction text. Evaluation never changes
transaction categories. Small or recent-data samples do not establish general
accuracy; automation remains out of scope regardless of the reported scores.

The yes/no wire contract was checked against the
[Jev documentation](https://github.com/jev-ai/system-one-jev) and
[jevos documentation](https://github.com/feder-cr/jev). Provider-specific limits
and real-world accuracy must be validated for each deployment; defaults are
conservative local caps, not claims about provider capacity.
