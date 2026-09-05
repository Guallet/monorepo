import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service.js';
import { BudgetsController } from './budgets.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, Transaction])],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}
