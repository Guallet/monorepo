import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransactionRepository } from 'src/transactions/transaction.repository';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { TransactionsService } from 'src/transactions/transactions.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';
import { AccountRepository } from './repositories/account.repository';

@Module({
  imports: [
    TransactionsModule,
    TypeOrmModule.forFeature([Account, Transaction]),
  ],
  controllers: [AccountsController],
  providers: [
    AccountsService,
    AccountRepository,
    TransactionsService,
    TransactionRepository,
  ],
})
export class AccountModule {}
