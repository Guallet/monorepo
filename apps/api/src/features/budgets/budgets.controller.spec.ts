import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Transaction } from '../transactions/entities/transaction.entity';

describe('BudgetsController', () => {
  let controller: BudgetsController;

  const mockBudgetsService = {
    findAllForUser: jest.fn(),
    findOneForUser: jest.fn(),
    getMonthlySpending: jest.fn(),
    getBudgetTransactions: jest.fn(),
    createBudgetForUser: jest.fn(),
    updateBudgetForUser: jest.fn(),
    deleteBudgetForUser: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetsController],
      providers: [
        {
          provide: BudgetsService,
          useValue: mockBudgetsService,
        },
      ],
    }).compile();

    controller = module.get<BudgetsController>(BudgetsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all user budgets with spending', async () => {
      const mockBudgets: Partial<Budget>[] = [
        {
          id: 'budget-1',
          user_id: mockUser.id,
          name: 'Food Budget',
          amount: 500,
          currency: 'GBP',
          categories: [],
        },
        {
          id: 'budget-2',
          user_id: mockUser.id,
          name: 'Transport Budget',
          amount: 200,
          currency: 'GBP',
          categories: [],
        },
      ];

      mockBudgetsService.findAllForUser.mockResolvedValue(mockBudgets);
      mockBudgetsService.getMonthlySpending.mockResolvedValue(150);

      const result = await controller.findAll(mockUser);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(mockBudgetsService.findAllForUser).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(mockBudgetsService.getMonthlySpending).toHaveBeenCalledTimes(2);
    });

    it('should use custom month and year when provided', async () => {
      const mockBudgets: Partial<Budget>[] = [
        {
          id: 'budget-1',
          user_id: mockUser.id,
          name: 'Food Budget',
          amount: 500,
          currency: 'GBP',
          categories: [],
        },
      ];

      mockBudgetsService.findAllForUser.mockResolvedValue(mockBudgets);
      mockBudgetsService.getMonthlySpending.mockResolvedValue(150);

      await controller.findAll(mockUser, 5, 2024);

      expect(mockBudgetsService.getMonthlySpending).toHaveBeenCalledWith({
        userId: mockUser.id,
        budgetId: 'budget-1',
        dateRange: { month: 5, year: 2024 },
      });
    });
  });

  describe('findOne', () => {
    it('should return a specific budget with spending', async () => {
      const budgetId = 'budget-1';
      const mockBudget: Partial<Budget> = {
        id: budgetId,
        user_id: mockUser.id,
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
        categories: [],
      };

      mockBudgetsService.findOneForUser.mockResolvedValue(mockBudget);
      mockBudgetsService.getMonthlySpending.mockResolvedValue(150);

      const result = await controller.findOne(budgetId, mockUser);

      expect(result).toBeDefined();
      expect(mockBudgetsService.findOneForUser).toHaveBeenCalledWith({
        id: budgetId,
        userId: mockUser.id,
      });
      expect(mockBudgetsService.getMonthlySpending).toHaveBeenCalled();
    });

    it('should use custom month and year when provided', async () => {
      const budgetId = 'budget-1';
      const mockBudget: Partial<Budget> = {
        id: budgetId,
        user_id: mockUser.id,
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
        categories: [],
      };

      mockBudgetsService.findOneForUser.mockResolvedValue(mockBudget);
      mockBudgetsService.getMonthlySpending.mockResolvedValue(150);

      await controller.findOne(budgetId, mockUser, 5, 2024);

      expect(mockBudgetsService.getMonthlySpending).toHaveBeenCalledWith({
        userId: mockUser.id,
        budgetId: budgetId,
        dateRange: { month: 5, year: 2024 },
      });
    });
  });

  describe('getBudgetTransactions', () => {
    it('should return transactions for a budget', async () => {
      const budgetId = 'budget-1';
      const mockTransactions: Partial<Transaction>[] = [
        {
          id: 'tx-1',
          amount: -50,
          currency: 'GBP',
          description: 'Grocery shopping',
        },
        {
          id: 'tx-2',
          amount: -30,
          currency: 'GBP',
          description: 'Restaurant',
        },
      ];

      mockBudgetsService.getBudgetTransactions.mockResolvedValue(
        mockTransactions,
      );

      const result = await controller.getBudgetTransactions(
        mockUser,
        budgetId,
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(mockBudgetsService.getBudgetTransactions).toHaveBeenCalled();
    });

    it('should use custom date range when provided', async () => {
      const budgetId = 'budget-1';
      mockBudgetsService.getBudgetTransactions.mockResolvedValue([]);

      await controller.getBudgetTransactions(mockUser, budgetId, 5, 2024);

      expect(mockBudgetsService.getBudgetTransactions).toHaveBeenCalledWith({
        userId: mockUser.id,
        budgetId: budgetId,
        dateRange: { month: 5, year: 2024 },
      });
    });
  });

  describe('create', () => {
    it('should create a new budget', async () => {
      const createDto: CreateBudgetDto = {
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
        categories: ['cat-1', 'cat-2'],
      };

      const mockBudget: Partial<Budget> = {
        id: 'budget-1',
        user_id: mockUser.id,
        name: createDto.name,
        amount: createDto.amount,
        currency: createDto.currency,
        categories: [],
      };

      mockBudgetsService.createBudgetForUser.mockResolvedValue(mockBudget);
      mockBudgetsService.getMonthlySpending.mockResolvedValue(0);

      const result = await controller.create(createDto, mockUser);

      expect(result).toBeDefined();
      expect(mockBudgetsService.createBudgetForUser).toHaveBeenCalledWith({
        userId: mockUser.id,
        createBudgetDto: createDto,
      });
      expect(mockBudgetsService.getMonthlySpending).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a budget', async () => {
      const budgetId = 'budget-1';
      const updateDto: UpdateBudgetDto = {
        name: 'Updated Food Budget',
        amount: 600,
      };

      const mockBudget: Partial<Budget> = {
        id: budgetId,
        user_id: mockUser.id,
        name: updateDto.name,
        amount: updateDto.amount,
        currency: 'GBP',
        categories: [],
      };

      mockBudgetsService.updateBudgetForUser.mockResolvedValue(mockBudget);
      mockBudgetsService.getMonthlySpending.mockResolvedValue(150);

      const result = await controller.update(budgetId, updateDto, mockUser);

      expect(result).toBeDefined();
      expect(mockBudgetsService.updateBudgetForUser).toHaveBeenCalledWith({
        userId: mockUser.id,
        budgetId: budgetId,
        updateBudgetDto: updateDto,
      });
      expect(mockBudgetsService.getMonthlySpending).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a budget', async () => {
      const budgetId = 'budget-1';
      const mockBudget: Partial<Budget> = {
        id: budgetId,
        user_id: mockUser.id,
        name: 'Food Budget',
        amount: 500,
        currency: 'GBP',
        categories: [],
      };

      mockBudgetsService.deleteBudgetForUser.mockResolvedValue(mockBudget);

      const result = await controller.delete(budgetId, mockUser);

      expect(result).toBeDefined();
      expect(mockBudgetsService.deleteBudgetForUser).toHaveBeenCalledWith({
        userId: mockUser.id,
        budgetId: budgetId,
      });
    });
  });
});
