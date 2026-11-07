import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../../accounts/entities/account.entity';
import { Transaction } from '../../../transactions/entities/transaction.entity';
import { BankAuthorization } from '../../entities/bank-authorization.entity';
import { ConnectedAccount } from '../../entities/connected-account.entity';
import { NordigenClient } from './nordigen.client';
import { NordigenService } from './nordigen.service';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Account,
      Transaction,
      BankAuthorization,
      ConnectedAccount,
    ]),
  ],
  providers: [NordigenClient, NordigenService],
  exports: [NordigenService],
})
export class NordigenModule {}
