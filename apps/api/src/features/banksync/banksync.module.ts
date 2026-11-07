import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { ConnectedAccount } from '../openbanking/entities/connected-account.entity';
import { BankSyncClient } from './banksync.client';
import { BankSyncService } from './banksync.service';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ConnectedAccount, Account, Transaction]),
  ],
  providers: [BankSyncClient, BankSyncService],
  exports: [BankSyncService],
})
export class BankSyncModule {}
