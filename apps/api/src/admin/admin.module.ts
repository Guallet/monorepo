import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HttpModule } from '@nestjs/axios';
import { NordigenModule } from 'src/features/nordigen/nordigen.module';
import { InstitutionsModule } from 'src/features/institutions/institutions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institution } from 'src/features/institutions/entities/institution.entity';
import { NordigenService } from 'src/features/nordigen/nordigen.service';
import { InstitutionsService } from 'src/features/institutions/institutions.service';
import { SyncService } from 'src/features/openbanking/sync.service';
import { OpenbankingModule } from 'src/features/openbanking/openbanking.module';
import { Account } from 'src/features/accounts/entities/account.entity';
import { ObConnection } from 'src/features/openbanking/entities/connection.entity';
import { NordigenAccount } from 'src/features/openbanking/entities/nordigen-account.entity';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { OpenbankingService } from 'src/features/openbanking/openbanking.service';
import { NordigenAccountRepository } from 'src/features/openbanking/repositories/nordigen-account.repository';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    HttpModule,
    StorageModule,
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
