import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategorizationRuleEntity,
  RuleConditionEntity,
} from './entities/categorization-rule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategorizationRuleEntity, RuleConditionEntity]),
  ],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService],
})
export class RulesModule {}
