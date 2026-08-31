import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from './entities/account.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { NotFoundException } from '@nestjs/common';
import { AccountType } from './entities/accountType.model.js';
import { AccountSource } from './entities/accountSource.model.js';
import { CreateAccountRequest } from './dto/create-account-request.dto.js';
import { UpdateAccountRequest } from './dto/update-account-request.dto.js';

describe('AccountsService', () => {
  let service: AccountsService;

  const mockAccountRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockTransactionRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllUserAccounts', () => {
    it('should return all accounts for a user', async () => {
      const userId = 'user-123';
      const mockAccounts = [
        {
          id: 'account-1',
          user_id: userId,
          name: 'Checking Account',
          balance: 1000,
          currency: 'GBP',
          type: AccountType.CURRENT_ACCOUNT,
          source: AccountSource.MANUAL,
        },
        {
          id: 'account-2',
          user_id: userId,
          name: 'Savings Account',
          balance: 5000,
          currency: 'GBP',
          type: AccountType.SAVINGS,
          source: AccountSource.MANUAL,
        },
      ];

      mockAccountRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.findAllUserAccounts(userId);

      expect(result).toEqual(mockAccounts);
      expect(mockAccountRepository.find).toHaveBeenCalledWith({
        where: { user_id: userId },
        relations: {
          institution: true,
        },
      });
    });

    it('should return empty array when user has no accounts', async () => {
      const userId = 'user-123';
      mockAccountRepository.find.mockResolvedValue([]);

      const result = await service.findAllUserAccounts(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getUserAccount', () => {
    it('should return a specific account for a user', async () => {
      const userId = 'user-123';
      const accountId = 'account-1';
      const mockAccount = {
        id: accountId,
        user_id: userId,
        name: 'Checking Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
        source: AccountSource.MANUAL,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.getUserAccount(userId, accountId);

      expect(result).toEqual(mockAccount);
      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: accountId,
          user_id: userId,
        },
        relations: {
          institution: true,
        },
      });
    });

    it('should throw NotFoundException when account does not exist', async () => {
      const userId = 'user-123';
      const accountId = 'non-existent';

      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserAccount(userId, accountId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new account with default values', async () => {
      const userId = 'user-123';
      const dto: CreateAccountRequest = {
        name: 'New Account',
        type: AccountType.CURRENT_ACCOUNT,
        currency: 'GBP',
      };

      const savedAccount = {
        id: 'account-1',
        user_id: userId,
        name: dto.name,
        balance: 0,
        currency: dto.currency,
        type: dto.type,
        source: AccountSource.UNKNOWN,
        source_name: undefined,
      };

      mockAccountRepository.save.mockResolvedValue(savedAccount);

      const result = await service.create({ user_id: userId, dto });

      expect(result).toEqual(savedAccount);
      expect(mockAccountRepository.save).toHaveBeenCalledWith({
        user_id: userId,
        name: dto.name,
        balance: 0,
        currency: dto.currency,
        type: dto.type,
        source: AccountSource.UNKNOWN,
        source_name: undefined,
        institutionId: null,
        properties: null,
      });
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });

    it('should create a new account with initial balance', async () => {
      const userId = 'user-123';
      const dto: CreateAccountRequest = {
        name: 'Savings Account',
        type: AccountType.SAVINGS,
        currency: 'GBP',
        initial_balance: 5000,
      };

      const savedAccount = {
        id: 'account-1',
        user_id: userId,
        name: dto.name,
        balance: 5000,
        currency: dto.currency,
        type: dto.type,
        source: AccountSource.UNKNOWN,
        source_name: undefined,
      };

      mockAccountRepository.save.mockResolvedValue(savedAccount);

      const result = await service.create({ user_id: userId, dto });

      expect(result).toEqual(savedAccount);
      expect(mockAccountRepository.save).toHaveBeenCalledWith({
        user_id: userId,
        name: dto.name,
        balance: 5000,
        currency: dto.currency,
        type: dto.type,
        source: AccountSource.UNKNOWN,
        source_name: undefined,
        institutionId: null,
        properties: null,
      });
      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });

    it('should persist the institution id when provided', async () => {
      const userId = 'user-123';
      const dto: CreateAccountRequest = {
        name: 'Institution Account',
        type: AccountType.CURRENT_ACCOUNT,
        currency: 'GBP',
        institution_id: '3f6f0b7d-b3b4-45f9-9b42-8f4f8c9a9f01',
      };

      const savedAccount = {
        id: 'account-1',
        user_id: userId,
        name: dto.name,
        balance: 0,
        currency: dto.currency,
        type: dto.type,
        source: AccountSource.UNKNOWN,
        institutionId: dto.institution_id,
      };

      mockAccountRepository.save.mockResolvedValue(savedAccount);

      const result = await service.create({ user_id: userId, dto });

      expect(result).toEqual(savedAccount);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          institutionId: dto.institution_id,
        }),
      );
    });

    it('should create initial balance transaction when requested', async () => {
      const userId = 'user-123';
      const dto: CreateAccountRequest = {
        name: 'Savings Account',
        type: AccountType.SAVINGS,
        currency: 'GBP',
        initial_balance: 5000,
        create_balance_transaction: true,
      };

      const savedAccount = {
        id: 'account-1',
        user_id: userId,
        name: dto.name,
        balance: 5000,
        currency: dto.currency,
        type: dto.type,
        source: AccountSource.UNKNOWN,
      };

      mockAccountRepository.save.mockResolvedValue(savedAccount);
      mockTransactionRepository.save.mockResolvedValue({
        id: 'transaction-1',
        accountId: savedAccount.id,
        amount: 5000,
      });

      const result = await service.create({ user_id: userId, dto });

      expect(result).toEqual(savedAccount);
      expect(mockTransactionRepository.save).toHaveBeenCalledWith({
        accountId: savedAccount.id,
        amount: 5000,
        currency: savedAccount.currency,
        date: expect.any(Date),
        description: 'Initial balance',
        notes: 'Created during account creation',
      });
    });

    it('should normalize credit card balance to negative', async () => {
      const userId = 'user-123';
      const dto: CreateAccountRequest = {
        name: 'Credit Card',
        type: AccountType.CREDIT_CARD,
        currency: 'GBP',
        initial_balance: 1000,
      };

      const savedAccount = {
        id: 'account-1',
        user_id: userId,
        name: dto.name,
        balance: -1000,
        currency: dto.currency,
        type: dto.type,
        source: AccountSource.UNKNOWN,
      };

      mockAccountRepository.save.mockResolvedValue(savedAccount);

      const result = await service.create({ user_id: userId, dto });

      expect(result.balance).toBe(-1000);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: -1000,
        }),
      );
    });

    it('should normalize loan balance to negative', async () => {
      const userId = 'user-123';
      const dto: CreateAccountRequest = {
        name: 'Personal Loan',
        type: AccountType.LOAN,
        currency: 'GBP',
        initial_balance: 10000,
      };

      const savedAccount = {
        id: 'account-1',
        user_id: userId,
        name: dto.name,
        balance: -10000,
        currency: dto.currency,
        type: dto.type,
        source: AccountSource.UNKNOWN,
      };

      mockAccountRepository.save.mockResolvedValue(savedAccount);

      const result = await service.create({ user_id: userId, dto });

      expect(result.balance).toBe(-10000);
    });

    it('should normalize mortgage balance to negative', async () => {
      const userId = 'user-123';
      const dto: CreateAccountRequest = {
        name: 'Mortgage',
        type: AccountType.MORTGAGE,
        currency: 'GBP',
        initial_balance: 200000,
      };

      const savedAccount = {
        id: 'account-1',
        user_id: userId,
        name: dto.name,
        balance: -200000,
        currency: dto.currency,
        type: dto.type,
        source: AccountSource.UNKNOWN,
      };

      mockAccountRepository.save.mockResolvedValue(savedAccount);

      const result = await service.create({ user_id: userId, dto });

      expect(result.balance).toBe(-200000);
    });

    it('should persist account-type specific properties', async () => {
      const userId = 'user-123';
      const dto: CreateAccountRequest = {
        name: 'Mortgage',
        type: AccountType.MORTGAGE,
        currency: 'GBP',
        properties: {
          propertyValue: 350000,
          mortgageAmount: 250000,
          interestRate: 4.2,
          termLength: 30,
        },
      };

      const savedAccount = {
        id: 'account-1',
        user_id: userId,
        name: dto.name,
        balance: 0,
        currency: dto.currency,
        type: dto.type,
        source: AccountSource.UNKNOWN,
        properties: dto.properties,
      };

      mockAccountRepository.save.mockResolvedValue(savedAccount);

      const result = await service.create({ user_id: userId, dto });

      expect(result.properties).toEqual(dto.properties);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: dto.properties,
        }),
      );
    });
  });

  describe('update', () => {
    it('should update account details', async () => {
      const userId = 'user-123';
      const accountId = 'account-1';
      const dto: UpdateAccountRequest = {
        name: 'Updated Account',
        currency: 'GBP',
        type: AccountType.SAVINGS,
      };

      const existingAccount = {
        id: accountId,
        user_id: userId,
        name: 'Old Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      const updatedAccount = {
        id: accountId,
        user_id: userId,
        name: dto.name,
        balance: 1000,
        currency: dto.currency,
        type: dto.type,
      };

      mockAccountRepository.findOne.mockResolvedValue(existingAccount);
      mockAccountRepository.save.mockResolvedValue(updatedAccount);

      const result = await service.update({ accountId, dto, userId });

      expect(result).toEqual(updatedAccount);
      expect(mockAccountRepository.save).toHaveBeenCalledWith({
        id: accountId,
        user_id: userId,
        name: dto.name,
        balance: existingAccount.balance,
        currency: dto.currency,
        type: dto.type,
      });
    });

    it('should throw NotFoundException when account does not exist', async () => {
      const userId = 'user-123';
      const accountId = 'non-existent';
      const dto: UpdateAccountRequest = {
        name: 'Updated Account',
        type: AccountType.CURRENT_ACCOUNT,
        currency: 'GBP',
      };

      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.update({ accountId, dto, userId })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update balance and create adjustment transaction when requested', async () => {
      const userId = 'user-123';
      const accountId = 'account-1';
      const dto: UpdateAccountRequest = {
        name: 'Account',
        type: AccountType.CURRENT_ACCOUNT,
        currency: 'GBP',
        balance: 2000,
        create_balance_transaction: true,
      };

      const existingAccount = {
        id: accountId,
        user_id: userId,
        name: 'Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      const updatedAccount = {
        ...existingAccount,
        balance: 2000,
      };

      mockAccountRepository.findOne.mockResolvedValue(existingAccount);
      mockAccountRepository.save.mockResolvedValue(updatedAccount);
      mockTransactionRepository.save.mockResolvedValue({
        id: 'transaction-1',
        accountId: accountId,
        amount: -1000,
      });

      const result = await service.update({ accountId, dto, userId });

      expect(result).toEqual(updatedAccount);
      expect(mockTransactionRepository.save).toHaveBeenCalledWith({
        accountId: accountId,
        amount: -1000,
        currency: existingAccount.currency,
        date: expect.any(Date),
        description: 'Manual balance adjustment',
        notes: 'Created due to manual account balance update',
      });
    });

    it('should not create adjustment transaction when balance difference is zero', async () => {
      const userId = 'user-123';
      const accountId = 'account-1';
      const dto: UpdateAccountRequest = {
        name: 'Account',
        type: AccountType.CURRENT_ACCOUNT,
        currency: 'GBP',
        balance: 1000,
        create_balance_transaction: true,
      };

      const existingAccount = {
        id: accountId,
        user_id: userId,
        name: 'Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      mockAccountRepository.findOne.mockResolvedValue(existingAccount);
      mockAccountRepository.save.mockResolvedValue(existingAccount);

      await service.update({ accountId, dto, userId });

      expect(mockTransactionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOneById', () => {
    it('should return an account by id', async () => {
      const accountId = 'account-1';
      const mockAccount = {
        id: accountId,
        user_id: 'user-123',
        name: 'Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);

      const result = await service.findOneById(accountId);

      expect(result).toEqual(mockAccount);
      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: accountId },
        relations: { institution: true },
      });
    });

    it('should throw NotFoundException when account does not exist', async () => {
      const accountId = 'non-existent';
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(accountId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all accounts', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          user_id: 'user-1',
          name: 'Account 1',
          balance: 1000,
        },
        {
          id: 'account-2',
          user_id: 'user-2',
          name: 'Account 2',
          balance: 2000,
        },
      ];

      mockAccountRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.findAll();

      expect(result).toEqual(mockAccounts);
      expect(mockAccountRepository.find).toHaveBeenCalledWith({
        relations: { institution: true },
      });
    });
  });

  describe('removeUserAccount', () => {
    it('should remove a user account', async () => {
      const userId = 'user-123';
      const accountId = 'account-1';
      const mockAccount = {
        id: accountId,
        user_id: userId,
        name: 'Account',
        balance: 1000,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockAccountRepository.remove.mockResolvedValue(mockAccount);

      const result = await service.removeUserAccount({
        user_id: userId,
        account_id: accountId,
      });

      expect(result).toEqual(mockAccount);
      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: accountId,
          user_id: userId,
        },
      });
      expect(mockAccountRepository.remove).toHaveBeenCalledWith(mockAccount);
    });

    it('should throw NotFoundException when account does not exist', async () => {
      const userId = 'user-123';
      const accountId = 'non-existent';

      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeUserAccount({ user_id: userId, account_id: accountId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an account by id', async () => {
      const accountId = 'account-1';
      const mockAccount = {
        id: accountId,
        user_id: 'user-123',
        name: 'Account',
        balance: 1000,
      };

      mockAccountRepository.findOne.mockResolvedValue(mockAccount);
      mockAccountRepository.remove.mockResolvedValue(mockAccount);

      const result = await service.remove(accountId);

      expect(result).toEqual(mockAccount);
      expect(mockAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: accountId },
      });
      expect(mockAccountRepository.remove).toHaveBeenCalledWith(mockAccount);
    });

    it('should throw NotFoundException when account does not exist', async () => {
      const accountId = 'non-existent';
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(accountId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
