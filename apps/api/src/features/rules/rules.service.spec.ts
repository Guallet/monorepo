import { Test, TestingModule } from '@nestjs/testing';
import { RulesService } from './rules.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rule, RuleCondition } from './entities/rule.entity';

describe('RulesService', () => {
  let service: RulesService;

  const mockRulesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockConditionsRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
        {
          provide: getRepositoryToken(Rule),
          useValue: mockRulesRepository,
        },
        {
          provide: getRepositoryToken(RuleCondition),
          useValue: mockConditionsRepository,
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
    it('should return a creation message', () => {
      const createDto = {
        name: 'Auto-categorize groceries',
        conditions: [],
        categoryId: 'category-1',
      };

      const result = service.create(createDto);

      expect(result).toBe('This action adds a new rule');
    });
  });

  describe('findAll', () => {
    it('should return all rules for a user', async () => {
      const userId = 'user-123';
      const mockRules: Partial<Rule>[] = [
        {
          id: 'rule-1',
          user_id: userId,
          name: 'Auto-categorize groceries',
          resultCategoryId: 'category-1',
          conditions: [],
        },
        {
          id: 'rule-2',
          user_id: userId,
          name: 'Auto-categorize transportation',
          resultCategoryId: 'category-2',
          conditions: [],
        },
      ];

      mockRulesRepository.find.mockResolvedValue(mockRules);

      const result = await service.findAll({ userId });

      expect(result).toEqual(mockRules);
      expect(mockRulesRepository.find).toHaveBeenCalledWith({
        relations: ['conditions'],
        where: { user_id: userId },
      });
    });

    it('should return empty array when no rules exist', async () => {
      const userId = 'user-123';

      mockRulesRepository.find.mockResolvedValue([]);

      const result = await service.findAll({ userId });

      expect(result).toEqual([]);
    });

    it('should include conditions in the result', async () => {
      const userId = 'user-123';
      const mockConditions: Partial<RuleCondition>[] = [
        {
          id: 'condition-1',
          field: 'description',
          operator: 'contains',
          value: 'grocery',
        },
      ];

      const mockRules: Partial<Rule>[] = [
        {
          id: 'rule-1',
          user_id: userId,
          name: 'Auto-categorize groceries',
          resultCategoryId: 'category-1',
          conditions: mockConditions as RuleCondition[],
        },
      ];

      mockRulesRepository.find.mockResolvedValue(mockRules);

      const result = await service.findAll({ userId });

      expect(result[0].conditions).toBeDefined();
      expect(result[0].conditions.length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a find message', () => {
      const id = 1;

      const result = service.findOne(id);

      expect(result).toBe(`This action returns a #${id} rule`);
    });
  });

  describe('update', () => {
    it('should return an update message', () => {
      const id = 1;
      const updateDto = {
        name: 'Updated rule name',
      };

      const result = service.update(id, updateDto);

      expect(result).toBe(`This action updates a #${id} rule`);
    });
  });

  describe('remove', () => {
    it('should return a remove message', () => {
      const id = 1;

      const result = service.remove(id);

      expect(result).toBe(`This action removes a #${id} rule`);
    });
  });
});
