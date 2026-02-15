import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  HealthCheckService,
  HealthIndicatorService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HEALTH_CHECK_QUEUE } from './health.constants';

@Injectable()
export class HealthService {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly httpIndicator: HttpHealthIndicator,
    private readonly typeormHealthIndicator: TypeOrmHealthIndicator,
    @InjectQueue(HEALTH_CHECK_QUEUE)
    private readonly healthCheckQueue: Queue,
  ) {}

  async check() {
    return this.healthCheckService.check([
      () => this.checkDatabase(),
      () => this.checkRedis(),
      () => this.checkHttp(),
    ]);
  }

  private checkDatabase() {
    return this.typeormHealthIndicator.pingCheck('database', {
      timeout: 3000,
    });
  }

  private async checkRedis() {
    const start = Date.now();
    const indicator = this.healthIndicatorService.check('redis-health');

    try {
      const redisClient = await this.healthCheckQueue.client;
      await redisClient.ping();

      return indicator.up({ latencyMs: Date.now() - start });
    } catch (error) {
      return indicator.down({
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async checkHttp() {
    return this.httpIndicator.pingCheck('http', 'https://www.google.com', {
      timeout: 3000,
    });
  }
}
