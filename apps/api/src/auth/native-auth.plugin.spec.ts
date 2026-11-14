import { betterAuth } from 'better-auth';
import { memoryAdapter, type MemoryDB } from 'better-auth/adapters/memory';
import { expo } from '@better-auth/expo';
import {
  NativeHandoffBroker,
  BROWSER_BINDING_COOKIE,
  digest,
} from '../features/native-auth/native-handoff.broker';
import { TestFlowStore, testConfig } from '../../test/fixtures/native-auth';
import { nativeAuthPlugin } from './native-auth.plugin';
import { randomBytes } from 'node:crypto';

const origin = 'https://api.example.test';
const secret = () => randomBytes(32).toString('base64url');
const cookieHeader = (headers: Headers) =>
  headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ');
function fixture(legacy = false, shared?: MemoryDB) {
  const store = new TestFlowStore();
  const broker = new NativeHandoffBroker(store, testConfig());
  const emails: string[] = [];
  const memory = shared ?? {
    user: [],
    account: [],
    session: [],
    verification: [],
  };
  const auth = betterAuth({
    baseURL: origin,
    basePath: '/auth',
    secret: 'integration-test-secret-with-more-than-32-characters',
    database: memoryAdapter(memory),
    trustedOrigins: [origin, 'guallet-android://', 'guallet://'],
    advanced: { useSecureCookies: true },
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ url }) => {
        emails.push(url);
      },
    },
    socialProviders: {
      google: {
        clientId: 'test-google',
        clientSecret: 'test-secret',
        getUserInfo: async () => ({
          user: {
            name: 'Google user',
            email: 'google@example.test',
            emailVerified: true,
          },
          data: {
            sub: 'google-subject',
            aud: 'test-google',
            azp: 'test-google',
            iss: 'https://accounts.google.com',
            email: 'google@example.test',
            email_verified: true,
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            family_name: 'User',
            given_name: 'Google',
            name: 'Google user',
            picture: 'https://example.test/profile.png',
          },
        }),
      },
    },
    plugins: legacy ? [expo()] : [nativeAuthPlugin(origin, broker), expo()],
  });
  return { auth, broker, store, emails, memory };
}

describe('Better Auth native handoff integration', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('blocks legacy native reset/social callbacks while leaving the Expo scheme available', async () => {
    const { auth, emails } = fixture();
    for (const body of [
      {
        email: 'alex@example.test',
        redirectTo: 'guallet-android://login/reset-password',
      },
    ]) {
      const response = await auth.handler(
        new Request(`${origin}/auth/request-password-reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: origin },
          body: JSON.stringify(body),
        }),
      );
      expect(response.status).toBe(400);
      expect(emails).toHaveLength(0);
    }
    const social = await auth.handler(
      new Request(`${origin}/auth/sign-in/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: origin },
        body: JSON.stringify({
          provider: 'google',
          callbackURL: 'guallet-android://login/callback',
        }),
      }),
    );
    expect(social.status).toBe(400);
    const expoFlow = await auth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL: 'guallet://login/callback',
        disableRedirect: true,
      },
      asResponse: true,
    });
    expect(expoFlow.status).toBe(200);
  });
  it('exchanges an email reset callback for a verifier-bound code and resets only its requested account', async () => {
    const { auth, broker, emails } = fixture();
    await auth.api.signUpEmail({
      body: {
        name: 'Alex',
        email: 'alex@example.test',
        password: 'original-password',
      },
    });
    const verifier = secret();
    const flow = await broker.create(
      'reset',
      digest(verifier),
      'alex@example.test',
    );
    await auth.api.requestPasswordReset({
      body: {
        email: 'alex@example.test',
        redirectTo: broker.callback(flow.flowId, 'reset'),
      },
    });
    expect(emails).toHaveLength(1);
    const response = await auth.handler(new Request(emails[0]));
    expect(response.status).toBe(302);
    const location = response.headers.get('location')!;
    const callback = new URL(location);
    expect([...callback.searchParams.keys()].sort()).toEqual([
      'code',
      'flowId',
    ]);
    const code = callback.searchParams.get('code')!;
    await expect(
      broker.redeem('reset', flow.flowId, flow.flowId, verifier),
    ).rejects.toThrow();
    await expect(
      broker.redeem('reset', flow.flowId, code, secret()),
    ).rejects.toThrow();
    const secondOpen = await auth.handler(new Request(emails[0]));
    expect(secondOpen.headers.get('location')).toBe(location);
    const native = await broker.redirect('reset', flow.flowId, code);
    expect(native).not.toContain('token');
    const payload = await broker.redeem('reset', flow.flowId, code, verifier);
    await auth.api.resetPassword({
      body: { token: payload.resetToken!, newPassword: 'replacement-password' },
    });
    const signedIn = await auth.api.signInEmail({
      body: { email: 'alex@example.test', password: 'replacement-password' },
    });
    expect(signedIn.user.email).toBe('alex@example.test');
    await expect(
      broker.redeem('reset', flow.flowId, code, verifier),
    ).rejects.toThrow();
  });
  it('does not publish a token belonging to another email address', async () => {
    const { auth, broker, emails, store } = fixture();
    await auth.api.signUpEmail({
      body: {
        name: 'Other',
        email: 'other@example.test',
        password: 'original-password',
      },
    });
    const flow = await broker.create(
      'reset',
      digest(secret()),
      'alex@example.test',
    );
    await auth.api.requestPasswordReset({
      body: {
        email: 'other@example.test',
        redirectTo: broker.callback(flow.flowId, 'reset'),
      },
    });
    const response = await auth.handler(new Request(emails[0]));
    const location = new URL(response.headers.get('location')!);
    expect(location.origin).toBe(origin);
    expect(location.pathname).toBe('/auth/error');
    expect([...location.searchParams.keys()]).toEqual(['error']);
    expect((await store.find(flow.flowId))?.record.status).toBe('started');
  });
  it('hands off only the fresh Google callback session with its matching browser binding', async () => {
    const { auth, broker } = fixture();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request) => {
        const url = input instanceof Request ? input.url : String(input);
        if (url === 'https://oauth2.googleapis.com/token')
          return Response.json({
            access_token: 'provider-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
          });
        throw new Error('Unexpected provider request');
      }),
    );
    const verifier = secret();
    const flow = await broker.create('google', digest(verifier));
    const binding = await broker.startGoogle(flow.flowId);
    const start = await auth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL: broker.callback(flow.flowId, 'google'),
        disableRedirect: true,
      },
      asResponse: true,
    });
    const provider = (await start.json()) as { url: string };
    const state = new URL(provider.url).searchParams.get('state')!;
    const cookies = `${cookieHeader(start.headers)}; ${BROWSER_BINDING_COOKIE}=${binding}`;
    const callback = await auth.handler(
      new Request(
        `${origin}/auth/callback/google?code=test-code&state=${state}`,
        { headers: { cookie: cookies } },
      ),
    );
    expect(callback.status).toBe(302);
    const location = new URL(callback.headers.get('location')!);
    expect(location.pathname).toBe('/native-auth/google/callback');
    expect([...location.searchParams.keys()].sort()).toEqual([
      'code',
      'flowId',
    ]);
    const code = location.searchParams.get('code')!;
    await expect(
      broker.redeem('google', flow.flowId, code, secret()),
    ).rejects.toThrow();
    const handoff = await broker.redeem('google', flow.flowId, code, verifier);
    expect(handoff.cookie).toContain('HttpOnly');
    expect(handoff.cookie).toContain('Secure');
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: handoff.cookie!.split(';')[0] }),
      query: { disableCookieCache: true },
    });
    expect(session?.user.email).toBe('google@example.test');
  });
  it('blocks credential redirects from a legacy OAuth state issued before upgrade', async () => {
    const previous = fixture(true);
    const upgraded = fixture(false, previous.memory);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          access_token: 'provider-token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      ),
    );
    const start = await previous.auth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL: 'guallet-android://login/callback?flow=legacy',
        disableRedirect: true,
      },
      asResponse: true,
    });
    const body = (await start.json()) as { url: string };
    const state = new URL(body.url).searchParams.get('state')!;
    const response = await upgraded.auth.handler(
      new Request(
        `${origin}/auth/callback/google?code=test-code&state=${state}`,
        { headers: { cookie: cookieHeader(start.headers) } },
      ),
    );
    const location = new URL(response.headers.get('location')!);
    expect(location.origin).toBe(origin);
    expect(location.pathname).toBe('/auth/error');
    expect(location.searchParams.get('error')).toBe('NATIVE_HANDOFF_REQUIRED');
    expect(location.searchParams.has('cookie')).toBe(false);
  });
  it('an existing browser session alone cannot arm a Google handoff', async () => {
    const { auth, broker, store } = fixture();
    const signedIn = await auth.api.signUpEmail({
      body: {
        name: 'Existing',
        email: 'existing@example.test',
        password: 'original-password',
      },
      asResponse: true,
    });
    const verifier = secret();
    const flow = await broker.create('google', digest(verifier));
    await broker.startGoogle(flow.flowId);
    const response = await auth.handler(
      new Request(`${origin}/auth/callback/google?code=invalid&state=invalid`, {
        headers: { cookie: cookieHeader(signedIn.headers) },
      }),
    );
    expect(response.headers.get('location')).not.toContain(
      'guallet-android://',
    );
    await expect(
      broker.redirect('google', flow.flowId, flow.flowId),
    ).rejects.toThrow();
    expect((await store.find(flow.flowId))?.record.status).toBe('started');
  });
});
