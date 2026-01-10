/**
 * Transaction fields available for rule conditions
 */
export const TransactionField = {
  ACCOUNT: 'account',
  DESCRIPTION: 'description',
  AMOUNT: 'amount',
  DATE: 'date',
} as const;

export type TransactionFieldType =
  (typeof TransactionField)[keyof typeof TransactionField];

/**
 * Field type definitions for validation
 */
export const FieldDataType = {
  ACCOUNT: 'account',
  STRING: 'string',
  NUMBER: 'number',
  DATETIME: 'datetime',
} as const;

export type FieldDataTypeValue =
  (typeof FieldDataType)[keyof typeof FieldDataType];

/**
 * Mapping from transaction field to its data type
 */
export const FieldToDataType: Record<TransactionFieldType, FieldDataTypeValue> =
  {
    [TransactionField.ACCOUNT]: FieldDataType.ACCOUNT,
    [TransactionField.DESCRIPTION]: FieldDataType.STRING,
    [TransactionField.AMOUNT]: FieldDataType.NUMBER,
    [TransactionField.DATE]: FieldDataType.DATETIME,
  };

/**
 * Operators for account fields
 */
export const AccountOperator = {
  IS: 'is',
  IS_NOT: 'is_not',
  IS_IN_LIST: 'is_in_list',
  IS_NOT_IN_LIST: 'is_not_in_list',
} as const;

export type AccountOperatorType =
  (typeof AccountOperator)[keyof typeof AccountOperator];

/**
 * Operators for string fields
 */
export const StringOperator = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  CONTAINS: 'contains',
} as const;

export type StringOperatorType =
  (typeof StringOperator)[keyof typeof StringOperator];

/**
 * Operators for number fields
 */
export const NumberOperator = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  GREATER_THAN_OR_EQUALS: 'greater_than_or_equals',
  LESS_THAN_OR_EQUALS: 'less_than_or_equals',
} as const;

export type NumberOperatorType =
  (typeof NumberOperator)[keyof typeof NumberOperator];

/**
 * Operators for datetime fields
 */
export const DateTimeOperator = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  BEFORE: 'before',
  AFTER: 'after',
  BETWEEN: 'between',
} as const;

export type DateTimeOperatorType =
  (typeof DateTimeOperator)[keyof typeof DateTimeOperator];

/**
 * All possible operator types
 */
export type OperatorType =
  | AccountOperatorType
  | StringOperatorType
  | NumberOperatorType
  | DateTimeOperatorType;

/**
 * Valid operators by field data type
 */
export const ValidOperatorsByDataType: Record<
  FieldDataTypeValue,
  readonly OperatorType[]
> = {
  [FieldDataType.ACCOUNT]: Object.values(AccountOperator),
  [FieldDataType.STRING]: Object.values(StringOperator),
  [FieldDataType.NUMBER]: Object.values(NumberOperator),
  [FieldDataType.DATETIME]: Object.values(DateTimeOperator),
};

/**
 * Check if an operator is valid for a given field
 */
export function isValidOperatorForField(
  field: TransactionFieldType,
  operator: string,
): boolean {
  const dataType = FieldToDataType[field];
  if (!dataType) {
    return false;
  }
  const validOperators = ValidOperatorsByDataType[dataType];
  return validOperators.includes(operator as OperatorType);
}

/**
 * Get valid operators for a given field
 */
export function getValidOperatorsForField(
  field: TransactionFieldType,
): readonly OperatorType[] {
  const dataType = FieldToDataType[field];
  if (!dataType) {
    return [];
  }
  return ValidOperatorsByDataType[dataType];
}
