import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsService } from './budgets.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';

describe('BudgetsService', () => {
  let service: BudgetsService;

  const mockBudgetRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockTransactionRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        {
          provide: getRepositoryToken(Budget),
          useValue: mockBudgetRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllForUser', () => {
    it('should return all budgets for a user', async () => {
      const userId = 'user-123';
      const mockBudgets = [
        {
          id: 'budget-1',
          user_id: userId,
          name: 'Food Budget',
          amount: 500,
          currency: 'GBP',
          categories: [],
        },
        {
          id: 'budget-2',
          user_id: userId,
          name: 'Transport Budget',
          amount: 200,
          currency: 'GBP',
          categories: [],
        },
      ];

      mockBudgetRepository.find.mockResolvedValue(mockBudgets);

      const result = await service.findAllForUser(userId);

      expect(result).toEqual(mockBudgets);
      expect(mockBudgetRepository.find).toHaveBeenCalledWith({
        relations: { categories: true },
        where: { user_id: userId },
      });
    });

    it('should return empty array when user has no budgets', async () => {
      const userId = 'user-123';
      mockBudgetRepository.find.mockResolvedValue([]);

      const result = await service.findAllForUser(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findOneForUser', () => {
    it('should return a specific budget for a user', async () => {
      const userId = 'user-123';
      const budgetId = 'budget-1';
      const mockBudget = {
        id: budgetId,
        user_id: userId,
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
        categories: [],
      };

      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);

      const result = await service.findOneForUser({ userId, id: budgetId });

      expect(result).toEqual(mockBudget);
      expect(mockBudgetRepository.findOne).toHaveBeenCalledWith({
        relations: { categories: true },
        where: { id: budgetId, user_id: userId },
      });
    });

    it('should throw NotFoundException when budget not found', async () => {
      const userId = 'user-123';
      const budgetId = 'non-existent';

      mockBudgetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneForUser({ userId, id: budgetId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBudgetTransactions', () => {
    it('should return transactions for a budget', async () => {
      const userId = 'user-123';
      const budgetId = 'budget-1';
      const dateRange = { month: 5, year: 2024 };

      const mockBudget = {
        id: budgetId,
        user_id: userId,
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
        categories: [{ id: 'cat-1' }, { id: 'cat-2' }],
      };

      const mockTransactions = [
        {
          id: 'tx-1',
          amount: -50,
          currency: 'GBP',
          description: 'Grocery',
          categoryId: 'cat-1',
        },
        {
          id: 'tx-2',
          amount: -30,
          currency: 'GBP',
          description: 'Restaurant',
          categoryId: 'cat-2',
        },
      ];

      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getBudgetTransactions({
        userId,
        budgetId,
        dateRange,
      });

      expect(result).toEqual(mockTransactions);
      expect(mockBudgetRepository.findOne).toHaveBeenCalled();
      expect(mockTransactionRepository.find).toHaveBeenCalled();
    });

    it('should throw NotFoundException when budget not found', async () => {
      const userId = 'user-123';
      const budgetId = 'non-existent';
      const dateRange = { month: 5, year: 2024 };

      mockBudgetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getBudgetTransactions({ userId, budgetId, dateRange }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException when budget has no categories', async () => {
      const userId = 'user-123';
      const budgetId = 'budget-1';
      const dateRange = { month: 5, year: 2024 };

      const mockBudget = {
        id: budgetId,
        user_id: userId,
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
        categories: [],
      };

      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);

      await expect(
        service.getBudgetTransactions({ userId, budgetId, dateRange }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getMonthlySpending', () => {
    it('should calculate total spending for a budget', async () => {
      const userId = 'user-123';
      const budgetId = 'budget-1';
      const dateRange = { month: 5, year: 2024 };

      const mockBudget = {
        id: budgetId,
        user_id: userId,
        categories: [{ id: 'cat-1' }],
      };

      const mockTransactions = [
        { id: 'tx-1', amount: -50 },
        { id: 'tx-2', amount: -30 },
        { id: 'tx-3', amount: -20 },
      ];

      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getMonthlySpending({
        userId,
        budgetId,
        dateRange,
      });

      expect(result).toBe(-100);
    });

    it('should return 0 when no transactions found', async () => {
      const userId = 'user-123';
      const budgetId = 'budget-1';
      const dateRange = { month: 5, year: 2024 };

      const mockBudget = {
        id: budgetId,
        user_id: userId,
        categories: [{ id: 'cat-1' }],
      };

      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);
      mockTransactionRepository.find.mockResolvedValue([]);

      const result = await service.getMonthlySpending({
        userId,
        budgetId,
        dateRange,
      });

      expect(result).toBe(0);
    });
  });

  describe('createBudgetForUser', () => {
    it('should create a new budget', async () => {
      const userId = 'user-123';
      const createBudgetDto: CreateBudgetDto = {
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
        categories: ['cat-1', 'cat-2'],
      };

      const mockBudget = {
        id: 'budget-1',
        user_id: userId,
        name: createBudgetDto.name,
        amount: createBudgetDto.amount,
        currency: createBudgetDto.currency,
        categories: createBudgetDto.categories.map((id) => ({ id })),
      };

      mockBudgetRepository.create.mockReturnValue(mockBudget);
      mockBudgetRepository.save.mockResolvedValue(mockBudget);

      const result = await service.createBudgetForUser({
        userId,
        createBudgetDto,
      });

      expect(result).toEqual(mockBudget);
      expect(mockBudgetRepository.create).toHaveBeenCalled();
      expect(mockBudgetRepository.save).toHaveBeenCalledWith(mockBudget);
    });

    it('should throw BadRequestException when categories are empty', async () => {
      const userId = 'user-123';
      const createBudgetDto: CreateBudgetDto = {
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
        categories: [],
      };

      await expect(
        service.createBudgetForUser({ userId, createBudgetDto }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateBudgetForUser', () => {
    it('should update a budget', async () => {
      const userId = 'user-123';
      const budgetId = 'budget-1';
      const updateBudgetDto: UpdateBudgetDto = {
        name: 'Updated Food Budget',
        amount: 600,
      };

      const existingBudget = {
        id: budgetId,
        user_id: userId,
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
      };

      const updatedBudget = {
        ...existingBudget,
        name: updateBudgetDto.name,
        amount: updateBudgetDto.amount,
      };

      mockBudgetRepository.findOne.mockResolvedValue(existingBudget);
      mockBudgetRepository.save.mockResolvedValue(updatedBudget);

      const result = await service.updateBudgetForUser({
        userId,
        budgetId,
        updateBudgetDto,
      });

      expect(result).toEqual(updatedBudget);
      expect(mockBudgetRepository.findOne).toHaveBeenCalledWith({
        where: { id: budgetId, user_id: userId },
      });
      expect(mockBudgetRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when budget not found', async () => {
      const userId = 'user-123';
      const budgetId = 'non-existent';
      const updateBudgetDto: UpdateBudgetDto = {
        name: 'Updated Budget',
      };

      mockBudgetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateBudgetForUser({ userId, budgetId, updateBudgetDto }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBudgetForUser', () => {
    it('should delete a budget', async () => {
      const userId = 'user-123';
      const budgetId = 'budget-1';

      const mockBudget = {
        id: budgetId,
        user_id: userId,
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
        categories: [],
      };

      mockBudgetRepository.findOne.mockResolvedValue(mockBudget);
      mockBudgetRepository.remove.mockResolvedValue(mockBudget);

      const result = await service.deleteBudgetForUser({ userId, budgetId });

      expect(result).toEqual(mockBudget);
      expect(mockBudgetRepository.findOne).toHaveBeenCalledWith({
        relations: { categories: true },
        where: { id: budgetId, user_id: userId },
      });
      expect(mockBudgetRepository.remove).toHaveBeenCalledWith(mockBudget);
    });

    it('should throw NotFoundException when budget not found', async () => {
      const userId = 'user-123';
      const budgetId = 'non-existent';

      mockBudgetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteBudgetForUser({ userId, budgetId }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
