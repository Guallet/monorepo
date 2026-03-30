# Auth

This uses [Better Auth](https://www.better-auth.com/).

## Database migrations

To generate and apply the database tables, run from `apps/api/`:

```bash
npx @better-auth/cli generate --config src/auth/better-auth.ts
npx @better-auth/cli migrate --config src/auth/better-auth.ts
```

## Email events

`createAuth` does not depend on `EmailService` directly. Instead, it emits events via NestJS `EventEmitter2` when Better Auth needs to send an email. `EmailEventListener` (in the `email` feature module) handles these events and calls the appropriate `EmailService` methods.

| Event                       | Trigger                        | Handler method                    |
|-----------------------------|--------------------------------|-----------------------------------|
| `auth.email.password-reset` | User requests password reset   | `sendPasswordResetEmail`          |
| `auth.email.otp`            | Email OTP verification sent    | `sendAuthOtpEmail`                |
| `auth.email.magic-link`     | Magic link sign-in requested   | `sendAuthMagicLinkEmail`          |

The CLI export (`export const auth`) at the bottom of `better-auth.ts` omits the `eventEmitter`, so no emails are emitted when running migrations via the CLI — this is intentional.