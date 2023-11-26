import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/categories/models/category.entity';
import { Account } from 'src/accounts/models/account.model';
import { Transaction } from 'src/transactions/models/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Category, Transaction])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
