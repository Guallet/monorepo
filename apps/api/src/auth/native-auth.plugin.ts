import type { BetterAuthPlugin } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { splitSetCookieHeader } from 'better-auth/cookies';
import type { NativeHandoffBroker } from '../features/native-auth/native-handoff.broker';
import { BROWSER_BINDING_COOKIE } from '../features/native-auth/native-handoff.broker';

function isNativeRedirect(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'guallet-android:';
  } catch {
    return false;
  }
}
function redirects(value: unknown): unknown[] {
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  return [
    'callbackURL',
    'newUserCallbackURL',
    'errorCallbackURL',
    'redirectTo',
  ].map((key) => record[key]);
}

export function nativeAuthPlugin(
  baseUrl: string,
  broker?: NativeHandoffBroker,
): BetterAuthPlugin {
  const origin = new URL(baseUrl).origin;
  return {
    id: 'guallet-native-handoff',
    hooks: {
      before: [
        {
          matcher: () => true,
          handler: createAuthMiddleware(async (ctx) => {
            if (
              [
                ...redirects(ctx.body as unknown),
                ...redirects(ctx.query as unknown),
              ].some(isNativeRedirect) ||
              isNativeRedirect(ctx.headers?.get('expo-origin'))
            ) {
              throw new APIError('BAD_REQUEST', {
                message:
                  'Use the verifier-bound native authentication endpoints.',
              });
            }
          }),
        },
      ],
      after: [
        {
          matcher: (ctx) =>
            !!(
              ctx.path?.startsWith('/callback/') ||
              ctx.path?.startsWith('/reset-password/') ||
              ctx.path?.startsWith('/magic-link/verify') ||
              ctx.path?.startsWith('/verify-email')
            ),
          handler: createAuthMiddleware(async (ctx) => {
            const headers = ctx.context.responseHeaders;
            const location = headers?.get('location');
            if (!location) return;
            // This also protects pending legacy OAuth states issued before deployment.
            if (isNativeRedirect(location)) {
              const safeError = `${origin}/auth/error?error=NATIVE_HANDOFF_REQUIRED`;
              headers?.set('location', safeError);
              ctx.setHeader('location', safeError);
              throw new APIError('BAD_REQUEST', {
                message: 'Restart native browser authentication.',
              });
            }
            let target: URL;
            try {
              target = new URL(location);
            } catch {
              return;
            }
            if (target.origin !== origin || !broker) return;
            const kind =
              target.pathname === '/native-auth/google/callback'
                ? 'google'
                : target.pathname === '/native-auth/reset/callback'
                  ? 'reset'
                  : null;
            if (!kind) return;
            // Update both accumulated and local headers: an after-hook error can retain
            // the endpoint's redirect status. Its fallback must never contain a token.
            const safeError = `${origin}/auth/error?error=INVALID_NATIVE_HANDOFF`;
            headers?.set('location', safeError);
            ctx.setHeader('location', safeError);
            const id = target.searchParams.get('flowId');
            if (!id || target.searchParams.getAll('flowId').length !== 1)
              throw new APIError('BAD_REQUEST');
            try {
              if (kind === 'google' && ctx.path?.startsWith('/callback/')) {
                const cookieName = ctx.context.authCookies.sessionToken.name;
                const cookies = splitSetCookieHeader(
                  headers?.get('set-cookie') ?? '',
                );
                const cookie =
                  ctx.context.newSession && !target.searchParams.has('error')
                    ? cookies.find((value) =>
                        value.startsWith(`${cookieName}=`),
                      )
                    : undefined;
                const binding = (ctx.headers?.get('cookie') ?? '')
                  .split(';')
                  .map((value) => value.trim())
                  .find((value) =>
                    value.startsWith(`${BROWSER_BINDING_COOKIE}=`),
                  )
                  ?.slice(BROWSER_BINDING_COOKIE.length + 1);
                ctx.setHeader(
                  'location',
                  await broker.publishGoogle(id, binding, cookie),
                );
              } else if (
                kind === 'reset' &&
                ctx.path?.startsWith('/reset-password/')
              ) {
                const token = target.searchParams.get('token') ?? undefined;
                let email: string | undefined;
                if (token && !target.searchParams.has('error')) {
                  const verification =
                    await ctx.context.internalAdapter.findVerificationValue(
                      `reset-password:${token}`,
                    );
                  if (verification && verification.expiresAt > new Date()) {
                    email = (
                      await ctx.context.internalAdapter.findUserById(
                        verification.value,
                      )
                    )?.email;
                  }
                }
                ctx.setHeader(
                  'location',
                  await broker.publishReset(
                    id,
                    email ? token : undefined,
                    email,
                  ),
                );
              }
            } catch {
              throw new APIError('BAD_REQUEST', {
                message:
                  'This native authentication flow is invalid or has expired.',
              });
            }
          }),
        },
      ],
    },
  };
}
