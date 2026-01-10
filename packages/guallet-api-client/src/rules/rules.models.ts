export interface RuleConditionDto {
  id: string;
  field: string;
  operator: string;
  value: string;
  order: number;
}

export interface RuleDto {
  id: string;
  name: string;
  description: string | null;
  resultCategoryId: string;
  order: number;
  isActive: boolean;
  conditionLogic: "and" | "or";
  conditions: RuleConditionDto[];
}

export interface CreateConditionRequest {
  field: string;
  operator: string;
  value: string;
  order?: number;
}

export interface CreateRuleRequest {
  name: string;
  description?: string;
  resultCategoryId: string;
  conditions: CreateConditionRequest[];
  conditionLogic?: "and" | "or";
  order?: number;
  isActive?: boolean;
}

export interface UpdateRuleRequest {
  name?: string;
  description?: string;
  resultCategoryId?: string;
  conditions?: CreateConditionRequest[];
  conditionLogic?: "and" | "or";
  order?: number;
  isActive?: boolean;
}

export interface FieldOperator {
  value: string;
  label: string;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  operators: FieldOperator[];
}

export interface FieldDefinitionsResponse {
  fields: FieldDefinition[];
}

export interface EvaluationResult {
  matched: boolean;
  categoryId: string | null;
  matchedRuleId: string | null;
}

export interface ReorderRulesRequest {
  ruleIds: string[];
}

export interface ReorderConditionsRequest {
  conditionIds: string[];
}
