# Auth

This uses [Better Auth](https://www.better-auth.com/).

## Database migrations

The shared TypeORM migration history creates both application and auth tables.
Build the API and run `pnpm db:migrate` from `apps/api`. Do not run the Better Auth
migration CLI against deployed databases.

See [database migration instructions](../database/README.md) for empty databases,
existing database adoption, container commands, and future auth upgrades.

## Email events

`createAuth` does not depend on `EmailService` directly. Instead, it emits events via NestJS `EventEmitter2` when Better Auth needs to send an email. `EmailEventListener` (in the `email` feature module) handles these events and calls the appropriate `EmailService` methods.

| Event                       | Trigger                      | Handler method           |
| --------------------------- | ---------------------------- | ------------------------ |
| `auth.email.password-reset` | User requests password reset | `sendPasswordResetEmail` |
| `auth.email.otp`            | Email OTP verification sent  | `sendAuthOtpEmail`       |
| `auth.email.magic-link`     | Magic link sign-in requested | `sendAuthMagicLinkEmail` |

The standalone auth export omits the `eventEmitter`. TypeORM migration commands
do not import or instantiate Better Auth.
