# Bank connections: UI proposal

Status: approved and implemented in the webapp.

## Scope

Add `/settings/connections` for banking providers and credentials. Replace the
embedded credential forms on Settings with a link to this page. Keep AI provider
settings separate. Preserve the existing API contracts, all four bank providers,
manual account creation, bank authorisation, import, sync and disconnect.

## Proposed screens

1. **Connections:** a single list of Lunch Flow, BankSync, Synci and Nordigen.
   Each row shows whether credentials are saved, a masked hint when available,
   the last successful sync time, and Manage or Set up. “Saved” describes stored
   credentials, not a claim that the provider is currently healthy.
2. **Choose a provider:** show saved providers and providers requiring setup in
   the account wizard. Keep Add manually visible. Selecting a configured provider
   skips credential entry; a new provider opens credential entry in the wizard.
3. **Enter credentials:** render the provider's declared fields. API key providers
   get a password input; Nordigen gets secret ID and secret key. Validate and
   continue saves credentials, then advances to accounts. Validation failures
   stay on the form with an actionable error. No forced detour through Settings.
4. **Choose accounts:** show available accounts with institution and currency,
   selection checkboxes and an Already linked state. Import only selected,
   eligible accounts. Refresh is secondary; import is the primary action.
5. **Manage provider:** show only the saved credential hint. A blank replacement
   form validates before replacing the existing key. Add accounts and Sync now
   remain available. Disconnect requires confirmation and explicitly states that
   imported accounts and transactions remain.

## Behaviour and states

- Nordigen inserts bank selection and external authorisation before account
  discovery. Preserve the selected connection across the callback.
- Settings setup ends on Connections; wizard setup returns to account selection.
- Account discovery, import and sync show queued/running progress. Prevent
  duplicate actions while an operation is active.
- Confirm import success only after the job finishes. Partial failures retain
  their error details and offer a recovery path rather than a blanket success.
- Show retry actions for provider-list, connection-list and account-load errors.
- Empty discovery explains that banks must be connected with the provider and
  offers Refresh. Unavailable accounts retain a route to reauthorise or unlink.
- Unlinking belongs in management, with a confirmation explaining retained data.
- Never prefill saved secrets. Reveal controls apply only to newly typed values.
- On narrow viewports, stack row metadata and use full-screen wizard dialogs;
  keep the primary action visible without horizontal scrolling.
- Use existing theme tokens, Mantine components, keyboard focus management,
  labelled controls and translated UI copy.

## Reference decisions

- [Mercury accounts](https://mobbin.com/screens/74bd2329-ed83-4631-a6ee-6b0688169f3a):
  aligned list rows with status beside each account. Apply that structure to
  provider management; retain Guallet styling and provider-specific metadata.
- [Midday bank connection flow](https://mobbin.com/flows/59b3631c-8463-40c0-a3c6-367016e85c12):
  focused connection dialog with selectable rows and a manual alternative.
- Credential replacement placement, inline setup and the proposed route are
  product-specific design decisions based on this repository and the request.

The visual review board uses fictional example data. Implementation follows the
approved structure, with linked-account management added to the provider dialog.

## Validation

Browser checks with mocked API responses cover failed credential replacement,
selected-account import, disabled already-linked accounts, inline provider setup,
mobile layout, Nordigen credential fields and returning from authorisation to the
selected provider. Live banking credentials were not used.

The ordinary TypeScript checker and Vite development server exceeded this
executor's memory limit. Browser checks ran against a separate esbuild preview
of the application source; that preview is not a production Vite build.

The native TypeScript checker passed for the app using a temporary configuration
that adapts the removed `baseUrl` option to relative `paths`. Repository compiler
configuration and dependencies were left unchanged. Webapp lint, formatting and
`git diff --check` also passed.
