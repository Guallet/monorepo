import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  NordigenSyncProcessor,
  NORDIGEN_SYNC_QUEUE,
} from './nordigen-sync.processor';
import { NordigenSyncScheduler } from './nordigen-sync.scheduler';
import { NordigenModule } from '../nordigen/nordigen.module';
import { NordigenAccount } from '../openbanking/entities/nordigen-account.entity';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { NordigenKeysModule } from '../nordigen-keys/nordigen-keys.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: NORDIGEN_SYNC_QUEUE,
    }),
    TypeOrmModule.forFeature([NordigenAccount, Account, Transaction]),
    NordigenModule,
    EmailModule,
    UsersModule,
    NordigenKeysModule,
  ],
  providers: [NordigenSyncProcessor, NordigenSyncScheduler],
  exports: [NordigenSyncScheduler],
})
export class NordigenSyncModule {}
