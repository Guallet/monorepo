/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { RulesService } from './rules.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  CategorizationRule,
  RuleCondition,
} from './entities/categorization-rule.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { BadRequestException } from '@nestjs/common';
import { CreateRuleDto } from './dto/create-rule.dto.js';
import { UpdateRuleDto } from './dto/update-rule.dto.js';

describe('RulesService', () => {
  let service: RulesService;

  const mockRulesRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    count: vi.fn(),
    createQueryBuilder: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      getRawOne: vi.fn(),
    })),
    update: vi.fn(),
  };

  const mockConditionsRepository = {
    find: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  };

  const mockTransactionsRepository = {
    find: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
        {
          provide: getRepositoryToken(CategorizationRule),
          useValue: mockRulesRepository,
        },
        {
          provide: getRepositoryToken(RuleCondition),
          useValue: mockConditionsRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionsRepository,
        },
      ],
    }).compile();

    service = module.get<RulesService>(RulesService);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException for too many conditions', async () => {
      const tooManyConditions = Array.from({ length: 51 }, (_, i) => ({
        field: 'description',
        operator: 'contains',
        value: `test${i}`,
        order: i,
      }));

      const dto: CreateRuleDto = {
        name: 'Test Rule',
        resultCategoryId: 'category-1',
        conditions: tooManyConditions,
      };

      await expect(service.create({ userId: 'user-1', dto })).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.create({ userId: 'user-1', dto })).rejects.toThrow(
        'Too many conditions. Maximum allowed: 50',
      );
    });

    it('should throw BadRequestException when user already has max rules', async () => {
      // Mock the repository to return MAX_RULES_PER_USER existing rules
      mockRulesRepository.count.mockResolvedValue(1000 as any);

      const dto: CreateRuleDto = {
        name: 'New Rule',
        resultCategoryId: 'category-1',
        conditions: [
          { field: 'description', operator: 'contains', value: 'x', order: 0 },
        ],
      };

      await expect(service.create({ userId: 'user-1', dto })).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.create({ userId: 'user-1', dto })).rejects.toThrow(
        'Too many rules. Maximum allowed: 1000',
      );
    });
  });

  describe('update', () => {
    it('should throw BadRequestException for too many conditions in update', async () => {
      const tooManyConditions = Array.from({ length: 51 }, (_, i) => ({
        field: 'description',
        operator: 'contains',
        value: `test${i}`,
        order: i,
      }));

      const dto: UpdateRuleDto = {
        conditions: tooManyConditions,
      };

      // Mock findOne to return an existing rule
      mockRulesRepository.findOne.mockResolvedValue({
        id: 'rule-1',
        userId: 'user-1',
        name: 'Existing Rule',
        resultCategoryId: 'category-1',
        conditions: [],
      });

      await expect(service.update('user-1', 'rule-1', dto)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.update('user-1', 'rule-1', dto)).rejects.toThrow(
        'Too many conditions. Maximum allowed: 50',
      );
    });
  });

  describe('reorderRules', () => {
    it('should throw BadRequestException for too many rule IDs', async () => {
      const tooManyRuleIds = Array.from(
        { length: 1001 },
        (_, i) => `rule-${i}`,
      );

      await expect(
        service.reorderRules('user-1', tooManyRuleIds),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.reorderRules('user-1', tooManyRuleIds),
      ).rejects.toThrow('Too many rules. Maximum allowed: 1000');
    });

    it('should throw BadRequestException for non-array input', async () => {
      await expect(service.reorderRules('user-1', null as any)).rejects.toThrow(
        BadRequestException,
      );

      await expect(
        service.reorderRules('user-1', 'not an array' as any),
      ).rejects.toThrow('Too many rules. Maximum allowed: 1000');
    });
  });

  describe('reorderConditions', () => {
    it('should throw BadRequestException for too many condition IDs', async () => {
      const tooManyConditionIds = Array.from(
        { length: 51 },
        (_, i) => `cond-${i}`,
      );

      // Mock findOne to avoid NotFoundException
      mockRulesRepository.findOne.mockResolvedValue({
        id: 'rule-1',
        userId: 'user-1',
      });

      await expect(
        service.reorderConditions('user-1', 'rule-1', tooManyConditionIds),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.reorderConditions('user-1', 'rule-1', tooManyConditionIds),
      ).rejects.toThrow('Too many conditions. Maximum allowed: 50');
    });

    it('getLimits should return constants and messages', () => {
      const limits = service.getLimits();
      expect(limits).toHaveProperty('maxConditionsPerRule');
      expect(limits).toHaveProperty('maxRulesPerUser');
      expect(limits).toHaveProperty('tooManyConditionsMessage');
      expect(limits).toHaveProperty('tooManyRulesMessage');
      expect(limits.maxConditionsPerRule).toBeGreaterThan(0);
      expect(limits.maxRulesPerUser).toBeGreaterThan(0);
      expect(typeof limits.tooManyConditionsMessage).toBe('string');
      expect(typeof limits.tooManyRulesMessage).toBe('string');
    });

    it('should throw BadRequestException for non-array input', async () => {
      // Mock findOne to avoid NotFoundException
      mockRulesRepository.findOne.mockResolvedValue({
        id: 'rule-1',
        userId: 'user-1',
      });

      await expect(
        service.reorderConditions('user-1', 'rule-1', null as any),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.reorderConditions('user-1', 'rule-1', 'not an array' as never),
      ).rejects.toThrow('Too many conditions. Maximum allowed: 50');
    });
  });
});
