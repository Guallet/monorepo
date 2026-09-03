import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller.js';
import { AccountsService } from './accounts.service.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { OpenbankingService } from '../openbanking/openbanking.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserPrincipal } from '../../auth/user-principal.js';
import { Account } from './entities/account.entity.js';
import { AccountType } from './entities/accountType.model.js';
import { AccountSource } from './entities/accountSource.model.js';
import { CreateAccountRequest } from './dto/create-account-request.dto.js';
import { UpdateAccountRequest } from './dto/update-account-request.dto.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { NordigenAccount } from '../openbanking/entities/nordigen-account.entity.js';

describe('AccountsController', () => {
  let controller: AccountsController;

  const mockAccountsService = {
    findAllUserAccounts: jest.fn(),
    getUserAccount: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeUserAccount: jest.fn(),
  };

  const mockTransactionsService = {
    getAccountTransactions: jest.fn(),
    getAccountTransactionsSum: jest.fn(),
  };

  const mockOpenBankingService = {
    getLinkedAccount: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: mockAccountsService,
        },
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
        {
          provide: OpenbankingService,
          useValue: mockOpenBankingService,
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserAccounts', () => {
    it('should return all user accounts', async () => {
      const mockAccounts: Partial<Account>[] = [
        {
          id: 'account-1',
          user_id: mockUser.id,
          name: 'Checking Account',
          balance: 1000,
          currency: 'GBP',
          type: AccountType.CURRENT_ACCOUNT,
          source: AccountSource.MANUAL,
        },
        {
          id: 'account-2',
          user_id: mockUser.id,
          name: 'Savings Account',
          balance: 5000,
          currency: 'GBP',
          type: AccountType.SAVINGS,
          source: AccountSource.MANUAL,
        },
      ];

      mockAccountsService.findAllUserAccounts.mockResolvedValue(mockAccounts);

      const result = await controller.getUserAccounts(mockUser);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(mockAccountsService.findAllUserAccounts).toHaveBeenCalledWith(
        mockUser.id,
      );
    });

    it('should return empty array when user has no accounts', async () => {
      mockAccountsService.findAllUserAccounts.mockResolvedValue([]);

      const result = await controller.getUserAccounts(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const createDto: CreateAccountRequest = {
        name: 'New Account',
        type: AccountType.CURRENT_ACCOUNT,
        currency: 'GBP',
        initial_balance: 1000,
      };

      const mockAccount: Partial<Account> = {
        id: 'account-1',
        user_id: mockUser.id,
        name: createDto.name,
        balance: 1000,
        currency: createDto.currency,
        type: AccountType.CURRENT_ACCOUNT,
        source: AccountSource.MANUAL,
      };

      mockAccountsService.create.mockResolvedValue(mockAccount);

      const result = await controller.create(createDto, mockUser);

      expect(result).toBeDefined();
      expect(result.id).toBe('account-1');
      expect(mockAccountsService.create).toHaveBeenCalledWith({
        user_id: mockUser.id,
        dto: createDto,
      });
    });
  });

  describe('getAccountDetails', () => {
    it('should return account details', async () => {
      const accountId = 'account-1';
      const mockAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: 'Checking Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
        source: AccountSource.MANUAL,
      };

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);

      const result = await controller.getAccountDetails(mockUser, accountId);

      expect(result).toBeDefined();
      expect(result.id).toBe(accountId);
      expect(mockAccountsService.getUserAccount).toHaveBeenCalledWith(
        mockUser.id,
        accountId,
      );
    });
  });

  describe('getAccountTransactions', () => {
    it('should return transactions for current month', async () => {
      const accountId = 'account-1';
      const mockAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: 'Checking Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      const mockTransactions: Partial<Transaction>[] = [
        {
          id: 'tx-1',
          accountId: accountId,
          amount: 100,
          currency: 'GBP',
          date: new Date(),
          description: 'Transaction 1',
        },
        {
          id: 'tx-2',
          accountId: accountId,
          amount: -50,
          currency: 'GBP',
          date: new Date(),
          description: 'Transaction 2',
        },
      ];

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);
      mockTransactionsService.getAccountTransactions.mockResolvedValue(
        mockTransactions,
      );

      const result = await controller.getAccountTransactions(
        mockUser,
        accountId,
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(mockAccountsService.getUserAccount).toHaveBeenCalledWith(
        mockUser.id,
        accountId,
      );
      expect(mockTransactionsService.getAccountTransactions).toHaveBeenCalled();

      const callArgs =
        mockTransactionsService.getAccountTransactions.mock.calls[0][0];
      expect(callArgs.accountId).toBe(accountId);
      expect(callArgs.startDate).toBeInstanceOf(Date);
      expect(callArgs.endDate).toBeInstanceOf(Date);
    });
  });

  describe('getAccountChart', () => {
    it('should return chart data and balance history for the requested range', async () => {
      const accountId = 'account-1';
      const mockAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: 'Checking Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const mockTransactions: Partial<Transaction>[] = [
        {
          id: 'tx-1',
          accountId: accountId,
          amount: 100,
          currency: 'GBP',
          date: new Date(now.getFullYear(), now.getMonth(), 15),
          description: 'Income',
        },
        {
          id: 'tx-2',
          accountId: accountId,
          amount: -50,
          currency: 'GBP',
          date: new Date(now.getFullYear(), now.getMonth(), 20),
          description: 'Expense',
        },
      ];

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);
      mockTransactionsService.getAccountTransactions.mockResolvedValueOnce(
        mockTransactions,
      );
      mockTransactionsService.getAccountTransactionsSum.mockResolvedValueOnce(
        25,
      );

      const result = await controller.getAccountChart(
        mockUser,
        accountId,
        startDate.toISOString(),
        endDate.toISOString(),
      );

      expect(result).toBeDefined();
      expect(result.chart).toBeDefined();
      expect(result.balanceHistory).toMatchObject([
        {
          date: mockTransactions[0].date!.toISOString().split('T')[0],
          balance: 1025,
        },
        {
          date: mockTransactions[1].date!.toISOString().split('T')[0],
          balance: 975,
        },
      ]);
      expect(mockAccountsService.getUserAccount).toHaveBeenCalledWith(
        mockUser.id,
        accountId,
      );
      expect(
        mockTransactionsService.getAccountTransactions,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockTransactionsService.getAccountTransactionsSum,
      ).toHaveBeenCalledTimes(1);

      const callArgs =
        mockTransactionsService.getAccountTransactions.mock.calls[0][0];
      expect(callArgs.accountId).toBe(accountId);
      expect(callArgs.startDate).toEqual(startDate);
      expect(callArgs.endDate).toEqual(endDate);

      const postRangeSumArgs =
        mockTransactionsService.getAccountTransactionsSum.mock.calls[0][0];
      expect(postRangeSumArgs.accountId).toBe(accountId);
      expect(postRangeSumArgs.startDateExclusive).toEqual(endDate);
      expect(postRangeSumArgs.endDate).toBeInstanceOf(Date);
    });

    it('should group transactions by month correctly', async () => {
      const accountId = 'account-1';
      const mockAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: 'Checking Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      const now = new Date();
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const mockTransactions: Partial<Transaction>[] = [
        {
          id: 'tx-1',
          accountId: accountId,
          amount: 100,
          currency: 'GBP',
          date: now,
          description: 'Current month income',
        },
        {
          id: 'tx-2',
          accountId: accountId,
          amount: 200,
          currency: 'GBP',
          date: lastMonth,
          description: 'Last month income',
        },
      ];

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);
      mockTransactionsService.getAccountTransactions.mockResolvedValueOnce(
        mockTransactions,
      );
      mockTransactionsService.getAccountTransactionsSum.mockResolvedValueOnce(
        0,
      );

      const result = await controller.getAccountChart(mockUser, accountId);

      expect(result.chart).toBeDefined();
      expect(result.chart.length).toBeGreaterThan(0);
      expect(result.balanceHistory).toBeDefined();
    });

    it('should throw BadRequestException for invalid date params', async () => {
      const accountId = 'account-1';
      const mockAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: 'Checking Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);

      await expect(
        controller.getAccountChart(mockUser, accountId, 'not-a-date'),
      ).rejects.toThrow(BadRequestException);

      expect(
        mockTransactionsService.getAccountTransactions,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when startDate is after endDate', async () => {
      const accountId = 'account-1';
      const mockAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: 'Checking Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);

      await expect(
        controller.getAccountChart(
          mockUser,
          accountId,
          '2026-04-30T00:00:00.000Z',
          '2026-04-01T00:00:00.000Z',
        ),
      ).rejects.toThrow(BadRequestException);

      expect(
        mockTransactionsService.getAccountTransactions,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getConnectedAccountDetails', () => {
    it('should return connected account details for synced account', async () => {
      const accountId = 'account-1';
      const mockAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: 'Connected Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
        source: AccountSource.SYNCED,
      };

      const mockConnectedAccount: Partial<NordigenAccount> = {
        id: 'ob-account-1',
        resource_id: 'resource-123',
        iban: 'GB00TEST123',
        currency: 'GBP',
        owner_name: 'Test User',
        name: 'Test Account',
        bic: 'TESTBIC',
        status: 'READY',
        details: 'Current account',
        linked_account_id: accountId,
      };

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);
      mockOpenBankingService.getLinkedAccount.mockResolvedValue(
        mockConnectedAccount,
      );

      const result = await controller.getConnectedAccountDetails(
        mockUser,
        accountId,
      );

      expect(result).toBeDefined();
      expect(result.connectedAccount).toEqual({
        id: 'ob-account-1',
        resourceId: 'resource-123',
        iban: 'GB00TEST123',
        currency: 'GBP',
        ownerName: 'Test User',
        name: 'Test Account',
        bic: 'TESTBIC',
        status: 'READY',
        cashAccountType: undefined,
        maskedPan: undefined,
        details: 'Current account',
      });
      expect(mockAccountsService.getUserAccount).toHaveBeenCalledWith(
        mockUser.id,
        accountId,
      );
      expect(mockOpenBankingService.getLinkedAccount).toHaveBeenCalledWith({
        userId: mockUser.id,
        accountId: accountId,
      });
    });

    it('should throw BadRequestException for non-synced account', async () => {
      const accountId = 'account-1';
      const mockAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: 'Manual Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
        source: AccountSource.MANUAL,
      };

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);

      await expect(
        controller.getConnectedAccountDetails(mockUser, accountId),
      ).rejects.toThrow(BadRequestException);

      expect(mockOpenBankingService.getLinkedAccount).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when connected account not found', async () => {
      const accountId = 'account-1';
      const mockAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: 'Connected Account',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
        source: AccountSource.SYNCED,
      };

      mockAccountsService.getUserAccount.mockResolvedValue(mockAccount);
      mockOpenBankingService.getLinkedAccount.mockResolvedValue(null);

      await expect(
        controller.getConnectedAccountDetails(mockUser, accountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update account details', async () => {
      const accountId = 'account-1';
      const updateDto: UpdateAccountRequest = {
        name: 'Updated Account',
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      const mockUpdatedAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: updateDto.name,
        balance: 1000,
        currency: updateDto.currency,
        type: AccountType.CURRENT_ACCOUNT,
      };

      mockAccountsService.update.mockResolvedValue(mockUpdatedAccount);

      const result = await controller.update(mockUser, accountId, updateDto);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateDto.name);
      expect(mockAccountsService.update).toHaveBeenCalledWith({
        accountId: accountId,
        dto: updateDto,
        userId: mockUser.id,
      });
    });
  });

  describe('remove', () => {
    it('should remove an account', async () => {
      const accountId = 'account-1';
      const mockAccount: Partial<Account> = {
        id: accountId,
        user_id: mockUser.id,
        name: 'Account to Remove',
        balance: 1000,
        currency: 'GBP',
        type: AccountType.CURRENT_ACCOUNT,
      };

      mockAccountsService.removeUserAccount.mockResolvedValue(mockAccount);

      const result = await controller.remove(mockUser, accountId);

      expect(result).toBeDefined();
      expect(result.id).toBe(accountId);
      expect(mockAccountsService.removeUserAccount).toHaveBeenCalledWith({
        account_id: accountId,
        user_id: mockUser.id,
      });
    });
  });
});
