import { Test, TestingModule } from '@nestjs/testing';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { Rule } from './entities/rule.entity';

describe('RulesController', () => {
  let controller: RulesController;

  const mockRulesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [
        {
          provide: RulesService,
          useValue: mockRulesService,
        },
      ],
    }).compile();

    controller = module.get<RulesController>(RulesController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new rule', async () => {
      const createDto = {
        name: 'Auto-categorize groceries',
        conditions: [],
        categoryId: 'category-1',
      };

      const mockResult = 'This action adds a new rule';

      mockRulesService.create.mockReturnValue(mockResult);

      const result = await controller.create(createDto);

      expect(result).toBe(mockResult);
      expect(mockRulesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all rules for a user', async () => {
      const mockRules: Partial<Rule>[] = [
        {
          id: 'rule-1',
          user_id: mockUser.id,
          name: 'Auto-categorize groceries',
          resultCategoryId: 'category-1',
          conditions: [],
        },
        {
          id: 'rule-2',
          user_id: mockUser.id,
          name: 'Auto-categorize transportation',
          resultCategoryId: 'category-2',
          conditions: [],
        },
      ];

      mockRulesService.findAll.mockResolvedValue(mockRules);

      const result = await controller.findAll(mockUser);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(mockRulesService.findAll).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should return empty array when no rules exist', async () => {
      mockRulesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific rule', async () => {
      const ruleId = '1';
      const mockResult = `This action returns a #${ruleId} rule`;

      mockRulesService.findOne.mockReturnValue(mockResult);

      const result = await controller.findOne(ruleId);

      expect(result).toBe(mockResult);
      expect(mockRulesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a rule', async () => {
      const ruleId = '1';
      const updateDto = {
        name: 'Updated rule name',
      };

      const mockResult = `This action updates a #${ruleId} rule`;

      mockRulesService.update.mockReturnValue(mockResult);

      const result = await controller.update(ruleId, updateDto);

      expect(result).toBe(mockResult);
      expect(mockRulesService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a rule', async () => {
      const ruleId = '1';
      const mockResult = `This action removes a #${ruleId} rule`;

      mockRulesService.remove.mockReturnValue(mockResult);

      const result = await controller.remove(ruleId);

      expect(result).toBe(mockResult);
      expect(mockRulesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
