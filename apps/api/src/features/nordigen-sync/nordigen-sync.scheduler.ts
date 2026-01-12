import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UsersService } from '../users/users.service';
import {
  NORDIGEN_SYNC_QUEUE,
  NORDIGEN_SYNC_JOB,
  NordigenSyncJobData,
} from './nordigen-sync.processor';

const CRON_JOB_NAME = 'cron.nordigen.sync';
const CRON_JOB_TIMEZONE = 'Europe/London';

@Injectable()
export class NordigenSyncScheduler {
  private readonly logger = new Logger(NordigenSyncScheduler.name);

  constructor(
    @InjectQueue(NORDIGEN_SYNC_QUEUE)
    private readonly syncQueue: Queue<NordigenSyncJobData>,
    private readonly usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: CRON_JOB_NAME,
    timeZone: CRON_JOB_TIMEZONE,
  })
  async scheduleDailySync(): Promise<void> {
    this.logger.log('Starting daily Nordigen sync cron job');

    try {
      // Get all users with Nordigen credentials
      const users = await this.usersService.getUsersWithNordigenCredentials();
      this.logger.log(`Found ${users.length} users with Nordigen credentials`);

      // Enqueue a sync job for each user
      for (const user of users) {
        await this.syncQueue.add(
          NORDIGEN_SYNC_JOB,
          { userId: user.id },
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
        this.logger.debug(`Enqueued Nordigen sync job for user ${user.id}`);
      }

      this.logger.log(
        `Daily Nordigen sync cron job completed. Enqueued ${users.length} sync jobs.`,
      );
    } catch (error) {
      this.logger.error('Error in daily Nordigen sync cron job', error);
    }
  }
}
