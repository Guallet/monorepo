import { TransactionFieldType, OperatorType } from './field-types';

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
  resultCategoryId: string;
  order: number;
  isActive: boolean;
}

/**
 * Represents a transaction for rule evaluation
 */
export interface TransactionInput {
  id: string;
  accountId: string | null;
  description: string | null;
  amount: number;
  date: Date | string;
}

/**
 * Result of rule evaluation
 */
export interface RuleEvaluationResult {
  matched: boolean;
  categoryId: string | null;
  matchedRuleId: string | null;
}
