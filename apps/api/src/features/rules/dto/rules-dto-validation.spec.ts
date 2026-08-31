import { validate } from 'class-validator';
import { CreateRuleDto } from './create-rule.dto.js';
import { ReorderRulesDto, ReorderConditionsDto } from './reorder-rules.dto.js';

describe('Rules DTO Validation', () => {
  describe('CreateRuleDto', () => {
    it('should reject rules with too many conditions', async () => {
      const tooManyConditions = Array.from({ length: 51 }, (_, i) => ({
        field: 'description',
        operator: 'contains',
        value: `test${i}`,
        order: i,
      }));

      const dto = new CreateRuleDto();
      dto.name = 'Test Rule';
      dto.resultCategoryId = 'category-1';
      dto.conditions = tooManyConditions;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.constraints?.arrayMaxSize)).toBe(true);
    });

    it('should accept rules with maximum allowed conditions', async () => {
      const maxConditions = Array.from({ length: 50 }, (_, i) => ({
        field: 'description',
        operator: 'contains',
        value: `test${i}`,
        order: i,
      }));

      const dto = new CreateRuleDto();
      dto.name = 'Test Rule';
      dto.resultCategoryId = 'category-1';
      dto.conditions = maxConditions;

      const errors = await validate(dto);
      // Should not have arrayMaxSize error, but may have other validation errors
      const arrayMaxSizeErrors = errors.filter(
        (e) => e.constraints?.arrayMaxSize,
      );
      expect(arrayMaxSizeErrors.length).toBe(0);
    });
  });

  describe('ReorderRulesDto', () => {
    it('should reject too many rule IDs', async () => {
      const tooManyRuleIds = Array.from(
        { length: 1001 },
        (_, i) => `rule-${i}`,
      );

      const dto = new ReorderRulesDto();
      dto.ruleIds = tooManyRuleIds;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.constraints?.arrayMaxSize)).toBe(true);
    });

    it('should accept maximum allowed rule IDs', async () => {
      const maxRuleIds = Array.from({ length: 1000 }, (_, i) => `rule-${i}`);

      const dto = new ReorderRulesDto();
      dto.ruleIds = maxRuleIds;

      const errors = await validate(dto);
      // Should not have arrayMaxSize error
      const arrayMaxSizeErrors = errors.filter(
        (e) => e.constraints?.arrayMaxSize,
      );
      expect(arrayMaxSizeErrors.length).toBe(0);
    });
  });

  describe('ReorderConditionsDto', () => {
    it('should reject too many condition IDs', async () => {
      const tooManyConditionIds = Array.from(
        { length: 51 },
        (_, i) => `cond-${i}`,
      );

      const dto = new ReorderConditionsDto();
      dto.conditionIds = tooManyConditionIds;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.constraints?.arrayMaxSize)).toBe(true);
    });

    it('should accept maximum allowed condition IDs', async () => {
      const maxConditionIds = Array.from({ length: 50 }, (_, i) => `cond-${i}`);

      const dto = new ReorderConditionsDto();
      dto.conditionIds = maxConditionIds;

      const errors = await validate(dto);
      // Should not have arrayMaxSize error
      const arrayMaxSizeErrors = errors.filter(
        (e) => e.constraints?.arrayMaxSize,
      );
      expect(arrayMaxSizeErrors.length).toBe(0);
    });
  });
});
