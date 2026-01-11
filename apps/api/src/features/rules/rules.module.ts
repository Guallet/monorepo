import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategorizationRule,
  RuleCondition,
} from './entities/categorization-rule.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionsModule } from '../transactions/transactions.module';

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
