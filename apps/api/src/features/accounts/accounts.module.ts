import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { InstitutionsModule } from 'src/features/institutions/institutions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AccountsController } from './accounts.controller';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { TransactionsModule } from 'src/features/transactions/transactions.module';
import { Institution } from '../institutions/entities/institution.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction, Institution]),
    InstitutionsModule,
    TransactionsModule,
  ],
  providers: [AccountsService],
  exports: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
