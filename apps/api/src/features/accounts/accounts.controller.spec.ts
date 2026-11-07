import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { Account } from './entities/account.entity';
import { AccountType } from './entities/accountType.model';
import { AccountSource } from './entities/accountSource.model';
import { CreateAccountRequest } from './dto/create-account-request.dto';
import { UpdateAccountRequest } from './dto/update-account-request.dto';
import { Transaction } from '../transactions/entities/transaction.entity';
import { AccountConnectionsService } from './account-connections.service';
import { AccountConnection } from './models/account-connection.model';
import { accountChartQuerySchema } from './dto/account-chart.query';

describe('AccountsController', () => {
  let controller: AccountsController;

  const mockAccountsService = {
    findAllUserAccounts: vi.fn(),
    getUserAccount: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    removeUserAccount: vi.fn(),
  };

  const mockTransactionsService = {
    getAccountTransactions: vi.fn(),
    getAccountTransactionsSum: vi.fn(),
  };

  const mockAccountConnectionsService = {
    getConnection: vi.fn(),
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
          provide: AccountConnectionsService,
          useValue: mockAccountConnectionsService,
        },
        {
          provide: AccountsService,
          useValue: mockAccountsService,
        },
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);

    // Clear all mocks before each test
    vi.clearAllMocks();
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

  describe('getConnectedAccountDetails', () => {
    it('serializes disconnected accounts as an empty object', async () => {
      mockAccountConnectionsService.getConnection.mockResolvedValue(null);

      const response = await controller.getConnectedAccountDetails(
        mockUser,
        'account-1',
      );

      expect(JSON.stringify(response)).toBe('{}');
      expect(mockAccountConnectionsService.getConnection).toHaveBeenCalledWith(
        mockUser.id,
        'account-1',
      );
    });

    it('maps domain connection data to a response DTO', async () => {
      const lastRefresh = new Date('2026-11-07T10:00:00Z');
      const connection: AccountConnection = {
        id: 'connection-1',
        providerId: 'synci',
        remoteAccountId: 'remote-account',
        lastRefresh,
        daysRemaining: null,
        status: 'connected',
      };
      mockAccountConnectionsService.getConnection.mockResolvedValue(connection);

      const response = await controller.getConnectedAccountDetails(
        mockUser,
        'account-1',
      );

      expect(JSON.parse(JSON.stringify(response))).toEqual({
        id: 'connection-1',
        providerId: 'synci',
        remoteAccountId: 'remote-account',
        lastRefresh: lastRefresh.toISOString(),
        daysRemaining: null,
        status: 'connected',
      });
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
        accountChartQuerySchema.parse({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
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

      const result = await controller.getAccountChart(
        mockUser,
        accountId,
        accountChartQuerySchema.parse({}),
      );

      expect(result.chart).toBeDefined();
      expect(result.chart.length).toBeGreaterThan(0);
      expect(result.balanceHistory).toBeDefined();
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
