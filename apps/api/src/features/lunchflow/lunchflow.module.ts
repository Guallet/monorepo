import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { LunchFlowAccount } from './entities/lunchflow-account.entity';
import { LunchFlowClient } from './lunchflow.client';
import { LunchFlowService } from './lunchflow.service';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([LunchFlowAccount, Account, Transaction]),
  ],
  providers: [LunchFlowClient, LunchFlowService],
  exports: [LunchFlowService],
})
export class LunchFlowModule {}
