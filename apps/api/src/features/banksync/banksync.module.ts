import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from 'src/features/ai/ai.module';
import { Account } from 'src/features/accounts/entities/account.entity';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { BankSyncAccount } from './entities/banksync-account.entity';
import { BankSyncCredential } from './entities/banksync-credential.entity';
import { BankSyncClient } from './banksync.client';
import { BankSyncController } from './banksync.controller';
import { BankSyncService } from './banksync.service';

@Module({
  imports: [
    AiModule,
    HttpModule,
    TypeOrmModule.forFeature([
      BankSyncCredential,
      BankSyncAccount,
      Account,
      Transaction,
    ]),
  ],
  controllers: [BankSyncController],
  providers: [BankSyncService, BankSyncClient],
})
export class BankSyncModule {}
