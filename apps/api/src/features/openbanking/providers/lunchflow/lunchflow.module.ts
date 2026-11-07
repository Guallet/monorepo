import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../../accounts/entities/account.entity';
import { Transaction } from '../../../transactions/entities/transaction.entity';
import { ConnectedAccount } from '../../entities/connected-account.entity';
import { LunchFlowClient } from './lunchflow.client';
import { LunchFlowService } from './lunchflow.service';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ConnectedAccount, Account, Transaction]),
  ],
  providers: [LunchFlowClient, LunchFlowService],
  exports: [LunchFlowService],
})
export class LunchFlowModule {}
