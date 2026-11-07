import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../../accounts/entities/account.entity';
import { Transaction } from '../../../transactions/entities/transaction.entity';
import { ConnectedAccount } from '../../entities/connected-account.entity';
import { SynciClient } from './synci.client';
import { SynciService } from './synci.service';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ConnectedAccount, Account, Transaction]),
  ],
  providers: [SynciClient, SynciService],
  exports: [SynciService],
})
export class SynciModule {}
