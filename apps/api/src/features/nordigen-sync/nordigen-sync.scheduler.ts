import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NordigenKeysService } from '../nordigen-keys/nordigen-keys.service';
import {
  NORDIGEN_SYNC_QUEUE,
  NORDIGEN_SYNC_JOB,
  NordigenSyncJobData,
} from './nordigen-sync.processor';

const CRON_JOB_NAME = 'cron.nordigen.sync';
const CRON_JOB_TIMEZONE = 'UTC';

@Injectable()
export class NordigenSyncScheduler {
  private readonly logger = new Logger(NordigenSyncScheduler.name);

  constructor(
    @InjectQueue(NORDIGEN_SYNC_QUEUE)
    private readonly syncQueue: Queue<NordigenSyncJobData>,
    private readonly nordigenKeysService: NordigenKeysService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: CRON_JOB_NAME,
    timeZone: CRON_JOB_TIMEZONE,
  })
  async scheduleDailySync(): Promise<void> {
    this.logger.log('Starting daily Nordigen sync cron job');

    try {
      // Get all keys with linked accounts
      const keys = await this.nordigenKeysService.findAllKeysWithAccounts();
      this.logger.log(`Found ${keys.length} Nordigen keys with linked accounts`);

      // Enqueue a sync job for each key
      for (const key of keys) {
        await this.syncQueue.add(
          NORDIGEN_SYNC_JOB,
          { keyId: key.id },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 60000, // 1 minute initial delay
            },
            removeOnComplete: 100,
            removeOnFail: 50,
          },
        );
        this.logger.debug(`Enqueued Nordigen sync job for key ${key.id}`);
      }

      this.logger.log(
        `Daily Nordigen sync cron job completed. Enqueued ${keys.length} sync jobs.`,
      );
    } catch (error) {
      this.logger.error('Error in daily Nordigen sync cron job', error);
    }
  }
}
