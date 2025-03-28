import { Rule, RuleCondition } from '../entities/rule.entity';

export class RuleDto {
  id: string;
  order: number;
  name: string;
  description: string;
  conditions: RuleConditionsDto[];
  resultCategoryId: string;

  static fromDomain(domain: Rule): RuleDto {
    return {
      id: domain.id,
      order: domain.order,
      name: domain.name,
      description: domain.description,
      conditions: domain.conditions.map((condition) =>
        RuleConditionsDto.fromDomain(condition),
      ),
      resultCategoryId: domain.resultCategoryId,
    };
  }
}

export class RuleConditionsDto {
  field: string;
  operator: string;
  value: string;

  static fromDomain(domain: RuleCondition): RuleConditionsDto {
    return {
      field: domain.field,
      operator: domain.operator,
      value: domain.value,
    };
  }
}
