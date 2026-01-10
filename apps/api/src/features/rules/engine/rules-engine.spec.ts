import {
  evaluateCondition,
  evaluateRule,
  evaluateRules,
  validateRule,
} from './rules-engine';
import {
  TransactionField,
  StringOperator,
  NumberOperator,
  AccountOperator,
} from './field-types';
import { CategorizationRule, TransactionInput } from './rule-types';

describe('Rules Engine', () => {
  const createTransaction = (overrides: Partial<TransactionInput> = {}): TransactionInput => ({
    id: 'tx-1',
    accountId: 'account-1',
    description: "Sainsbury's London",
    amount: -50.25,
    date: new Date('2024-06-15'),
    ...overrides,
  });

  const createRule = (overrides: Partial<CategorizationRule> = {}): CategorizationRule => ({
    id: 'rule-1',
    userId: 'user-1',
    name: 'Grocery Rule',
    description: 'Categorize grocery transactions',
    conditions: [
      {
        id: 'cond-1',
        field: TransactionField.DESCRIPTION,
        operator: StringOperator.CONTAINS,
        value: "Sainsbury",
        order: 0,
      },
    ],
    resultCategoryId: 'cat-groceries',
    order: 0,
    isActive: true,
    ...overrides,
  });

  describe('evaluateCondition', () => {
    it('should evaluate string field condition', () => {
      const transaction = createTransaction();
      const condition = {
        id: 'cond-1',
        field: TransactionField.DESCRIPTION,
        operator: StringOperator.CONTAINS,
        value: 'Sainsbury',
        order: 0,
      };

      expect(evaluateCondition(transaction, condition)).toBe(true);
    });

    it('should evaluate number field condition', () => {
      const transaction = createTransaction({ amount: -100 });
      const condition = {
        id: 'cond-1',
        field: TransactionField.AMOUNT,
        operator: NumberOperator.LESS_THAN,
        value: '-50',
        order: 0,
      };

      expect(evaluateCondition(transaction, condition)).toBe(true);
    });

    it('should evaluate account field condition', () => {
      const transaction = createTransaction({ accountId: 'account-1' });
      const condition = {
        id: 'cond-1',
        field: TransactionField.ACCOUNT,
        operator: AccountOperator.IS,
        value: 'account-1',
        order: 0,
      };

      expect(evaluateCondition(transaction, condition)).toBe(true);
    });

    it('should throw error for invalid operator-field combination', () => {
      const transaction = createTransaction();
      const condition = {
        id: 'cond-1',
        field: TransactionField.DESCRIPTION,
        operator: 'greater_than' as any,
        value: 'test',
        order: 0,
      };

      expect(() => evaluateCondition(transaction, condition)).toThrow();
    });
  });

  describe('evaluateRule', () => {
    it('should return true when all conditions match', () => {
      const transaction = createTransaction();
      const rule = createRule({
        conditions: [
          {
            id: 'cond-1',
            field: TransactionField.DESCRIPTION,
            operator: StringOperator.CONTAINS,
            value: 'Sainsbury',
            order: 0,
          },
          {
            id: 'cond-2',
            field: TransactionField.AMOUNT,
            operator: NumberOperator.LESS_THAN,
            value: '0',
            order: 1,
          },
        ],
      });

      expect(evaluateRule(transaction, rule)).toBe(true);
    });

    it('should return false when any condition does not match', () => {
      const transaction = createTransaction();
      const rule = createRule({
        conditions: [
          {
            id: 'cond-1',
            field: TransactionField.DESCRIPTION,
            operator: StringOperator.CONTAINS,
            value: 'Tesco',
            order: 0,
          },
        ],
      });

      expect(evaluateRule(transaction, rule)).toBe(false);
    });

    it('should return false when rule is inactive', () => {
      const transaction = createTransaction();
      const rule = createRule({ isActive: false });

      expect(evaluateRule(transaction, rule)).toBe(false);
    });

    it('should return false when rule has no conditions', () => {
      const transaction = createTransaction();
      const rule = createRule({ conditions: [] });

      expect(evaluateRule(transaction, rule)).toBe(false);
    });
  });

  describe('evaluateRules', () => {
    it('should return first matching rule category', () => {
      const transaction = createTransaction();
      const rules: CategorizationRule[] = [
        createRule({
          id: 'rule-1',
          order: 0,
          conditions: [
            {
              id: 'cond-1',
              field: TransactionField.DESCRIPTION,
              operator: StringOperator.CONTAINS,
              value: 'Tesco',
              order: 0,
            },
          ],
          resultCategoryId: 'cat-tesco',
        }),
        createRule({
          id: 'rule-2',
          order: 1,
          conditions: [
            {
              id: 'cond-1',
              field: TransactionField.DESCRIPTION,
              operator: StringOperator.CONTAINS,
              value: 'Sainsbury',
              order: 0,
            },
          ],
          resultCategoryId: 'cat-sainsbury',
        }),
      ];

      const result = evaluateRules(transaction, rules);

      expect(result.matched).toBe(true);
      expect(result.categoryId).toBe('cat-sainsbury');
      expect(result.matchedRuleId).toBe('rule-2');
    });

    it('should respect rule order', () => {
      const transaction = createTransaction({ description: 'Sainsbury Tesco' });
      const rules: CategorizationRule[] = [
        createRule({
          id: 'rule-1',
          order: 1,
          conditions: [
            {
              id: 'cond-1',
              field: TransactionField.DESCRIPTION,
              operator: StringOperator.CONTAINS,
              value: 'Sainsbury',
              order: 0,
            },
          ],
          resultCategoryId: 'cat-sainsbury',
        }),
        createRule({
          id: 'rule-2',
          order: 0,
          conditions: [
            {
              id: 'cond-1',
              field: TransactionField.DESCRIPTION,
              operator: StringOperator.CONTAINS,
              value: 'Tesco',
              order: 0,
            },
          ],
          resultCategoryId: 'cat-tesco',
        }),
      ];

      const result = evaluateRules(transaction, rules);

      // Tesco rule has lower order, so it should match first
      expect(result.categoryId).toBe('cat-tesco');
      expect(result.matchedRuleId).toBe('rule-2');
    });

    it('should return null when no rules match', () => {
      const transaction = createTransaction({ description: 'Amazon' });
      const rules: CategorizationRule[] = [
        createRule({
          conditions: [
            {
              id: 'cond-1',
              field: TransactionField.DESCRIPTION,
              operator: StringOperator.CONTAINS,
              value: 'Sainsbury',
              order: 0,
            },
          ],
        }),
      ];

      const result = evaluateRules(transaction, rules);

      expect(result.matched).toBe(false);
      expect(result.categoryId).toBeNull();
      expect(result.matchedRuleId).toBeNull();
    });

    it('should return null when rules array is empty', () => {
      const transaction = createTransaction();
      const result = evaluateRules(transaction, []);

      expect(result.matched).toBe(false);
      expect(result.categoryId).toBeNull();
    });
  });

  describe('validateRule', () => {
    it('should return empty array for valid rule', () => {
      const rule = createRule();
      expect(validateRule(rule)).toEqual([]);
    });

    it('should return error for missing name', () => {
      const rule = createRule({ name: '' });
      const errors = validateRule(rule);
      expect(errors).toContain('Rule name is required');
    });

    it('should return error for missing result category', () => {
      const rule = createRule({ resultCategoryId: '' as any });
      const errors = validateRule(rule);
      expect(errors).toContain('Result category is required');
    });

    it('should return error for empty conditions', () => {
      const rule = createRule({ conditions: [] });
      const errors = validateRule(rule);
      expect(errors).toContain('At least one condition is required');
    });

    it('should return error for invalid field', () => {
      const rule = createRule({
        conditions: [
          {
            id: 'cond-1',
            field: 'invalid' as any,
            operator: StringOperator.CONTAINS,
            value: 'test',
            order: 0,
          },
        ],
      });
      const errors = validateRule(rule);
      expect(errors.some((e) => e.includes('Invalid field'))).toBe(true);
    });

    it('should return error for invalid operator-field combination', () => {
      const rule = createRule({
        conditions: [
          {
            id: 'cond-1',
            field: TransactionField.DESCRIPTION,
            operator: 'greater_than' as any,
            value: 'test',
            order: 0,
          },
        ],
      });
      const errors = validateRule(rule);
      expect(errors.some((e) => e.includes('not valid for field'))).toBe(true);
    });
  });
});
