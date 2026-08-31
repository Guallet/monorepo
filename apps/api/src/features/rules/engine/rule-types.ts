import { TransactionFieldType, OperatorType } from './field-types.js';

/**
 * Logic type for combining conditions within a rule
 */
export const ConditionLogic = {
  AND: 'and',
  OR: 'or',
} as const;

export type ConditionLogicType =
  (typeof ConditionLogic)[keyof typeof ConditionLogic];

/**
 * Represents a single condition within a rule
 */
export interface RuleCondition {
  id: string;
  field: TransactionFieldType;
  operator: OperatorType;
  value: string;
  order: number;
}

/**
 * Represents a complete categorization rule
 */
export interface CategorizationRule {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  conditions: RuleCondition[];
  conditionLogic: ConditionLogicType;
  resultCategoryId: string;
  order: number;
  isActive: boolean;
}

/**
 * Result of rule evaluation
 */
export interface RuleEvaluationResult {
  categoryId: string | null;
  matchedRuleId: string | null;
}
