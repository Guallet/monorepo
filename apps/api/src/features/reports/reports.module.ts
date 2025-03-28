import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/features/categories/entities/category.entity';
import { Account } from 'src/features/accounts/entities/account.entity';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Category, Transaction])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
