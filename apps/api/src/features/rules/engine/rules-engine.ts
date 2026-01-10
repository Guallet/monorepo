import {
  evaluateAccountCondition,
  evaluateDateTimeCondition,
  evaluateNumberCondition,
  evaluateStringCondition,
} from './condition-evaluators';
import {
  AccountOperatorType,
  DateTimeOperatorType,
  FieldDataType,
  FieldToDataType,
  isValidOperatorForField,
  NumberOperatorType,
  StringOperatorType,
  TransactionField,
  TransactionFieldType,
} from './field-types';
import {
  CategorizationRule,
  RuleCondition,
  RuleEvaluationResult,
  TransactionInput,
} from './rule-types';

/**
 * Evaluate a single condition against a transaction
 */
export function evaluateCondition(
  transaction: TransactionInput,
  condition: RuleCondition,
): boolean {
  const { field, operator, value } = condition;

  // Validate operator is valid for field
  if (!isValidOperatorForField(field, operator)) {
    throw new Error(
      `Invalid operator "${operator}" for field "${field}". ` +
        `This should have been caught during rule creation/validation.`,
    );
  }

  const dataType = FieldToDataType[field];

  switch (dataType) {
    case FieldDataType.ACCOUNT:
      return evaluateAccountCondition(
        transaction.accountId,
        operator as AccountOperatorType,
        value,
      );

    case FieldDataType.STRING:
      if (field === TransactionField.DESCRIPTION) {
        return evaluateStringCondition(
          transaction.description,
          operator as StringOperatorType,
          value,
        );
      }
      return false;

    case FieldDataType.NUMBER:
      if (field === TransactionField.AMOUNT) {
        return evaluateNumberCondition(
          transaction.amount,
          operator as NumberOperatorType,
          value,
        );
      }
      return false;

    case FieldDataType.DATETIME:
      if (field === TransactionField.DATE) {
        return evaluateDateTimeCondition(
          transaction.date,
          operator as DateTimeOperatorType,
          value,
        );
      }
      return false;

    default:
      return false;
  }
}

/**
 * Evaluate a single rule against a transaction
 * All conditions must match for the rule to match
 */
export function evaluateRule(
  transaction: TransactionInput,
  rule: CategorizationRule,
): boolean {
  if (!rule.isActive) {
    return false;
  }

  if (rule.conditions.length === 0) {
    return false;
  }

  // Sort conditions by order and evaluate sequentially
  const sortedConditions = [...rule.conditions].sort(
    (a, b) => a.order - b.order,
  );

  // All conditions must match (AND logic)
  return sortedConditions.every((condition) =>
    evaluateCondition(transaction, condition),
  );
}

/**
 * Evaluate a list of rules against a transaction
 * Returns the first matching rule's category, or null if no match
 */
export function evaluateRules(
  transaction: TransactionInput,
  rules: CategorizationRule[],
): RuleEvaluationResult {
  // Sort rules by order
  const sortedRules = [...rules].sort((a, b) => a.order - b.order);

  for (const rule of sortedRules) {
    if (evaluateRule(transaction, rule)) {
      return {
        matched: true,
        categoryId: rule.resultCategoryId,
        matchedRuleId: rule.id,
      };
    }
  }

  return {
    matched: false,
    categoryId: null,
    matchedRuleId: null,
  };
}

/**
 * Validate a rule's conditions
 * Returns an array of validation errors, empty if valid
 */
export function validateRule(rule: CategorizationRule): string[] {
  const errors: string[] = [];

  if (!rule.name || rule.name.trim() === '') {
    errors.push('Rule name is required');
  }

  if (!rule.resultCategoryId) {
    errors.push('Result category is required');
  }

  if (rule.conditions.length === 0) {
    errors.push('At least one condition is required');
  }

  for (const condition of rule.conditions) {
    if (!Object.values(TransactionField).includes(condition.field)) {
      errors.push(`Invalid field "${condition.field}" in condition`);
    }

    if (!isValidOperatorForField(condition.field, condition.operator)) {
      errors.push(
        `Operator "${condition.operator}" is not valid for field "${condition.field}"`,
      );
    }

    if (condition.value === undefined || condition.value === null) {
      errors.push(`Condition value is required for field "${condition.field}"`);
    }
  }

  return errors;
}

/**
 * Get the field value from a transaction
 */
export function getTransactionFieldValue(
  transaction: TransactionInput,
  field: TransactionFieldType,
): string | number | Date | null {
  switch (field) {
    case TransactionField.ACCOUNT:
      return transaction.accountId;
    case TransactionField.DESCRIPTION:
      return transaction.description;
    case TransactionField.AMOUNT:
      return transaction.amount;
    case TransactionField.DATE:
      return transaction.date instanceof Date
        ? transaction.date
        : new Date(transaction.date);
    default:
      return null;
  }
}
