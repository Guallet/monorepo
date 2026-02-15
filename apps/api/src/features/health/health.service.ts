import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  HealthCheckError,
  HealthCheckService,
  HealthIndicatorService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HEALTH_CHECK_QUEUE } from './health.constants';

@Injectable()
export class HealthService {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    @InjectQueue(HEALTH_CHECK_QUEUE)
    private readonly healthCheckQueue: Queue,
  ) {}

  async check() {
    return this.healthCheckService.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
      () => this.checkRedis(),
    ]);
  }

  private async checkRedis() {
    const start = Date.now();
    const indicator = this.healthIndicatorService.check('redis');

    try {
      const redisClient = await this.healthCheckQueue.client;
      await redisClient.ping();

      return indicator.up({ latencyMs: Date.now() - start });
    } catch (error) {
      throw new HealthCheckError(
        'Redis check failed',
        indicator.down({
          latencyMs: Date.now() - start,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }
}
