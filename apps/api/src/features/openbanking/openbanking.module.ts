import { NotificationsModule } from '../notifications/notifications.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { UserCredentialsModule } from 'src/user-credentials/user-credentials.module';
import { BankSyncModule } from './providers/banksync/banksync.module';
import { LunchFlowModule } from './providers/lunchflow/lunchflow.module';
import { SynciModule } from './providers/synci/synci.module';
import { NordigenModule } from './providers/nordigen/nordigen.module';
import { BankConnection } from './entities/bank-connection.entity';
import { BankAuthorization } from './entities/bank-authorization.entity';
import { BankProviderRegistry } from './providers/bank-provider.registry';
import { OpenbankingController } from './openbanking.controller';
import { OpenbankingService } from './openbanking.service';
import { OpenbankingProcessor } from './openbanking.processor';
import { OPENBANKING_QUEUE } from './openbanking.jobs';
@Module({
  imports: [
    UserCredentialsModule,
    NotificationsModule,
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
