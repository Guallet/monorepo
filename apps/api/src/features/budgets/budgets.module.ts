import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, Transaction])],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}
