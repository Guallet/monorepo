import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { AccountsService } from '../accounts/accounts.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IsNull } from 'typeorm';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockTransactionRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  const mockAccountsService = {
    getUserAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: AccountsService,
          useValue: mockAccountsService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
    mockTransactionRepository.create.mockImplementation((value) => value);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserTransactionsCount', () => {
    it('should return count of transactions', async () => {
      const args = {
        userId: 'user-123',
        filters: {
          accounts: ['account-1'],
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
      };

      mockTransactionRepository.count.mockResolvedValue(10);

      const result = await service.getUserTransactionsCount(args);

      expect(result).toBe(10);
      expect(mockTransactionRepository.count).toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty accounts array', async () => {
      const args = {
        userId: 'user-123',
        filters: {
          accounts: [],
        },
      };

      await expect(service.getUserTransactionsCount(args)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserTransactionsInbox', () => {
    it('should return uncategorized transactions with pagination', async () => {
      const mockTransactions: Partial<Transaction>[] = [
        {
          id: 'trans-1',
          amount: 50,
          categoryId: undefined,
        },
      ];

      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getUserTransactionsInbox({
        userId: 'user-123',
        page: 1,
        pageSize: 50,
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(mockTransactionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 0,
        }),
      );
    });

    it('should calculate correct offset for pagination', async () => {
      mockTransactionRepository.find.mockResolvedValue([]);

      await service.getUserTransactionsInbox({
        userId: 'user-123',
        page: 2,
        pageSize: 20,
      });

      expect(mockTransactionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (2-1) * 20
          take: 20,
        }),
      );
    });

    it('should use default pagination values when not provided', async () => {
      mockTransactionRepository.find.mockResolvedValue([]);

      await service.getUserTransactionsInbox({
        userId: 'user-123',
      });

      expect(mockTransactionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        }),
      );
    });

    it('should throw BadRequestException for negative offset', async () => {
      await expect(
        service.getUserTransactionsInbox({
          userId: 'user-123',
          page: 0,
          pageSize: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserTransactionsInboxCount', () => {
    it('should return count of inbox transactions', async () => {
      mockTransactionRepository.count.mockResolvedValue(5);

      const result = await service.getUserTransactionsInboxCount({
        userId: 'user-123',
      });

      expect(result).toBe(5);
      expect(mockTransactionRepository.count).toHaveBeenCalledWith({
        where: {
          account: { user_id: 'user-123' },
          category: {
            id: IsNull(),
          },
        },
      });
    });
  });

  describe('getUserTransactions', () => {
    it('should return paginated transactions', async () => {
      const args = {
        userId: 'user-123',
        page: 1,
        pageSize: 50,
        accounts: ['account-1'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      const mockTransactions: Partial<Transaction>[] = [
        {
          id: 'trans-1',
          amount: 100,
        },
      ];

      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getUserTransactions(args);

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionRepository.find).toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty accounts array', async () => {
      const args = {
        userId: 'user-123',
        page: 1,
        pageSize: 50,
        accounts: [],
      };

      await expect(service.getUserTransactions(args)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for negative offset', async () => {
      const args = {
        userId: 'user-123',
        page: 0,
        pageSize: 50,
      };

      await expect(service.getUserTransactions(args)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should calculate correct offset for pagination', async () => {
      const args = {
        userId: 'user-123',
        page: 2,
        pageSize: 20,
      };

      mockTransactionRepository.find.mockResolvedValue([]);

      await service.getUserTransactions(args);

      expect(mockTransactionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (2-1) * 20
          take: 20,
        }),
      );
    });
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const createData = {
        userId: 'user-123',
        dto: {
          accountId: 'account-1',
          description: 'Test transaction',
          amount: 100,
          currency: 'GBP',
          date: new Date('2024-01-15').toISOString(),
          categoryId: 'category-1',
          notes: 'Test notes',
        },
      };

      const mockAccount = {
        id: 'account-1',
        currency: 'GBP',
      };

      const mockTransaction: Partial<Transaction> = {
        id: 'trans-1',
        ...createData.dto,
        date: new Date(createData.dto.date),
      };

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.create(createData);

      expect(result).toEqual(mockTransaction);
      expect(mockAccountsService.getUserAccount).toHaveBeenCalledWith(
        createData.userId,
        createData.dto.accountId,
      );
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should use account currency if not provided in dto', async () => {
      const createData = {
        userId: 'user-123',
        dto: {
          accountId: 'account-1',
          description: 'Test transaction',
          amount: 100,
          currency: undefined,
          date: new Date('2024-01-15').toISOString(),
          categoryId: 'category-1',
          notes: undefined,
        },
      };

      const mockAccount = {
        id: 'account-1',
        currency: 'EUR',
      };

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);
      mockTransactionRepository.save.mockResolvedValue({});

      await service.create(createData);

      expect(mockTransactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'EUR',
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const transactionId = 'trans-1';
      const mockTransaction: Partial<Transaction> = {
        id: transactionId,
        amount: 100,
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne(transactionId);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        relations: { account: true, category: true },
        where: { id: transactionId },
      });
    });

    it('should throw NotFoundException when transaction not found', async () => {
      const transactionId = 'non-existent';

      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(transactionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserTransaction', () => {
    it('should update a transaction', async () => {
      const updateData = {
        user_id: 'user-123',
        transaction_id: 'trans-1',
        dto: {
          amount: 150,
          description: 'Updated transaction',
        },
      };

      const existingTransaction: Partial<Transaction> = {
        id: updateData.transaction_id,
        amount: 100,
        description: 'Old transaction',
        currency: 'GBP',
      };

      const updatedTransaction: Partial<Transaction> = {
        ...existingTransaction,
        ...updateData.dto,
      };

      mockTransactionRepository.findOne.mockResolvedValue(existingTransaction);
      mockTransactionRepository.save.mockResolvedValue(updatedTransaction);

      const result = await service.updateUserTransaction(updateData);

      expect(result).toEqual(updatedTransaction);
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when transaction not found', async () => {
      const updateData = {
        user_id: 'user-123',
        transaction_id: 'non-existent',
        dto: {
          amount: 150,
        },
      };

      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUserTransaction(updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAccountTransactions', () => {
    it('should return transactions for an account', async () => {
      const args = {
        accountId: 'account-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      const mockTransactions: Partial<Transaction>[] = [
        {
          id: 'trans-1',
          accountId: args.accountId,
        },
      ];

      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getAccountTransactions(args);

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionRepository.find).toHaveBeenCalled();
    });
  });

  describe('deleteUserTransaction', () => {
    it('should delete a transaction', async () => {
      const deleteData = {
        user_id: 'user-123',
        transaction_id: 'trans-1',
      };

      const mockTransaction: Partial<Transaction> = {
        id: deleteData.transaction_id,
        amount: 100,
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.remove.mockResolvedValue(mockTransaction);

      const result = await service.deleteUserTransaction(deleteData);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionRepository.remove).toHaveBeenCalledWith(
        mockTransaction,
      );
    });

    it('should throw NotFoundException when transaction not found', async () => {
      const deleteData = {
        user_id: 'user-123',
        transaction_id: 'non-existent',
      };

      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUserTransaction(deleteData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllUserTransactionsForExport', () => {
    const mockUserId = 'user-123';
    const mockTransactions: Partial<Transaction>[] = [
      {
        id: 'trans-1',
        accountId: 'account-1',
        amount: 100,
        date: new Date('2024-01-15'),
      },
      {
        id: 'trans-2',
        accountId: 'account-2',
        amount: 200,
        date: new Date('2024-02-15'),
      },
    ];

    it('should fetch all transactions without filters', async () => {
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getAllUserTransactionsForExport({
        userId: mockUserId,
      });

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionRepository.find).toHaveBeenCalledWith({
        relations: {
          account: true,
          category: true,
        },
        where: {
          account: { user_id: mockUserId },
        },
        order: {
          date: 'DESC',
        },
      });
    });

    it('should filter by accounts when provided', async () => {
      const accounts = ['account-1', 'account-2'];
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getAllUserTransactionsForExport({
        userId: mockUserId,
        accounts,
      });

      expect(result).toEqual(mockTransactions);
      const callArg = mockTransactionRepository.find.mock.calls[0][0];
      expect(callArg.where.accountId).toBeDefined();
      expect(callArg.where.accountId._type).toBe('in');
      expect(callArg.where.accountId._value).toEqual(accounts);
    });

    it('should ignore empty accounts array', async () => {
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      await service.getAllUserTransactionsForExport({
        userId: mockUserId,
        accounts: [],
      });

      const callArg = mockTransactionRepository.find.mock.calls[0][0];
      expect(callArg.where).not.toHaveProperty('accountId');
    });

    it('should filter by date range when both dates provided', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getAllUserTransactionsForExport({
        userId: mockUserId,
        startDate,
        endDate,
      });

      expect(result).toEqual(mockTransactions);
      const callArg = mockTransactionRepository.find.mock.calls[0][0];
      expect(callArg.where.date).toBeDefined();
      expect(callArg.where.date._type).toBe('between');
      expect(callArg.where.date._value).toEqual([startDate, endDate]);
    });

    it('should NOT filter by date when only startDate provided', async () => {
      const startDate = new Date('2024-01-01');
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      await service.getAllUserTransactionsForExport({
        userId: mockUserId,
        startDate,
      });

      const callArg = mockTransactionRepository.find.mock.calls[0][0];
      expect(callArg.where).not.toHaveProperty('date');
    });

    it('should NOT filter by date when only endDate provided', async () => {
      const endDate = new Date('2024-12-31');
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      await service.getAllUserTransactionsForExport({
        userId: mockUserId,
        endDate,
      });

      const callArg = mockTransactionRepository.find.mock.calls[0][0];
      expect(callArg.where).not.toHaveProperty('date');
    });

    it('should combine multiple filters correctly', async () => {
      const accounts = ['account-1'];
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getAllUserTransactionsForExport({
        userId: mockUserId,
        accounts,
        startDate,
        endDate,
      });

      expect(result).toEqual(mockTransactions);
      const callArg = mockTransactionRepository.find.mock.calls[0][0];
      expect(callArg.where.account).toEqual({ user_id: mockUserId });
      expect(callArg.where.accountId).toBeDefined();
      expect(callArg.where.accountId._type).toBe('in');
      expect(callArg.where.accountId._value).toEqual(accounts);
      expect(callArg.where.date).toBeDefined();
      expect(callArg.where.date._type).toBe('between');
    });

    it('should order results by date DESC', async () => {
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      await service.getAllUserTransactionsForExport({
        userId: mockUserId,
      });

      expect(mockTransactionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: {
            date: 'DESC',
          },
        }),
      );
    });

    it('should include account and category relations', async () => {
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      await service.getAllUserTransactionsForExport({
        userId: mockUserId,
      });

      expect(mockTransactionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: {
            account: true,
            category: true,
          },
        }),
      );
    });

    it('should return empty array when no transactions found', async () => {
      mockTransactionRepository.find.mockResolvedValue([]);

      const result = await service.getAllUserTransactionsForExport({
        userId: mockUserId,
      });

      expect(result).toEqual([]);
    });
  });
});
