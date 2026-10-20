import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from 'src/features/ai/ai.module';
import { Account } from 'src/features/accounts/entities/account.entity';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { SynciAccount } from './entities/synci-account.entity';
import { SynciCredential } from './entities/synci-credential.entity';
import { SynciClient } from './synci.client';
import { SynciController } from './synci.controller';
import { SynciService } from './synci.service';

@Module({
  imports: [
    AiModule,
    HttpModule,
    TypeOrmModule.forFeature([
      SynciCredential,
      SynciAccount,
      Account,
      Transaction,
    ]),
  ],
  controllers: [SynciController],
  providers: [SynciService, SynciClient],
  exports: [SynciService],
})
export class SynciModule {}
