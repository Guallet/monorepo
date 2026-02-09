import {
  evaluateAccountCondition,
  evaluateStringCondition,
  evaluateNumberCondition,
  evaluateDateTimeCondition,
} from './condition-evaluators';
import {
  AccountOperator,
  StringOperator,
  NumberOperator,
  DateTimeOperator,
} from './field-types';

describe('Condition Evaluators', () => {
  describe('evaluateAccountCondition', () => {
    const accountId = 'account-123';

    describe('is operator', () => {
      it('should return true when account matches', () => {
        expect(
          evaluateAccountCondition(
            accountId,
            AccountOperator.IS,
            'account-123',
          ),
        ).toBe(true);
      });

      it('should return false when account does not match', () => {
        expect(
          evaluateAccountCondition(
            accountId,
            AccountOperator.IS,
            'account-456',
          ),
        ).toBe(false);
      });
    });

    describe('is_not operator', () => {
      it('should return true when account does not match', () => {
        expect(
          evaluateAccountCondition(
            accountId,
            AccountOperator.IS_NOT,
            'account-456',
          ),
        ).toBe(true);
      });

      it('should return false when account matches', () => {
        expect(
          evaluateAccountCondition(
            accountId,
            AccountOperator.IS_NOT,
            'account-123',
          ),
        ).toBe(false);
      });
    });

    describe('is_in_list operator', () => {
      it('should return true when account is in list', () => {
        expect(
          evaluateAccountCondition(
            accountId,
            AccountOperator.IS_IN_LIST,
            'account-123,account-456',
          ),
        ).toBe(true);
      });

      it('should return false when account is not in list', () => {
        expect(
          evaluateAccountCondition(
            accountId,
            AccountOperator.IS_IN_LIST,
            'account-456,account-789',
          ),
        ).toBe(false);
      });

      it('should handle whitespace in list', () => {
        expect(
          evaluateAccountCondition(
            accountId,
            AccountOperator.IS_IN_LIST,
            'account-123, account-456',
          ),
        ).toBe(true);
      });
    });

    describe('is_not_in_list operator', () => {
      it('should return true when account is not in list', () => {
        expect(
          evaluateAccountCondition(
            accountId,
            AccountOperator.IS_NOT_IN_LIST,
            'account-456,account-789',
          ),
        ).toBe(true);
      });

      it('should return false when account is in list', () => {
        expect(
          evaluateAccountCondition(
            accountId,
            AccountOperator.IS_NOT_IN_LIST,
            'account-123,account-456',
          ),
        ).toBe(false);
      });
    });

    it('should return false for null accountId', () => {
      expect(
        evaluateAccountCondition(null, AccountOperator.IS, 'account-123'),
      ).toBe(false);
    });

    it('should return false for undefined accountId', () => {
      expect(
        evaluateAccountCondition(undefined, AccountOperator.IS, 'account-123'),
      ).toBe(false);
    });
  });

  describe('evaluateStringCondition', () => {
    const description = "Sainsbury's London Store";

    describe('equals operator', () => {
      it('should return true for exact match (case insensitive)', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.EQUALS,
            "SAINSBURY'S LONDON STORE",
          ),
        ).toBe(true);
      });

      it('should return false for partial match', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.EQUALS,
            "Sainsbury's",
          ),
        ).toBe(false);
      });
    });

    describe('not_equals operator', () => {
      it('should return true when strings do not match', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.NOT_EQUALS,
            'Tesco',
          ),
        ).toBe(true);
      });

      it('should return false when strings match', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.NOT_EQUALS,
            "sainsbury's london store",
          ),
        ).toBe(false);
      });
    });

    describe('contains operator', () => {
      it('should return true when value is contained', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.CONTAINS,
            'sainsbury',
          ),
        ).toBe(true);
      });

      it('should return true when value is contained (case insensitive)', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.CONTAINS,
            'LONDON',
          ),
        ).toBe(true);
      });

      it('should return false when value is not contained', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.CONTAINS,
            'Tesco',
          ),
        ).toBe(false);
      });
    });

    describe('matches operator (regex)', () => {
      it('should return true when regex pattern matches', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.MATCHES,
            "Sainsbury's.*Store",
          ),
        ).toBe(true);
      });

      it('should return true for case insensitive regex match', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.MATCHES,
            'sainsbury',
          ),
        ).toBe(true);
      });

      it('should return false when regex does not match', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.MATCHES,
            '^Tesco',
          ),
        ).toBe(false);
      });

      it('should return false for invalid regex pattern', () => {
        expect(
          evaluateStringCondition(
            description,
            StringOperator.MATCHES,
            '[invalid(regex',
          ),
        ).toBe(false);
      });

      it('should match using regex special characters', () => {
        expect(
          evaluateStringCondition(
            'Order #12345',
            StringOperator.MATCHES,
            String.raw`#\d+`,
          ),
        ).toBe(true);
      });
    });

    it('should return false for null fieldValue', () => {
      expect(
        evaluateStringCondition(null, StringOperator.CONTAINS, 'test'),
      ).toBe(false);
    });

    it('should return false for undefined fieldValue', () => {
      expect(
        evaluateStringCondition(undefined, StringOperator.CONTAINS, 'test'),
      ).toBe(false);
    });
  });

  describe('evaluateNumberCondition', () => {
    const amount = 50.25;

    describe('equals operator', () => {
      it('should return true for equal values', () => {
        expect(
          evaluateNumberCondition(amount, NumberOperator.EQUALS, '50.25'),
        ).toBe(true);
      });

      it('should return false for different values', () => {
        expect(
          evaluateNumberCondition(amount, NumberOperator.EQUALS, '100'),
        ).toBe(false);
      });
    });

    describe('not_equals operator', () => {
      it('should return true for different values', () => {
        expect(
          evaluateNumberCondition(amount, NumberOperator.NOT_EQUALS, '100'),
        ).toBe(true);
      });

      it('should return false for equal values', () => {
        expect(
          evaluateNumberCondition(amount, NumberOperator.NOT_EQUALS, '50.25'),
        ).toBe(false);
      });
    });

    describe('greater_than operator', () => {
      it('should return true when field is greater', () => {
        expect(
          evaluateNumberCondition(amount, NumberOperator.GREATER_THAN, '50'),
        ).toBe(true);
      });

      it('should return false when field is less or equal', () => {
        expect(
          evaluateNumberCondition(amount, NumberOperator.GREATER_THAN, '50.25'),
        ).toBe(false);
        expect(
          evaluateNumberCondition(amount, NumberOperator.GREATER_THAN, '100'),
        ).toBe(false);
      });
    });

    describe('less_than operator', () => {
      it('should return true when field is less', () => {
        expect(
          evaluateNumberCondition(amount, NumberOperator.LESS_THAN, '100'),
        ).toBe(true);
      });

      it('should return false when field is greater or equal', () => {
        expect(
          evaluateNumberCondition(amount, NumberOperator.LESS_THAN, '50.25'),
        ).toBe(false);
        expect(
          evaluateNumberCondition(amount, NumberOperator.LESS_THAN, '25'),
        ).toBe(false);
      });
    });

    describe('greater_than_or_equals operator', () => {
      it('should return true when field is greater', () => {
        expect(
          evaluateNumberCondition(
            amount,
            NumberOperator.GREATER_THAN_OR_EQUALS,
            '50',
          ),
        ).toBe(true);
      });

      it('should return true when field is equal', () => {
        expect(
          evaluateNumberCondition(
            amount,
            NumberOperator.GREATER_THAN_OR_EQUALS,
            '50.25',
          ),
        ).toBe(true);
      });

      it('should return false when field is less', () => {
        expect(
          evaluateNumberCondition(
            amount,
            NumberOperator.GREATER_THAN_OR_EQUALS,
            '100',
          ),
        ).toBe(false);
      });
    });

    describe('less_than_or_equals operator', () => {
      it('should return true when field is less', () => {
        expect(
          evaluateNumberCondition(
            amount,
            NumberOperator.LESS_THAN_OR_EQUALS,
            '100',
          ),
        ).toBe(true);
      });

      it('should return true when field is equal', () => {
        expect(
          evaluateNumberCondition(
            amount,
            NumberOperator.LESS_THAN_OR_EQUALS,
            '50.25',
          ),
        ).toBe(true);
      });

      it('should return false when field is greater', () => {
        expect(
          evaluateNumberCondition(
            amount,
            NumberOperator.LESS_THAN_OR_EQUALS,
            '25',
          ),
        ).toBe(false);
      });
    });

    it('should return false for null fieldValue', () => {
      expect(evaluateNumberCondition(null, NumberOperator.EQUALS, '100')).toBe(
        false,
      );
    });

    it('should return false for invalid value string', () => {
      expect(
        evaluateNumberCondition(50, NumberOperator.EQUALS, 'not-a-number'),
      ).toBe(false);
    });
  });

  describe('evaluateDateTimeCondition', () => {
    const date = new Date('2024-06-15');

    describe('equals operator', () => {
      it('should return true for same date', () => {
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.EQUALS,
            '2024-06-15',
          ),
        ).toBe(true);
      });

      it('should return false for different date', () => {
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.EQUALS,
            '2024-06-16',
          ),
        ).toBe(false);
      });
    });

    describe('not_equals operator', () => {
      it('should return true for different date', () => {
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.NOT_EQUALS,
            '2024-06-16',
          ),
        ).toBe(true);
      });

      it('should return false for same date', () => {
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.NOT_EQUALS,
            '2024-06-15',
          ),
        ).toBe(false);
      });
    });

    describe('before operator', () => {
      it('should return true when date is before', () => {
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.BEFORE,
            '2024-06-16',
          ),
        ).toBe(true);
      });

      it('should return false when date is after or equal', () => {
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.BEFORE,
            '2024-06-15',
          ),
        ).toBe(false);
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.BEFORE,
            '2024-06-14',
          ),
        ).toBe(false);
      });
    });

    describe('after operator', () => {
      it('should return true when date is after', () => {
        expect(
          evaluateDateTimeCondition(date, DateTimeOperator.AFTER, '2024-06-14'),
        ).toBe(true);
      });

      it('should return false when date is before or equal', () => {
        expect(
          evaluateDateTimeCondition(date, DateTimeOperator.AFTER, '2024-06-15'),
        ).toBe(false);
        expect(
          evaluateDateTimeCondition(date, DateTimeOperator.AFTER, '2024-06-16'),
        ).toBe(false);
      });
    });

    describe('between operator', () => {
      it('should return true when date is between start and end', () => {
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.BETWEEN,
            '2024-06-01,2024-06-30',
          ),
        ).toBe(true);
      });

      it('should return true when date equals start', () => {
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.BETWEEN,
            '2024-06-15,2024-06-30',
          ),
        ).toBe(true);
      });

      it('should return true when date equals end', () => {
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.BETWEEN,
            '2024-06-01,2024-06-15',
          ),
        ).toBe(true);
      });

      it('should return false when date is outside range', () => {
        expect(
          evaluateDateTimeCondition(
            date,
            DateTimeOperator.BETWEEN,
            '2024-07-01,2024-07-31',
          ),
        ).toBe(false);
      });
    });

    it('should handle string date input', () => {
      expect(
        evaluateDateTimeCondition(
          '2024-06-15',
          DateTimeOperator.EQUALS,
          '2024-06-15',
        ),
      ).toBe(true);
    });

    it('should return false for null fieldValue', () => {
      expect(
        evaluateDateTimeCondition(null, DateTimeOperator.EQUALS, '2024-06-15'),
      ).toBe(false);
    });

    it('should return false for invalid date string', () => {
      expect(
        evaluateDateTimeCondition(date, DateTimeOperator.EQUALS, 'not-a-date'),
      ).toBe(false);
    });
  });
});
