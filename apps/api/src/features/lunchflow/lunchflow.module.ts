import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialEncryptionService } from 'src/common/crypto/credential-encryption.service';
import { Account } from 'src/features/accounts/entities/account.entity';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { LunchFlowAccount } from './entities/lunchflow-account.entity';
import { LunchFlowCredential } from './entities/lunchflow-credential.entity';
import { LunchFlowClient } from './lunchflow.client';
import { LunchFlowController } from './lunchflow.controller';
import { LunchFlowService } from './lunchflow.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      LunchFlowCredential,
      LunchFlowAccount,
      Account,
      Transaction,
    ]),
  ],
  controllers: [LunchFlowController],
  providers: [LunchFlowService, LunchFlowClient, CredentialEncryptionService],
  exports: [LunchFlowService],
})
export class LunchFlowModule {}
