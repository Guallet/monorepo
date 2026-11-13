# Native Android agent guidance

The root AGENTS.md remains canonical for backend contracts and design rules.
This app is Kotlin/Compose, so use the native equivalents below where the root
guidance names React or TypeScript tools.

- Keep UI in Compose and use Ktor with OkHttp, typed Resources, kotlinx
  serialization, Koin, ViewModels, and StateFlow.
- Consume existing backend APIs with native typed models and repository
  interfaces. New backend resources still follow the root data-flow contract.
- Use `core/money/Money.kt` for all displayed monetary amounts, totals and input
  precision. Its native implementation was explicitly approved in place of
  importing TypeScript `@guallet/money`; do not add a JavaScript bridge.
- Do not combine currencies without an explicit conversion contract. Use the
  generated shared currency precision, including zero-, three- and four-digit
  minor units. Do not convert stored amounts, totals or API payloads through
  Double. Chart coordinates and progress ratios may use floating-point values.
- Keep secrets out of saved state and logs; preserve encrypted cookies, their
  origin/path matching, and the nonce checks on browser callbacks.
- Scope financial state to the signed-in user. Cancel stale requests and clear
  ViewModel stores and drafts on sign-out/user changes.
- Preserve the shared category icon identifiers and fallback. Regenerate the
  checked-in currency/icon data with the scripts rather than hand-editing it.
- Format Kotlin with ktfmt and Markdown/YAML with Oxfmt. Validate using
  `./gradlew :app:assembleDebug :app:testDebugUnitTest :app:lintDebug`.
- See MIGRATION.md for the feature map, parity boundaries and deployment needs.
