import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { AccountsService } from '../accounts/accounts.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockTransactionRepository = {
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
    it('should return uncategorized transactions', async () => {
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
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(mockTransactionRepository.find).toHaveBeenCalled();
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
          date: new Date('2024-01-15'),
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
          date: new Date('2024-01-15'),
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
});
