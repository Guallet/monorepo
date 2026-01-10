import { Test, TestingModule } from '@nestjs/testing';
import { SavingGoalsController } from './saving-goals.controller';
import { SavingGoalsService } from './saving-goals.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { SavingGoal } from './entities/saving-goal.entity';

describe('SavingGoalsController', () => {
  let controller: SavingGoalsController;

  const mockSavingGoalsService = {
    create: jest.fn(),
    findAllUserSavingGoals: jest.fn(),
    findByIdForUser: jest.fn(),
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
      controllers: [SavingGoalsController],
      providers: [
        {
          provide: SavingGoalsService,
          useValue: mockSavingGoalsService,
        },
      ],
    }).compile();

    controller = module.get<SavingGoalsController>(SavingGoalsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new saving goal', async () => {
      const createDto = {
        name: 'Vacation',
        description: 'Summer vacation fund',
        targetAmount: 5000,
        targetDate: new Date('2025-06-01'),
        accounts: ['account-1'],
        priority: 1,
      };

      const mockGoal: Partial<SavingGoal> = {
        id: 'goal-1',
        userId: mockUser.id,
        name: createDto.name,
        description: createDto.description,
        target_amount: createDto.targetAmount,
        target_date: createDto.targetDate,
      };

      mockSavingGoalsService.create.mockResolvedValue(mockGoal);

      const result = await controller.create(mockUser, createDto);

      expect(result).toBeDefined();
      expect(mockSavingGoalsService.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        request: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all user saving goals', async () => {
      const mockGoals: Partial<SavingGoal>[] = [
        {
          id: 'goal-1',
          userId: mockUser.id,
          name: 'Vacation',
          target_amount: 5000,
        },
        {
          id: 'goal-2',
          userId: mockUser.id,
          name: 'Emergency Fund',
          target_amount: 10000,
        },
      ];

      mockSavingGoalsService.findAllUserSavingGoals.mockResolvedValue(
        mockGoals,
      );

      const result = await controller.findAll(mockUser);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(
        mockSavingGoalsService.findAllUserSavingGoals,
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should return empty array when no goals exist', async () => {
      mockSavingGoalsService.findAllUserSavingGoals.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific saving goal', async () => {
      const goalId = 'goal-1';
      const mockGoal: Partial<SavingGoal> = {
        id: goalId,
        userId: mockUser.id,
        name: 'Vacation',
        target_amount: 5000,
      };

      mockSavingGoalsService.findByIdForUser.mockResolvedValue(mockGoal);

      const result = await controller.findOne(mockUser, goalId);

      expect(result).toBeDefined();
      expect(mockSavingGoalsService.findByIdForUser).toHaveBeenCalledWith({
        id: goalId,
        userId: mockUser.id,
      });
    });
  });

  describe('update', () => {
    it('should update a saving goal', async () => {
      const goalId = 'goal-1';
      const updateDto = {
        name: 'Updated Vacation',
        targetAmount: 6000,
      };

      const mockGoal: Partial<SavingGoal> = {
        id: goalId,
        userId: mockUser.id,
        name: updateDto.name,
        target_amount: updateDto.targetAmount,
      };

      mockSavingGoalsService.update.mockResolvedValue(mockGoal);

      const result = await controller.update(mockUser, goalId, updateDto);

      expect(result).toBeDefined();
      expect(mockSavingGoalsService.update).toHaveBeenCalledWith({
        userId: mockUser.id,
        savingGoalId: goalId,
        request: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a saving goal', async () => {
      const goalId = 'goal-1';
      const mockGoal: Partial<SavingGoal> = {
        id: goalId,
        userId: mockUser.id,
        name: 'Vacation',
      };

      mockSavingGoalsService.remove.mockResolvedValue(mockGoal);

      const result = await controller.remove(mockUser, goalId);

      expect(result).toBeDefined();
      expect(mockSavingGoalsService.remove).toHaveBeenCalledWith({
        userId: mockUser.id,
        id: goalId,
      });
    });
  });
});
