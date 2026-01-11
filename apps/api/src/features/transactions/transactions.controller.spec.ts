/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Transaction } from './entities/transaction.entity';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const mockTransactionsService = {
    getUserTransactions: jest.fn(),
    getUserTransactionsCount: jest.fn(),
    getUserTransactionsInbox: jest.fn(),
    getUserTransactionsInboxCount: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    updateUserTransaction: jest.fn(),
    deleteUserTransaction: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTransactions', () => {
    it('should return transactions with pagination', async () => {
      const mockTransactions: Partial<Transaction>[] = [
        {
          id: 'trans-1',
          amount: 100,
          description: 'Test transaction',
        },
      ];

      const query = {
        page: 1,
        pageSize: 50,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        accounts: undefined,
      };

      mockTransactionsService.getUserTransactions.mockResolvedValue(
        mockTransactions,
      );
      mockTransactionsService.getUserTransactionsCount.mockResolvedValue(1);

      const result = await controller.getTransactions(mockUser, query);

      expect(result).toBeDefined();
      expect(result.transactions).toBeDefined();
      expect(mockTransactionsService.getUserTransactions).toHaveBeenCalled();
      expect(
        mockTransactionsService.getUserTransactionsCount,
      ).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid query', async () => {
      await expect(
        controller.getTransactions(mockUser, null as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-integer page', async () => {
      const query = {
        page: 1.5,
        pageSize: 50,
        startDate: undefined,
        endDate: undefined,
        accounts: undefined,
      };

      await expect(controller.getTransactions(mockUser, query)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for empty accounts array with empty strings', async () => {
      const query = {
        page: 1,
        pageSize: 50,
        startDate: undefined,
        endDate: undefined,
        accounts: ['', ''],
      };

      await expect(controller.getTransactions(mockUser, query)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserTransactionInbox', () => {
    it('should return paginated inbox transactions', async () => {
      const mockInboxTransactions = [
        {
          id: 'trans-1',
          amount: 50,
          description: 'Untagged transaction',
        },
      ];

      mockTransactionsService.getUserTransactionsInbox.mockResolvedValue(
        mockInboxTransactions,
      );
      mockTransactionsService.getUserTransactionsInboxCount.mockResolvedValue(
        10,
      );

      const result = await controller.getUserTransactionInbox(mockUser, 1, 50);

      expect(result).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(result.meta.total).toBe(10);
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(50);
      expect(result.transactions.length).toBe(1);
      expect(
        mockTransactionsService.getUserTransactionsInbox,
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
        page: 1,
        pageSize: 50,
      });
      expect(
        mockTransactionsService.getUserTransactionsInboxCount,
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should use default pagination values when not provided', async () => {
      mockTransactionsService.getUserTransactionsInbox.mockResolvedValue([]);
      mockTransactionsService.getUserTransactionsInboxCount.mockResolvedValue(
        0,
      );

      const result = await controller.getUserTransactionInbox(mockUser);

      expect(result).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(50);
    });

    it('should throw BadRequestException for non-integer page', async () => {
      await expect(
        controller.getUserTransactionInbox(mockUser, 1.5 as any, 50),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const createDto = {
        accountId: 'account-1',
        description: 'New transaction',
        amount: 100,
        currency: 'GBP',
        date: new Date('2024-01-15'),
        categoryId: 'category-1',
        notes: 'Test notes',
      };

      const mockTransaction: Partial<Transaction> = {
        id: 'trans-1',
        ...createDto,
      };

      mockTransactionsService.create.mockResolvedValue(mockTransaction);

      const result = await controller.create(mockUser, createDto);

      expect(result).toBeDefined();
      expect(mockTransactionsService.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        dto: createDto,
      });
    });
  });

  describe('findOne', () => {
    it('should return a specific transaction', async () => {
      const transactionId = 'trans-1';
      const mockTransaction: Partial<Transaction> = {
        id: transactionId,
        amount: 100,
        description: 'Test transaction',
        account: { user_id: mockUser.id } as any,
      };

      mockTransactionsService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(mockUser, transactionId);

      expect(result).toBeDefined();
      expect(mockTransactionsService.findOne).toHaveBeenCalledWith(
        transactionId,
      );
    });

    it('should throw NotFoundException if user does not own transaction', async () => {
      const transactionId = 'trans-1';
      const mockTransaction: Partial<Transaction> = {
        id: transactionId,
        account: { user_id: 'other-user' } as any,
      };

      mockTransactionsService.findOne.mockResolvedValue(mockTransaction);

      await expect(controller.findOne(mockUser, transactionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update (async)', () => {
    it('should update a transaction', async () => {
      const transactionId = 'trans-1';
      const updateDto = {
        amount: 150,
        description: 'Updated transaction',
      };

      const mockTransaction: Partial<Transaction> = {
        id: transactionId,
        ...updateDto,
      };

      mockTransactionsService.updateUserTransaction.mockResolvedValue(
        mockTransaction,
      );

      const result = await controller.async(mockUser, transactionId, updateDto);

      expect(result).toBeDefined();
      expect(
        mockTransactionsService.updateUserTransaction,
      ).toHaveBeenCalledWith({
        dto: updateDto,
        user_id: mockUser.id,
        transaction_id: transactionId,
      });
    });
  });

  describe('remove', () => {
    it('should delete a transaction', async () => {
      const transactionId = 'trans-1';
      const mockTransaction: Partial<Transaction> = {
        id: transactionId,
        amount: 100,
      };

      mockTransactionsService.deleteUserTransaction.mockResolvedValue(
        mockTransaction,
      );

      const result = await controller.remove(mockUser, transactionId);

      expect(result).toBeDefined();
      expect(
        mockTransactionsService.deleteUserTransaction,
      ).toHaveBeenCalledWith({
        user_id: mockUser.id,
        transaction_id: transactionId,
      });
    });
  });
});
