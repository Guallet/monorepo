import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { ReportsController } from './reports.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../features/categories/entities/category.entity.js';
import { Account } from '../../features/accounts/entities/account.entity.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Category, Transaction])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
