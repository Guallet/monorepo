import { Module } from '@nestjs/common';
import { RulesService } from './rules.service.js';
import { RulesController } from './rules.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategorizationRule,
  RuleCondition,
} from './entities/categorization-rule.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { TransactionsModule } from '../transactions/transactions.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategorizationRule, RuleCondition, Transaction]),
    TransactionsModule,
  ],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService],
})
export class RulesModule {}
