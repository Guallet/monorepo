import {
  TransactionField,
  FieldToDataType,
  FieldDataType,
  isValidOperatorForField,
  getValidOperatorsForField,
  AccountOperator,
  StringOperator,
  NumberOperator,
  DateTimeOperator,
} from './field-types';

describe('Field Types', () => {
  describe('TransactionField', () => {
    it('should have all expected fields', () => {
      expect(TransactionField.ACCOUNT).toBe('account');
      expect(TransactionField.DESCRIPTION).toBe('description');
      expect(TransactionField.AMOUNT).toBe('amount');
      expect(TransactionField.DATE).toBe('date');
    });
  });

  describe('FieldToDataType', () => {
    it('should map account field to account type', () => {
      expect(FieldToDataType[TransactionField.ACCOUNT]).toBe(FieldDataType.ACCOUNT);
    });

    it('should map description field to string type', () => {
      expect(FieldToDataType[TransactionField.DESCRIPTION]).toBe(FieldDataType.STRING);
    });

    it('should map amount field to number type', () => {
      expect(FieldToDataType[TransactionField.AMOUNT]).toBe(FieldDataType.NUMBER);
    });

    it('should map date field to datetime type', () => {
      expect(FieldToDataType[TransactionField.DATE]).toBe(FieldDataType.DATETIME);
    });
  });

  describe('isValidOperatorForField', () => {
    describe('account field', () => {
      it('should accept valid account operators', () => {
        expect(isValidOperatorForField(TransactionField.ACCOUNT, 'is')).toBe(true);
        expect(isValidOperatorForField(TransactionField.ACCOUNT, 'is_not')).toBe(true);
        expect(isValidOperatorForField(TransactionField.ACCOUNT, 'is_in_list')).toBe(true);
        expect(isValidOperatorForField(TransactionField.ACCOUNT, 'is_not_in_list')).toBe(true);
      });

      it('should reject invalid operators for account field', () => {
        expect(isValidOperatorForField(TransactionField.ACCOUNT, 'contains')).toBe(false);
        expect(isValidOperatorForField(TransactionField.ACCOUNT, 'greater_than')).toBe(false);
      });
    });

    describe('description field', () => {
      it('should accept valid string operators', () => {
        expect(isValidOperatorForField(TransactionField.DESCRIPTION, 'equals')).toBe(true);
        expect(isValidOperatorForField(TransactionField.DESCRIPTION, 'not_equals')).toBe(true);
        expect(isValidOperatorForField(TransactionField.DESCRIPTION, 'contains')).toBe(true);
      });

      it('should reject invalid operators for description field', () => {
        expect(isValidOperatorForField(TransactionField.DESCRIPTION, 'is')).toBe(false);
        expect(isValidOperatorForField(TransactionField.DESCRIPTION, 'greater_than')).toBe(false);
      });
    });

    describe('amount field', () => {
      it('should accept valid number operators', () => {
        expect(isValidOperatorForField(TransactionField.AMOUNT, 'equals')).toBe(true);
        expect(isValidOperatorForField(TransactionField.AMOUNT, 'not_equals')).toBe(true);
        expect(isValidOperatorForField(TransactionField.AMOUNT, 'greater_than')).toBe(true);
        expect(isValidOperatorForField(TransactionField.AMOUNT, 'less_than')).toBe(true);
        expect(isValidOperatorForField(TransactionField.AMOUNT, 'greater_than_or_equals')).toBe(true);
        expect(isValidOperatorForField(TransactionField.AMOUNT, 'less_than_or_equals')).toBe(true);
      });

      it('should reject invalid operators for amount field', () => {
        expect(isValidOperatorForField(TransactionField.AMOUNT, 'contains')).toBe(false);
        expect(isValidOperatorForField(TransactionField.AMOUNT, 'is')).toBe(false);
      });
    });

    describe('date field', () => {
      it('should accept valid datetime operators', () => {
        expect(isValidOperatorForField(TransactionField.DATE, 'equals')).toBe(true);
        expect(isValidOperatorForField(TransactionField.DATE, 'not_equals')).toBe(true);
        expect(isValidOperatorForField(TransactionField.DATE, 'before')).toBe(true);
        expect(isValidOperatorForField(TransactionField.DATE, 'after')).toBe(true);
        expect(isValidOperatorForField(TransactionField.DATE, 'between')).toBe(true);
      });

      it('should reject invalid operators for date field', () => {
        expect(isValidOperatorForField(TransactionField.DATE, 'contains')).toBe(false);
        expect(isValidOperatorForField(TransactionField.DATE, 'greater_than')).toBe(false);
      });
    });

    it('should return false for invalid field', () => {
      expect(isValidOperatorForField('invalid' as any, 'equals')).toBe(false);
    });
  });

  describe('getValidOperatorsForField', () => {
    it('should return account operators for account field', () => {
      const operators = getValidOperatorsForField(TransactionField.ACCOUNT);
      expect(operators).toContain(AccountOperator.IS);
      expect(operators).toContain(AccountOperator.IS_NOT);
      expect(operators).toContain(AccountOperator.IS_IN_LIST);
      expect(operators).toContain(AccountOperator.IS_NOT_IN_LIST);
    });

    it('should return string operators for description field', () => {
      const operators = getValidOperatorsForField(TransactionField.DESCRIPTION);
      expect(operators).toContain(StringOperator.EQUALS);
      expect(operators).toContain(StringOperator.NOT_EQUALS);
      expect(operators).toContain(StringOperator.CONTAINS);
    });

    it('should return number operators for amount field', () => {
      const operators = getValidOperatorsForField(TransactionField.AMOUNT);
      expect(operators).toContain(NumberOperator.EQUALS);
      expect(operators).toContain(NumberOperator.GREATER_THAN);
      expect(operators).toContain(NumberOperator.LESS_THAN);
    });

    it('should return datetime operators for date field', () => {
      const operators = getValidOperatorsForField(TransactionField.DATE);
      expect(operators).toContain(DateTimeOperator.EQUALS);
      expect(operators).toContain(DateTimeOperator.BEFORE);
      expect(operators).toContain(DateTimeOperator.AFTER);
      expect(operators).toContain(DateTimeOperator.BETWEEN);
    });

    it('should return empty array for invalid field', () => {
      expect(getValidOperatorsForField('invalid' as any)).toEqual([]);
    });
  });
});
