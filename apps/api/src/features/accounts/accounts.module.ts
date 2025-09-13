import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { InstitutionsModule } from 'src/features/institutions/institutions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AccountsController } from './accounts.controller';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { TransactionsService } from 'src/features/transactions/transactions.service';
import { OpenbankingModule } from '../openbanking/openbanking.module';
import { ObConnection } from '../openbanking/entities/connection.entity';
import { NordigenAccount } from '../openbanking/entities/nordigen-account.entity';
import { Institution } from '../institutions/entities/institution.entity';
import { HttpModule } from '@nestjs/axios';
import { NordigenModule } from '../nordigen/nordigen.module';

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
