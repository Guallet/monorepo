import { hash } from './classification.logic';
import { Injectable, OnModuleDestroy, Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/configuration';
import { DecisionError } from './http/safe-http-client';
export const CLASSIFICATION_QUEUE = 'classify-transactions';
@Injectable()
export class ClassificationLimits implements OnModuleDestroy {
  private readonly redis: Redis;
  constructor(private readonly config: ConfigService<AppConfig>) {
    this.redis = new Redis({
      ...config.getOrThrow('redis', { infer: true }),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
    });
    this.redis.on('error', () => {});
  }
  onModuleDestroy() {
    this.redis.disconnect();
  }
  async request({
    userId,
    connectionId,
  }: {
    userId: string;
    connectionId: string;
  }) {
    const redis = this.redis;
    const key = `classification:${hash(userId)}:${connectionId}`;
    const limit = this.config.getOrThrow('decision', {
      infer: true,
    }).requestsPerMinute;
    const wait = Number(
      await redis.eval(
        `
      local cooldown = redis.call('PTTL', KEYS[2])
      if cooldown > 0 then return cooldown end
      local n = redis.call('INCR', KEYS[1])
      if n == 1 then redis.call('PEXPIRE', KEYS[1], 60000) end
      if n > tonumber(ARGV[1]) then return redis.call('PTTL', KEYS[1]) end
      return 0
    `,
        2,
        `${key}:requests`,
        `${key}:cooldown`,
        limit,
      ),
    );
    if (wait > 0) throw new DecisionError('rate_limit', wait);
  }
  async cooldown({
    userId,
    connectionId,
    delay,
  }: {
    userId: string;
    connectionId: string;
    delay: number;
  }) {
    const redis = this.redis;
    await redis.set(
      `classification:${hash(userId)}:${connectionId}:cooldown`,
      '1',
      'PX',
      delay,
    );
  }
  async clear({ userId }: { userId: string }) {
    const redis = this.redis;
    let cursor = '0';
    do {
      const [next, keys] = await redis.scan(
        cursor,
        'MATCH',
        `classification:${hash(userId)}:*`,
        'COUNT',
        100,
      );
      cursor = next;
      if (keys.length) await redis.del(...keys);
    } while (cursor !== '0');
  }
}

@Module({ providers: [ClassificationLimits], exports: [ClassificationLimits] })
export class ClassificationLimitsModule {}
