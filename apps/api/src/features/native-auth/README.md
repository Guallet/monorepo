# Native authentication handoff

This module adapts Better Auth's Google and email reset flows to Android.
Sessions, provider validation and password changes remain owned by Better Auth.
It uses the existing Redis connection for short-lived records, with no database
entity or migration. Deploy it together with the Android protocol changes.

Android creates a random 32-byte verifier, keeps it in its encrypted local
cookie vault, and sends only a base64url SHA-256 challenge. A new flow lasts
600 seconds. POST routes require `Origin: guallet-android://` and are throttled.
The origin check prevents browser login CSRF; it does not attest an app/device.

For Google, the HTTPS browser entry starts OAuth and sets a Secure, HttpOnly,
SameSite=Lax `__Host-` binding cookie. A Better Auth after hook publishes only
its fresh provider session, with a matching browser binding. An existing browser
session or a direct callback GET cannot publish credentials. For reset links,
the hook verifies the Better Auth reset token and binds its user email to the
account requested by Android.

The server creates a separate random completion code after successful browser
verification. The public flow ID cannot be used as that code: an initiator
already knows its flow ID and verifier, and must not be able to poll for another
person's completed browser login. The native callback carries only flow ID and
completion code. Redemption requires both plus the private verifier over HTTPS.
Google returns a secure session cookie; reset completion passes the new password
to Better Auth and never returns the reset token.

Redis records hold hashes of codes/bindings, and AES-256-GCM encrypted credentials
using a key derived from the Better Auth secret and flow-bound additional data.
Ready records expire within 300 seconds or their original remaining lifetime.
Atomic compare-and-delete permits exactly one valid redemption across replicas;
invalid attempts do not consume a legitimate flow. Reopening the same reset
email returns the existing code without extending its lifetime. Failed password
completion after redemption requires starting a new flow. Secret rotation or a
Redis outage likewise requires restarting in-flight browser authentication.

The native Better Auth plugin runs before Expo's plugin. It rejects legacy
`guallet-android://` redirect/proxy inputs and credential redirects from OAuth
states issued before deployment, while retaining Expo's `guallet://` behavior.
Auth URLs and sensitive request/cookie fields are redacted in API logs. Edge or
proxy access logs must apply equivalent redaction to auth paths; Better Auth's
ordinary HTTPS email reset path still contains its bearer token.

Run the normal API tests with `GUALLET_TEST_REDIS_URL` pointing at a disposable
Redis instance to include the multi-connection/TTL integration checks. CI supplies
Redis 8. Other tests exercise actual Better Auth handlers with a memory adapter
and mocked Google responses, and Nest HTTP validation/origin/rate limits. Real
provider, email delivery and competing Android scheme handlers need deployment
and device testing.

References: [Better Auth hooks](https://better-auth.com/docs/concepts/hooks),
[Android deep link risks](https://developer.android.com/privacy-and-security/risks/unsafe-use-of-deeplinks),
[Compose saved state](https://developer.android.com/develop/ui/compose/state-saving).
