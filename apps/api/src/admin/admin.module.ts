import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { AccountRepository } from 'src/accounts/repositories/account.repository';
import { Institution } from 'src/institutions/entities/insititution.entity';
import { InstitutionRepository } from 'src/institutions/institution.repository';
import { InstitutionsModule } from 'src/institutions/institutions.module';
import { InstitutionsService } from 'src/institutions/institutions.service';
import { NordigenToken } from 'src/nordigen/entities/nordigenToken.entity';
import { NordigenModule } from 'src/nordigen/nordigen.module';
import { NordigenRepository } from 'src/nordigen/nordigen.repository';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { NordigenAccount } from 'src/openbanking/entities/nordigenAccount.entity';
import { NordigenAccountRepository } from 'src/openbanking/repositories/nordigenAccount.repository';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransactionRepository } from 'src/transactions/transaction.repository';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    HttpModule,
    NordigenModule,
    InstitutionsModule,
    TypeOrmModule.forFeature([
      NordigenToken,
      Institution,
      Account,
      NordigenAccount,
      Transaction,
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    NordigenService,
    NordigenRepository,
    InstitutionRepository,
    InstitutionsService,
    AccountRepository,
    NordigenAccountRepository,
    TransactionRepository,
  ],
})
export class AdminModule {}
