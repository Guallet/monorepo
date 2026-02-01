import { Test, TestingModule } from '@nestjs/testing';
import { RulesService } from './rules.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  CategorizationRule,
  RuleCondition,
} from './entities/categorization-rule.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { BadRequestException } from '@nestjs/common';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

describe('RulesService', () => {
  let service: RulesService;

  const mockRulesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    })),
    update: jest.fn(),
  };

  const mockConditionsRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockTransactionsRepository = {
    find: jest.fn(),
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
    jest.clearAllMocks();
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
        service.reorderConditions('user-1', 'rule-1', 'not an array' as any),
      ).rejects.toThrow('Too many conditions. Maximum allowed: 50');
    });
  });
});
