import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { InstitutionsModule } from 'src/features/institutions/institutions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AccountsController } from './accounts.controller';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { TransactionsModule } from 'src/features/transactions/transactions.module';
import { Institution } from '../institutions/entities/institution.entity';
import { AccountConnectionsService } from './account-connections.service';
import { ConnectedAccount } from '../openbanking/entities/connected-account.entity';
import { BankConnection } from '../openbanking/entities/bank-connection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Transaction,
      Institution,
      BankConnection,
      ConnectedAccount,
    ]),
    InstitutionsModule,
    TransactionsModule,
  ],
  providers: [AccountsService, AccountConnectionsService],
  exports: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
