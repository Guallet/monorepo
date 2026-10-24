import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { BankSyncAccount } from './entities/banksync-account.entity';
import { BankSyncClient } from './banksync.client';
import { BankSyncService } from './banksync.service';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([BankSyncAccount, Account, Transaction]),
  ],
  providers: [BankSyncClient, BankSyncService],
  exports: [BankSyncService],
})
export class BankSyncModule {}
