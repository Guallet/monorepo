import { Module } from '@nestjs/common';
import { OpenbankingService } from './openbanking.service';
import { ObConnectionsController } from './ObConnections.controller';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { NordigenModule } from 'src/nordigen/nordigen.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ObConnection } from './entities/connection.entity';
import { NordigenAccount } from './entities/nordigen-account.entity';
import { NordigenAccountRepository } from './repositories/nordigen-account.repository';
import { Account } from 'src/accounts/entities/account.entity';
import { InstitutionsModule } from 'src/institutions/institutions.module';
import { InstitutionsService } from 'src/institutions/institutions.service';
import { Institution } from 'src/institutions/entities/institution.entity';
import { ObAccountsController } from './ObAccounts.controller';
import { Transaction } from 'src/transactions/entities/transaction.entity';

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
  controllers: [ObConnectionsController, ObAccountsController],
  providers: [
    OpenbankingService,
    NordigenService,
    NordigenAccountRepository,
    InstitutionsService,
  ],
})
export class OpenbankingModule {}
