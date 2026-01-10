import { Test, TestingModule } from '@nestjs/testing';
import { SavingGoalsService } from './saving-goals.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SavingGoal } from './entities/saving-goal.entity';
import { NotFoundException } from '@nestjs/common';

describe('SavingGoalsService', () => {
  let service: SavingGoalsService;

  const mockSavingGoalRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingGoalsService,
        {
          provide: getRepositoryToken(SavingGoal),
          useValue: mockSavingGoalRepository,
        },
      ],
    }).compile();

    service = module.get<SavingGoalsService>(SavingGoalsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new saving goal', async () => {
      const createData = {
        userId: 'user-123',
        request: {
          name: 'Vacation',
          description: 'Summer vacation fund',
          targetAmount: 5000,
          targetDate: new Date('2025-06-01'),
          accounts: ['account-1'],
          priority: 1,
        },
      };

      const mockGoal: Partial<SavingGoal> = {
        id: 'goal-1',
        userId: createData.userId,
        name: createData.request.name,
        description: createData.request.description,
        target_amount: createData.request.targetAmount,
      };

      mockSavingGoalRepository.create.mockReturnValue(mockGoal);
      mockSavingGoalRepository.save.mockResolvedValue(mockGoal);

      const result = await service.create(createData);

      expect(result).toEqual(mockGoal);
      expect(mockSavingGoalRepository.create).toHaveBeenCalled();
      expect(mockSavingGoalRepository.save).toHaveBeenCalledWith(mockGoal);
    });
  });

  describe('findAllUserSavingGoals', () => {
    it('should return all saving goals for a user', async () => {
      const userId = 'user-123';
      const mockGoals: Partial<SavingGoal>[] = [
        {
          id: 'goal-1',
          userId: userId,
          name: 'Vacation',
          target_amount: 5000,
        },
        {
          id: 'goal-2',
          userId: userId,
          name: 'Emergency Fund',
          target_amount: 10000,
        },
      ];

      mockSavingGoalRepository.find.mockResolvedValue(mockGoals);

      const result = await service.findAllUserSavingGoals({ userId });

      expect(result).toEqual(mockGoals);
      expect(mockSavingGoalRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return empty array when no goals exist', async () => {
      const userId = 'user-123';

      mockSavingGoalRepository.find.mockResolvedValue([]);

      const result = await service.findAllUserSavingGoals({ userId });

      expect(result).toEqual([]);
    });
  });

  describe('findByIdForUser', () => {
    it('should return a specific saving goal', async () => {
      const goalId = 'goal-1';
      const userId = 'user-123';
      const mockGoal: Partial<SavingGoal> = {
        id: goalId,
        userId: userId,
        name: 'Vacation',
        target_amount: 5000,
      };

      mockSavingGoalRepository.findOne.mockResolvedValue(mockGoal);

      const result = await service.findByIdForUser({ id: goalId, userId });

      expect(result).toEqual(mockGoal);
      expect(mockSavingGoalRepository.findOne).toHaveBeenCalledWith({
        where: { id: goalId, userId: userId },
      });
    });

    it('should throw NotFoundException when goal not found', async () => {
      const goalId = 'non-existent';
      const userId = 'user-123';

      mockSavingGoalRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByIdForUser({ id: goalId, userId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a saving goal by id', async () => {
      const goalId = 'goal-1';
      const mockGoal: Partial<SavingGoal> = {
        id: goalId,
        name: 'Vacation',
      };

      mockSavingGoalRepository.findOne.mockResolvedValue(mockGoal);

      const result = await service.findById(goalId);

      expect(result).toEqual(mockGoal);
      expect(mockSavingGoalRepository.findOne).toHaveBeenCalledWith({
        where: { id: goalId },
      });
    });

    it('should throw NotFoundException when goal not found', async () => {
      const goalId = 'non-existent';

      mockSavingGoalRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(goalId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a saving goal', async () => {
      const updateData = {
        userId: 'user-123',
        savingGoalId: 'goal-1',
        request: {
          name: 'Updated Vacation',
          targetAmount: 6000,
        },
      };

      const existingGoal: Partial<SavingGoal> = {
        id: updateData.savingGoalId,
        userId: updateData.userId,
        name: 'Vacation',
        target_amount: 5000,
      };

      const updatedGoal: Partial<SavingGoal> = {
        ...existingGoal,
        name: updateData.request.name,
        target_amount: updateData.request.targetAmount,
      };

      mockSavingGoalRepository.findOne.mockResolvedValue(existingGoal);
      mockSavingGoalRepository.merge.mockReturnValue(updatedGoal);
      mockSavingGoalRepository.save.mockResolvedValue(updatedGoal);

      const result = await service.update(updateData);

      expect(result).toEqual(updatedGoal);
      expect(mockSavingGoalRepository.merge).toHaveBeenCalledWith(
        existingGoal,
        updateData.request,
      );
      expect(mockSavingGoalRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when goal not found', async () => {
      const updateData = {
        userId: 'user-123',
        savingGoalId: 'non-existent',
        request: {
          name: 'Updated',
        },
      };

      mockSavingGoalRepository.findOne.mockResolvedValue(null);

      await expect(service.update(updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a saving goal', async () => {
      const removeData = {
        userId: 'user-123',
        id: 'goal-1',
      };

      const mockGoal: Partial<SavingGoal> = {
        id: removeData.id,
        userId: removeData.userId,
        name: 'Vacation',
      };

      mockSavingGoalRepository.findOne.mockResolvedValue(mockGoal);
      mockSavingGoalRepository.remove.mockResolvedValue(mockGoal);

      const result = await service.remove(removeData);

      expect(result).toEqual(mockGoal);
      expect(mockSavingGoalRepository.remove).toHaveBeenCalledWith(mockGoal);
    });

    it('should throw NotFoundException when goal not found', async () => {
      const removeData = {
        userId: 'user-123',
        id: 'non-existent',
      };

      mockSavingGoalRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(removeData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
