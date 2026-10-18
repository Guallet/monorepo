import { ConfigService } from '@nestjs/config';
import { createServer, Server, RequestListener } from 'node:http';
import { AddressInfo } from 'node:net';
import { AppConfig } from 'src/configuration';
import { SafeHttpClient, isPublicAddress } from './safe-http-client';
import { JevClient } from '../jev-client.service';
import { DecisionConnection } from '../entities/decision-connection.entity';

function config(port = 8017, allowHttp = true) {
  return new ConfigService<AppConfig>({
    decision: {
      allowHttp,
      privateTargets: [`127.0.0.2:${port}`],
      allowedHosts: [],
      timeoutMs: 200,
      maxQuestions: 2,
      requestsPerMinute: 60,
    },
    database: { host: '127.0.0.1', port: 5432 },
    redis: { host: '127.0.0.1', port: 6379 },
    auth: { baseUrl: 'https://127.0.0.1:5000' },
  });
}
describe('safe decision HTTP', () => {
  let server: Server;
  let base: string;
  let settings: ConfigService<AppConfig>;
  afterEach(async () => {
    if (server) {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it.each([
    '0.0.0.0',
    '10.0.0.1',
    '100.64.0.1',
    '127.0.0.1',
    '169.254.169.254',
    '172.16.1.1',
    '192.168.1.1',
    '198.18.0.1',
    '224.0.0.1',
    '240.0.0.1',
    '::',
    '::1',
    'fc00::1',
    'fe80::1',
    'ff00::1',
    '::ffff:127.0.0.1',
    '2002:7f00:1::',
    '2001:db8::1',
  ])('rejects reserved address %s', (address) =>
    expect(isPublicAddress(address)).toBe(false),
  );
  it.each([
    'https://2130706433/v1',
    'https://0177.0.0.1/v1',
    'https://0x7f.1/v1',
    'https://user:pass@example.com/v1',
    'file:///tmp/test',
    'ftp://example.com',
    'https://example.com/v1#fragment',
    'https://example.com/v1?secret=1',
  ])('rejects unsafe URL %s', async (url) => {
    await expect(
      new SafeHttpClient(config()).validate(url),
    ).rejects.toMatchObject({ code: 'blocked' });
  });
  it('requires HTTP permission and an exact private destination/port', async () => {
    await expect(
      new SafeHttpClient(config(8017, false)).validate(
        'http://127.0.0.2:8017/v1',
      ),
    ).rejects.toMatchObject({ code: 'blocked' });
    await expect(
      new SafeHttpClient(config()).validate('http://127.0.0.2:9999/v1'),
    ).rejects.toMatchObject({ code: 'blocked' });
    await expect(
      new SafeHttpClient(config()).validate('http://127.0.0.2:8017/v1'),
    ).resolves.toMatchObject({ address: '127.0.0.2' });
  });
  async function listen(handler: RequestListener) {
    server = createServer(handler);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.2', resolve),
    );
    const port = (server.address() as AddressInfo).port;
    base = `http://127.0.0.2:${port}/v1`;
    settings = config(port);
  }
  it('batches yes/no options, preserves all scores and pins requests', async () => {
    const requests: unknown[] = [];
    await listen((req, res) => {
      let body = '';
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const payload = JSON.parse(body) as {
          questions: Record<string, unknown>;
        };
        requests.push(payload);
        expect(req.url).toBe('/v1/systemone');
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(
          JSON.stringify({
            answers: Object.fromEntries(
              Object.keys(payload.questions).map((key) => [
                key,
                { type: 'noul', noul: key === 'q0' ? 0.9 : 0.1 },
              ]),
            ),
          }),
        );
      });
    });
    const client = new JevClient(new SafeHttpClient(settings), settings);
    const before = vi.fn().mockResolvedValue(undefined);
    const result = await client.scores(
      {
        base_url: base,
        model: 'test',
        auth_type: 'none',
      } as DecisionConnection,
      {},
      { description: 'shop' },
      [0, 1, 2].map((i) => ({
        key: `q${i}`,
        categoryId: `${i}`,
        label: `${i}`,
      })),
      before,
    );
    expect(result).toEqual({ q0: 0.9, q1: 0.1, q2: 0.1 });
    expect(requests).toHaveLength(2);
    expect(before).toHaveBeenCalledTimes(2);
  });
  it.each([302, 401, 403, 422, 429, 500])(
    'maps status %s without leaking upstream bodies',
    async (status) => {
      await listen((_req, res) => {
        res.writeHead(status, {
          location: 'http://169.254.169.254',
          'retry-after': '2',
        });
        res.end('secret-upstream-body');
      });
      await expect(
        new SafeHttpClient(settings).post(base, {}, {}),
      ).rejects.toMatchObject({
        code:
          status === 429
            ? 'rate_limit'
            : status === 401 || status === 403
              ? 'auth'
              : status === 500
                ? 'unavailable'
                : 'protocol',
      });
    },
  );
  it('rejects oversized bodies', async () => {
    await listen((_req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: 'a'.repeat(66000) }));
    });
    await expect(
      new SafeHttpClient(settings).post(base, {}, {}),
    ).rejects.toMatchObject({ code: 'protocol' });
  });
  it('enforces a total deadline for a slow response', async () => {
    await listen((_req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.write('{');
    });
    await expect(
      new SafeHttpClient(settings).post(base, {}, {}),
    ).rejects.toMatchObject({ code: 'unavailable' });
  });
});
