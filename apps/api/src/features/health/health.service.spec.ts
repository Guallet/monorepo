import { HealthService } from './health.service.js';

describe('HealthService', () => {
  const mockHealthCheckService = { check: jest.fn() };
  const mockHealthIndicatorService = { check: jest.fn() };
  const mockHttpIndicator = { pingCheck: jest.fn() };
  const mockTypeOrmHealthIndicator = { pingCheck: jest.fn() };
  const mockPing = jest.fn();
  const mockQueue = {
    client: Promise.resolve({ ping: mockPing }),
  };

  let service: HealthService;

  beforeEach(() => {
    service = new HealthService(
      mockHealthCheckService as never,
      mockHealthIndicatorService as never,
      mockHttpIndicator as never,
      mockTypeOrmHealthIndicator as never,
      mockQueue as never,
    );

    jest.clearAllMocks();
  });

  it('should execute database, redis and http health checks', async () => {
    mockHealthCheckService.check.mockResolvedValue({ status: 'ok' });

    const dbUpResult = { database: { status: 'up' } };
    mockTypeOrmHealthIndicator.pingCheck.mockResolvedValueOnce(dbUpResult);

    const redisUpResult = { redis: { status: 'up' } };
    const redisSession = {
      up: jest.fn().mockReturnValue(redisUpResult),
      down: jest.fn(),
    };
    mockHealthIndicatorService.check.mockReturnValue(redisSession);

    const httpUpResult = { http: { status: 'up' } };
    mockHttpIndicator.pingCheck.mockResolvedValueOnce(httpUpResult);

    await service.check();

    expect(mockHealthCheckService.check).toHaveBeenCalledTimes(1);
    const indicators = mockHealthCheckService.check.mock.calls[0][0] as Array<
      () => Promise<unknown>
    >;
    expect(indicators).toHaveLength(3);

    // database
    await indicators[0]();
    expect(mockTypeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith(
      'database',
      {
        timeout: 3000,
      },
    );

    // redis
    const redisResult = await indicators[1]();
    expect(mockPing).toHaveBeenCalledTimes(1);
    expect(redisSession.up).toHaveBeenCalled();
    expect(redisResult).toEqual(redisUpResult);

    // http
    const httpResult = await indicators[2]();
    expect(mockHttpIndicator.pingCheck).toHaveBeenCalledWith(
      'http',
      'https://www.google.com',
      { timeout: 3000 },
    );
    expect(httpResult).toEqual(httpUpResult);
  });

  it('should return a down result when redis ping fails', async () => {
    mockHealthCheckService.check.mockResolvedValue({ status: 'ok' });
    const pingError = new Error('redis unavailable');
    mockPing.mockRejectedValueOnce(pingError);

    const redisDownResult = { redis: { status: 'down' } };
    const redisSession = {
      up: jest.fn(),
      down: jest.fn().mockReturnValue(redisDownResult),
    };
    mockHealthIndicatorService.check.mockReturnValue(redisSession);

    await service.check();
    const indicators = mockHealthCheckService.check.mock.calls[0][0] as Array<
      () => Promise<unknown>
    >;

    const result = await indicators[1]();
    expect(result).toEqual(redisDownResult);
    expect(redisSession.down).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'redis unavailable',
        latencyMs: expect.any(Number),
      }),
    );
  });
});
