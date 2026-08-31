import { Module } from '@nestjs/common';
import { OpenbankingService } from './openbanking.service.js';
import { ObConnectionsController } from './ObConnections.controller.js';
import { NordigenService } from '../../features/nordigen/nordigen.service.js';
import { NordigenModule } from '../../features/nordigen/nordigen.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ObConnection } from './entities/connection.entity.js';
import { NordigenAccount } from './entities/nordigen-account.entity.js';
import { NordigenAccountRepository } from './repositories/nordigen-account.repository.js';
import { Account } from '../../features/accounts/entities/account.entity.js';
import { InstitutionsModule } from '../../features/institutions/institutions.module.js';
import { InstitutionsService } from '../../features/institutions/institutions.service.js';
import { Institution } from '../../features/institutions/entities/institution.entity.js';
import { ObAccountsController } from './ObAccounts.controller.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';
import { SyncService } from './sync.service.js';
import { ObASyncController } from './ObSync.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    HttpModule,
    NordigenModule,
    InstitutionsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      ObConnection,
      NordigenAccount,
      Account,
      Institution,
      Transaction,
    ]),
  ],
  controllers: [
    ObConnectionsController,
    ObAccountsController,
    ObASyncController,
  ],
  providers: [
    OpenbankingService,
    NordigenService,
    NordigenAccountRepository,
    InstitutionsService,
    SyncService,
  ],
  exports: [SyncService, OpenbankingService],
})
export class OpenbankingModule {}
