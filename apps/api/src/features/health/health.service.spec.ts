import { HealthCheckError } from '@nestjs/terminus';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const mockHealthCheckService = { check: jest.fn() };
  const mockHealthIndicatorService = { check: jest.fn() };
  const mockTypeOrmHealthIndicator = { pingCheck: jest.fn() };
  const mockPing = jest.fn();
  const mockQueue = {
    client: Promise.resolve({
      ping: mockPing,
    }),
  };

  let service: HealthService;

  beforeEach(() => {
    service = new HealthService(
      mockHealthCheckService as never,
      mockHealthIndicatorService as never,
      mockTypeOrmHealthIndicator as never,
      mockQueue as never,
    );
    jest.clearAllMocks();
  });

  it('should register database and redis checks with Terminus', async () => {
    mockHealthCheckService.check.mockResolvedValue({ status: 'ok' });
    const redisUpResult = { redis: { status: 'up' } };
    const redisSession = {
      up: jest.fn().mockReturnValue(redisUpResult),
      down: jest.fn(),
    };
    mockHealthIndicatorService.check.mockReturnValue(redisSession);
    mockTypeOrmHealthIndicator.pingCheck.mockResolvedValue({
      database: { status: 'up' },
    });

    await service.check();

    expect(mockHealthCheckService.check).toHaveBeenCalledTimes(1);
    const indicators = mockHealthCheckService.check.mock.calls[0][0] as Array<
      () => Promise<unknown>
    >;
    expect(indicators).toHaveLength(2);

    await indicators[0]();
    expect(mockTypeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith(
      'database',
    );

    const redisResult = await indicators[1]();
    expect(mockPing).toHaveBeenCalledTimes(1);
    expect(redisSession.up).toHaveBeenCalled();
    expect(redisResult).toEqual(redisUpResult);
  });

  it('should throw HealthCheckError when redis ping fails', async () => {
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

    await expect(indicators[1]()).rejects.toBeInstanceOf(HealthCheckError);
    expect(redisSession.down).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'redis unavailable',
      }),
    );
  });
});
