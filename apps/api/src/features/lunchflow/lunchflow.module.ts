import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from 'src/features/ai/ai.module';
import { Account } from 'src/features/accounts/entities/account.entity';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { LunchFlowAccount } from './entities/lunchflow-account.entity';
import { LunchFlowCredential } from './entities/lunchflow-credential.entity';
import { LunchFlowClient } from './lunchflow.client';
import { LunchFlowController } from './lunchflow.controller';
import { LunchFlowService } from './lunchflow.service';

@Module({
  imports: [
    AiModule,
    HttpModule,
    TypeOrmModule.forFeature([
      LunchFlowCredential,
      LunchFlowAccount,
      Account,
      Transaction,
    ]),
  ],
  controllers: [LunchFlowController],
  providers: [LunchFlowService, LunchFlowClient],
  exports: [LunchFlowService],
})
export class LunchFlowModule {}
