import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CategorizationRule,
  RuleCondition,
} from '../entities/categorization-rule.entity.js';

export class RuleConditionDto {
  @ApiProperty({ description: 'Condition ID' })
  id: string;

  @ApiProperty({ description: 'Transaction field to evaluate' })
  field: string;

  @ApiProperty({ description: 'Operator for evaluation' })
  operator: string;

  @ApiProperty({ description: 'Value to compare against' })
  value: string;

  @ApiProperty({ description: 'Order of the condition' })
  order: number;

  static fromEntity(entity: RuleCondition): RuleConditionDto {
    return {
      id: entity.id,
      field: entity.field,
      operator: entity.operator,
      value: entity.value,
      order: entity.order,
    };
  }
}

export class RuleDto {
  @ApiProperty({ description: 'Rule ID' })
  id: string;

  @ApiProperty({ description: 'Rule name' })
  name: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  description: string | null;

  @ApiProperty({ description: 'Category ID to assign on match' })
  resultCategoryId: string;

  @ApiProperty({ description: 'Rule evaluation order' })
  order: number;

  @ApiProperty({ description: 'Whether the rule is active' })
  isActive: boolean;

  @ApiProperty({
    description: 'Logic for combining conditions',
    enum: ['and', 'or'],
  })
  conditionLogic: string;

  @ApiProperty({
    description:
      'Conditions evaluated according to conditionLogic: all must match for "and", at least one must match for "or".',
    type: [RuleConditionDto],
  })
  conditions: RuleConditionDto[];

  static fromEntity(entity: CategorizationRule): RuleDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      resultCategoryId: entity.resultCategoryId,
      order: entity.order,
      isActive: entity.isActive,
      conditionLogic: entity.conditionLogic ?? 'and',
      conditions: (entity.conditions || [])
        .map((c) => RuleConditionDto.fromEntity(c))
        .sort((a, b) => a.order - b.order),
    };
  }
}
