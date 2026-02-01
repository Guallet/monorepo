export interface RuleDto {
  id: string;
  order: number;
  name: string;
  description: string;
  conditions: RuleConditionsDto[];
  resultCategoryId: string;
}

export interface RuleConditionsDto {
  field: string;
  operator: string;
  value: string;
}

export interface CreateRuleRequest {
  name: string;
  description: string;
  conditions: RuleConditionsDto[];
  resultCategoryId: string;
}

export interface UpdateRuleRequest {
  name?: string;
  description?: string;
  conditions?: RuleConditionsDto[];
  resultCategoryId?: string;
  order?: number;
}
