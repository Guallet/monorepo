import { Module } from '@nestjs/common';
import { OpenbankingService } from './openbanking.service';
import { ObConnectionsController } from './ObConnections.controller';
import { NordigenService } from 'src/features/nordigen/nordigen.service';
import { NordigenModule } from 'src/features/nordigen/nordigen.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ObConnection } from './entities/connection.entity';
import { NordigenAccount } from './entities/nordigen-account.entity';
import { NordigenAccountRepository } from './repositories/nordigen-account.repository';
import { Account } from 'src/features/accounts/entities/account.entity';
import { InstitutionsModule } from 'src/features/institutions/institutions.module';
import { InstitutionsService } from 'src/features/institutions/institutions.service';
import { Institution } from 'src/features/institutions/entities/institution.entity';
import { ObAccountsController } from './ObAccounts.controller';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { SyncService } from './sync.service';
import { ObASyncController } from './ObSync.controller';

@Module({
  imports: [
    HttpModule,
    NordigenModule,
    InstitutionsModule,
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
