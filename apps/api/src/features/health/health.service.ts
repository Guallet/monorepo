import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { HEALTH_CHECK_QUEUE } from './health.constants';

export type CheckStatus = 'up' | 'down';

export interface HealthCheckResult {
  status: CheckStatus;
  latencyMs: number;
  error?: string;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectQueue(HEALTH_CHECK_QUEUE)
    private readonly healthCheckQueue: Queue,
  ) {}

  async check() {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const status: 'ok' | 'degraded' =
      database.status === 'up' && redis.status === 'up' ? 'ok' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database,
        redis,
      },
    };
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now();

    try {
      await this.dataSource.query('SELECT 1');

      return {
        status: 'up',
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async checkRedis(): Promise<HealthCheckResult> {
    const start = Date.now();

    try {
      const redisClient = await this.healthCheckQueue.client;
      await redisClient.ping();

      return {
        status: 'up',
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
