import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from '../ai/ai.module';
import { BankSyncModule } from '../banksync/banksync.module';
import { LunchFlowModule } from '../lunchflow/lunchflow.module';
import { SynciModule } from '../synci/synci.module';
import { NordigenModule } from '../nordigen/nordigen.module';
import { BankConnection } from './entities/bank-connection.entity';
import { BankAuthorization } from './entities/bank-authorization.entity';
import { BankProviderRegistry } from './providers/bank-provider.registry';
import { OpenbankingController } from './openbanking.controller';
import { OpenbankingService } from './openbanking.service';
import { OpenbankingProcessor } from './openbanking.processor';
import { OPENBANKING_QUEUE } from './openbanking.jobs';
@Module({
  imports: [
    AiModule,
    BankSyncModule,
    LunchFlowModule,
    SynciModule,
    NordigenModule,
    TypeOrmModule.forFeature([BankConnection, BankAuthorization]),
    BullModule.registerQueue({ name: OPENBANKING_QUEUE }),
  ],
  controllers: [OpenbankingController],
  providers: [BankProviderRegistry, OpenbankingService, OpenbankingProcessor],
})
export class OpenbankingModule {}
