import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { InstitutionsModule } from '../../features/institutions/institutions.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity.js';
import { AccountsController } from './accounts.controller.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';
import { TransactionsService } from '../../features/transactions/transactions.service.js';
import { OpenbankingModule } from '../openbanking/openbanking.module.js';
import { ObConnection } from '../openbanking/entities/connection.entity.js';
import { NordigenAccount } from '../openbanking/entities/nordigen-account.entity.js';
import { Institution } from '../institutions/entities/institution.entity.js';
import { HttpModule } from '@nestjs/axios';
import { NordigenModule } from '../nordigen/nordigen.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Transaction,
      ObConnection,
      NordigenAccount,
      Institution,
    ]),
    InstitutionsModule,
    OpenbankingModule,
    NordigenModule,
    HttpModule,
  ],
  providers: [AccountsService, TransactionsService],
  exports: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
