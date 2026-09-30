# Bruno collection for the Guallet API

Investigation and decision record for issue #198: should the API ship a Bruno
collection for endpoint documentation and manual exploration?

## Recommendation

Yes. Ship a small, curated Bruno collection at `apps/api/bruno/`, next to the
API it documents. This PR adds the first version: sign-in flow plus
representative requests for health, accounts, transactions and categories.

## Why Bruno, and why this location

- Bruno stores every request as a plain text `.bru` file. The collection diffs
  and reviews like normal code, with no binary workspace files and no cloud
  account required, which suits an open-source repo.
- Co-locating at `apps/api/bruno/` keeps the collection in the same review and
  CI blast radius as the controllers it describes. A change to an endpoint and
  a change to its request file can land in one PR.

Alternatives considered: Postman (cloud/workspace oriented, exports diff
poorly) and a docs-only approach relying on the Swagger UI at `/docs` (good
reference, but no saved, shareable request flows). The collection complements
the Swagger UI rather than replacing it.

## Authentication and environment handling

- The API uses Better Auth with session cookies (7 day sessions). The
  collection signs in with the email OTP flow (`Send sign-in OTP` then `Sign
  in with OTP`); Bruno's cookie jar then authenticates every other request.
  The magic-link flow also works but completes in a browser, so OTP is the
  documented path for API exploration.
- The Swagger setup declares bearer auth, but no endpoint currently issues
  bearer tokens; cookie auth is what actually works today. Noted as a
  follow-up (below).
- Environment values live in `environments/Local.bru` (`baseUrl`, `accountId`).
  A hosted/staging environment can be added as another file without touching
  the requests. Real secrets, if ever needed, belong in Bruno's
  `vars:secret` storage, which Bruno keeps out of the request files.

## Alignment with the NestJS/OpenAPI contract

- The OpenAPI document is generated at runtime from the NestJS decorators and
  served at `/docs` (JSON at `/docs-json`). The collection is therefore
  hand-maintained against the same source of truth: the controllers.
- Two existing tests already guard the contract:
  `src/openapi-document.spec.ts` (document generation) and
  `src/openapi-contract.spec.ts` (per-controller response metadata).
- The collection is intentionally a curated subset, not a mirror of every
  route. Covering every endpoint would duplicate the Swagger UI and invite
  drift.

## Keeping the collection aligned (CI)

Recommended follow-up, not included in this PR to keep it focused: a CI step
that fails when a controller file changes without touching `apps/api/bruno/`
or an explicit exemption list. Lightweight options: a paths-filter check on
`apps/api/src/features/**` in the existing workflow, or a script that compares
`@Controller`/`@Get`/`@Post` routes against the collection's `.bru` files.

## Trade-offs

- Hand-curated collection: readable and reviewable, but can drift from the
  API. Mitigated by the proposed CI check.
- Generating `.bru` files from the OpenAPI document is possible, but the
  output loses curated examples and sign-in guidance. Revisit if drift becomes
  a real problem.

## Follow-up tasks

1. Add the CI alignment check described above.
2. Add a staging/hosted environment file once a stable URL exists.
3. Extend coverage to budgets, reports and open banking flows as they
   stabilise.
4. Either issue real bearer tokens for API clients or drop `addBearerAuth()`
   from the Swagger setup so the documented auth matches reality.
