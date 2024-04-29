import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HttpModule } from '@nestjs/axios';
import { NordigenModule } from 'src/nordigen/nordigen.module';
import { InstitutionsModule } from 'src/institutions/institutions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institution } from 'src/institutions/entities/institution.entity';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { InstitutionsService } from 'src/institutions/institutions.service';
import { SyncService } from 'src/openbanking/sync.service';
import { OpenbankingModule } from 'src/openbanking/openbanking.module';
import { Account } from 'src/accounts/entities/account.entity';
import { ObConnection } from 'src/openbanking/entities/connection.entity';
import { NordigenAccount } from 'src/openbanking/entities/nordigen-account.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { OpenbankingService } from 'src/openbanking/openbanking.service';
import { NordigenAccountRepository } from 'src/openbanking/repositories/nordigen-account.repository';

@Module({
  imports: [
    HttpModule,
    NordigenModule,
    InstitutionsModule,
    OpenbankingModule,
    TypeOrmModule.forFeature([
      NordigenAccount,
      Account,
      Transaction,
      Institution,
      ObConnection,
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    OpenbankingService,
    NordigenService,
    NordigenAccountRepository,
    InstitutionsService,
    SyncService,
  ],
})
export class AdminModule {}
