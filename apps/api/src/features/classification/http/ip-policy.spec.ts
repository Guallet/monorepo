import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/configuration';
import { SafeHttpClient } from './safe-http-client';
const dns = vi.hoisted(() => ({ lookup: vi.fn() }));
vi.mock('node:dns/promises', () => dns);
describe('DNS policy', () => {
  const config = new ConfigService<AppConfig>({
    decision: {
      allowHttp: false,
      privateTargets: [],
      allowedHosts: [],
      timeoutMs: 1000,
      maxQuestions: 24,
      requestsPerMinute: 60,
    },
    database: { host: '127.0.0.1' },
    redis: { host: '127.0.0.1' },
    auth: { baseUrl: 'https://127.0.0.1' },
  });
  beforeEach(() => vi.resetAllMocks());
  it('rejects mixed public/private DNS responses', async () => {
    dns.lookup.mockResolvedValue([
      { address: '8.8.8.8', family: 4 },
      { address: '10.0.0.1', family: 4 },
    ]);
    await expect(
      new SafeHttpClient(config).validate('https://decision.example/v1'),
    ).rejects.toMatchObject({ code: 'blocked' });
  });
  it('returns the validated address for socket pinning without a second lookup', async () => {
    dns.lookup
      .mockResolvedValueOnce([{ address: '8.8.8.8', family: 4 }])
      .mockResolvedValue([{ address: '127.0.0.1', family: 4 }]);
    const target = await new SafeHttpClient(config).validate(
      'https://decision.example/v1',
    );
    expect(target.address).toBe('8.8.8.8');
    expect(dns.lookup).toHaveBeenCalledTimes(1);
    expect(target.url.hostname).toBe('decision.example');
  });
  it('honours the public hostname allowlist', async () => {
    const restricted = new ConfigService<AppConfig>({
      ...config.getOrThrow('decision'),
      decision: {
        ...config.getOrThrow('decision'),
        allowedHosts: ['allowed.example'],
      },
    });
    await expect(
      new SafeHttpClient(restricted).validate('https://other.example/v1'),
    ).rejects.toMatchObject({ code: 'blocked' });
    expect(dns.lookup).not.toHaveBeenCalled();
  });
});
