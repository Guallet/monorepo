import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { BankSyncAccountSelectionDto } from './dto/import-banksync-accounts.dto';
import { BankSyncService } from './banksync.service';

export const BANKSYNC_QUEUE = 'banksync';
export const BANKSYNC_JOB = 'process';

export type BankSyncJobData = {
  userId: string;
  operation: 'list' | 'import' | 'sync';
  selections?: BankSyncAccountSelectionDto[];
};

@Injectable()
@Processor(BANKSYNC_QUEUE, { concurrency: 4 })
export class BankSyncProcessor extends WorkerHost {
  constructor(private readonly bankSync: BankSyncService) {
    super();
  }

  async process(job: Job<BankSyncJobData>): Promise<unknown> {
    const { userId, operation } = job.data;
    switch (operation) {
      case 'list':
        return { accounts: await this.bankSync.listRemoteAccounts(userId) };
      case 'import':
        return {
          accountIds: await this.bankSync.importAccounts({
            userId,
            selections: job.data.selections ?? [],
          }),
        };
      case 'sync':
        return await this.bankSync.syncUserAccounts(userId);
    }
  }
}
