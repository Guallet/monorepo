# Native Android foundation

Standalone Kotlin Android project. Open this directory in Android Studio; it
has no dependency on Expo, React Native, Node, or the pnpm build graph.

## Run

Install JDK 17 and Android SDK platform 36. Set `ANDROID_HOME` or create an
ignored `local.properties` containing `sdk.dir=/path/to/android-sdk`.

```sh
./gradlew :app:assembleDebug -Pguallet.apiBaseUrl=https://your-api.example
./gradlew :app:installDebug -Pguallet.apiBaseUrl=https://your-api.example
./gradlew :app:testDebugUnitTest :app:lintDebug
```

The API URL is an origin, without `/api` or `/auth`. The default is
`https://localhost`, deliberately requiring local configuration before sign-in.
For an emulator, use a reachable HTTPS development host with a trusted
certificate. Better Auth's existing secure-cookie policy requires HTTPS; the
client does not weaken server cookie security or certificate validation.

Debug application ID: `io.guallet.android.dev`. Release ID: `io.guallet.android`.
Both coexist with the Expo application. Minimum Android version is API 26;
compile and target SDK are 36. The release build is unsigned; store publishing,
signing, and production environment configuration are outside this foundation.

## Architecture

One Gradle application module, organised by feature:

- `core/network`: Ktor client with OkHttp, ContentNegotiation, Resources,
  timeouts, and persistent cookies scoped to the API origin.
- `core/security`: AES-GCM cookie encryption with an Android Keystore key.
- `features/auth/domain`: repository interface and user model.
- `features/auth/data`: typed REST resources and Better Auth implementation.
- `features/auth/presentation`: ViewModel and StateFlow; validation, loading,
  retry, and session state handling.
- `ui`: Compose navigation, state-driven UI, and native Guallet theme tokens.
- `di`: Koin singleton and ViewModel definitions.

Screens depend on the ViewModel; the ViewModel depends on the repository
interface. Add future finance features alongside auth, with their own typed
resources, models, repositories, and ViewModels. There are no finance amounts
or migrated finance screens in this project.

## Better Auth integration

This client calls the existing Better Auth HTTP API directly rather than
embedding its JavaScript SDK. No backend changes, alternative token scheme,
or duplicate authentication endpoints are required. The server already enables
email/password and the email OTP plugin in `apps/api/src/auth/better-auth.ts`.

| Operation                | Method | Resource                                 |
| ------------------------ | ------ | ---------------------------------------- |
| Restore session          | GET    | `/auth/get-session`                      |
| Password login           | POST   | `/auth/sign-in/email`                    |
| Create account           | POST   | `/auth/sign-up/email`                    |
| Sign out                 | POST   | `/auth/sign-out`                         |
| Send login code          | POST   | `/auth/email-otp/send-verification-otp`  |
| Verify login code        | POST   | `/auth/sign-in/email-otp`                |
| Request reset code       | POST   | `/auth/email-otp/request-password-reset` |
| Reset password with code | POST   | `/auth/email-otp/reset-password`         |

Requests carry the already-trusted `Origin: guallet://`. Session credentials
come from `Set-Cookie` and return as HTTP cookies; the JSON token is never
stored or treated as a JWT. OkHttp handles cookie matching and expiry, while
Ktor's cookie plugin attaches them to requests. Cookie values are encrypted on
disk and excluded from backups. Passwords and codes remain in memory, and the
activity prevents screenshots and recents previews. Startup connection failures
offer retry instead of falsely treating the user as signed out. Sign-out must
successfully revoke the server session before local cookies are removed.

The initial UI includes welcome, password login, account creation, email-code
login, code-based password recovery, and a signed-in landing screen with
sign-out. Login codes expire after five minutes, as configured on the server.
Resending is subject to a thirty-second UI cooldown and server rate limits.
Google sign-in, link callbacks, finance screens, offline storage, and
background sync are deferred by the agreed scope.

## Validation

```sh
./gradlew :app:assembleDebug :app:testDebugUnitTest :app:lintDebug
```

JVM tests use Ktor MockEngine for REST paths and cookies, and coroutine tests
for startup retry, validation, and duplicate-submission handling. Android CI
runs compilation, those tests, and lint when this project changes. A real
end-to-end login needs a configured HTTPS API and a test account/email inbox.

References: [Ktor Resources](https://ktor.io/docs/client-resources.html),
[Koin](https://insert-koin.io/),
[Better Auth email/password](https://better-auth.com/docs/authentication/email-password),
[Better Auth email OTP](https://better-auth.com/docs/plugins/email-otp).

Inter is bundled under the SIL Open Font License; see `INTER-LICENSE`.
