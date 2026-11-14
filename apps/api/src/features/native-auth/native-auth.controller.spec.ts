import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
import {
  ValidationPipe,
  BadRequestException,
  type INestApplication,
} from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { NativeAuthController } from './native-auth.controller';
import { NativeAuthService } from './native-auth.service';
import { NativeHandoffBroker } from './native-handoff.broker';

const flowId = 'A'.repeat(43),
  code = 'C'.repeat(43),
  verifier = 'V'.repeat(43);
const origin = 'guallet-android://';
describe('Native handoff HTTP boundary', () => {
  let app: INestApplication;
  let server: Server;
  const service = {
    createGoogle: vi.fn().mockResolvedValue({
      flowId,
      expiresIn: 600,
      browserUrl: `https://api.example.test/native-auth/google/start?flowId=${flowId}`,
    }),
    startGoogle: vi.fn().mockResolvedValue({
      url: 'https://accounts.google.com/o/oauth2/auth',
      cookies: [
        '__Secure-better-auth.oauth_state=SIGNED; Path=/; HttpOnly; Secure',
      ],
      binding: 'BOUND',
    }),
    exchangeGoogle: vi
      .fn()
      .mockResolvedValue(
        '__Secure-better-auth.session_token=SESSION_SECRET; Path=/; HttpOnly; Secure; SameSite=None',
      ),
    createReset: vi.fn().mockResolvedValue({ flowId, expiresIn: 600 }),
    finishReset: vi.fn().mockResolvedValue({ success: true }),
  };
  const broker = {
    redirect: vi
      .fn()
      .mockRejectedValue(new BadRequestException('Invalid flow')),
  };
  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }])],
      controllers: [NativeAuthController],
      providers: [
        { provide: NativeAuthService, useValue: service },
        { provide: NativeHandoffBroker, useValue: broker },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
  });
  afterEach(async () => {
    await app.close();
  });
  it('rejects browser and missing origins before exchanging a session', async () => {
    for (const badOrigin of [undefined, 'https://attacker.example', 'null']) {
      const call = request(server).post('/native-auth/google/exchange');
      if (badOrigin) call.set('Origin', badOrigin);
      const response = await call.send({ flowId, code, verifier }).expect(400);
      expect(response.headers['set-cookie']).toBeUndefined();
    }
    expect(service.exchangeGoogle).not.toHaveBeenCalled();
  });
  it('sets a short-lived secure HttpOnly browser binding on the HTTPS entry', async () => {
    const response = await request(server)
      .get(`/native-auth/google/start?flowId=${flowId}`)
      .expect(302);
    expect(response.headers['cache-control']).toBe('no-store');
    const binding = [response.headers['set-cookie']]
      .flat()
      .find((cookie: string) =>
        cookie.startsWith('__Host-guallet.native_binding='),
      );
    expect(binding).toContain(
      'Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax',
    );
    expect(response.headers.location).toBe(
      'https://accounts.google.com/o/oauth2/auth',
    );
  });
  it('delivers credentials only as secure cookies on a noncacheable native POST', async () => {
    const response = await request(server)
      .post('/native-auth/google/exchange')
      .set('Origin', origin)
      .send({ flowId, code, verifier })
      .expect(200);
    expect(response.body).toEqual({ success: true });
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(response.headers['set-cookie'][0]).toContain('Secure');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
    expect(JSON.stringify(response.body)).not.toContain('SESSION_SECRET');
  });
  it('rejects malformed verifiers, legacy credential fields and short passwords', async () => {
    for (const body of [
      { flowId, code, verifier: 'short' },
      { flowId, code, verifier, token: 'LEGACY_SECRET' },
    ]) {
      await request(server)
        .post('/native-auth/google/exchange')
        .set('Origin', origin)
        .send(body)
        .expect(400);
    }
    await request(server)
      .post('/native-auth/reset/complete')
      .set('Origin', origin)
      .send({ flowId, code, verifier, newPassword: 'short' })
      .expect(400);
    expect(service.exchangeGoogle).not.toHaveBeenCalled();
    expect(service.finishReset).not.toHaveBeenCalled();
  });
  it('rejects credential-bearing and ambiguous browser callback query strings', async () => {
    await request(server)
      .get(`/native-auth/reset/callback?flowId=${flowId}&token=LEGACY_SECRET`)
      .expect(400);
    await request(server)
      .get(
        `/native-auth/google/callback?flowId=${flowId}&flowId=${flowId}&code=${code}`,
      )
      .expect(400);
    expect(broker.redirect).not.toHaveBeenCalled();
  });
  it('a bare public flow reference never copies an existing browser session', async () => {
    const response = await request(server)
      .get(`/native-auth/google/callback?flowId=${flowId}&code=${flowId}`)
      .set('Cookie', '__Secure-better-auth.session_token=EXISTING')
      .expect(400);
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(service.exchangeGoogle).not.toHaveBeenCalled();
  });
  it('rate limits reset email requests', async () => {
    for (let count = 0; count < 5; count++)
      await request(server)
        .post('/native-auth/reset')
        .set('Origin', origin)
        .send({ email: 'alex@example.test', challenge: verifier })
        .expect(200);
    await request(server)
      .post('/native-auth/reset')
      .set('Origin', origin)
      .send({ email: 'alex@example.test', challenge: verifier })
      .expect(429);
    expect(service.createReset).toHaveBeenCalledTimes(5);
  });
});
