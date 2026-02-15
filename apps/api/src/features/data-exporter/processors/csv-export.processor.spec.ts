/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { CsvExportProcessor, CsvExportJobData } from './csv-export.processor';
import { TransactionsService } from '../../transactions/transactions.service';
import { AccountsService } from '../../accounts/accounts.service';
import { CategoriesService } from '../../categories/categories.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { Account } from '../../accounts/entities/account.entity';
import { Category } from '../../categories/entities/category.entity';

describe('CsvExportProcessor', () => {
  let processor: CsvExportProcessor;
  let transactionsService: jest.Mocked<TransactionsService>;
  let accountsService: jest.Mocked<AccountsService>;
  let categoriesService: jest.Mocked<CategoriesService>;
  let emailService: jest.Mocked<EmailService>;
  let usersService: jest.Mocked<UsersService>;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockUserId = 'user-123';
  const mockUserEmail = 'test@example.com';
  const mockUserName = 'Test User';

  beforeEach(async () => {
    const mockTransactionsService = {
      getAllUserTransactionsForExport: jest.fn(),
    };

    const mockAccountsService = {
      findAllUserAccounts: jest.fn(),
    };

    const mockCategoriesService = {
      findAllUserCategories: jest.fn(),
    };

    const mockEmailService = {
      sendExportCompletionEmail: jest.fn(),
      sendExportErrorEmail: jest.fn(),
    };

    const mockUsersService = {
      findUserData: jest.fn(),
    };

    const mockNotificationsService = {
      createSystemNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvExportProcessor,
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
        {
          provide: AccountsService,
          useValue: mockAccountsService,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    processor = module.get<CsvExportProcessor>(CsvExportProcessor);
    transactionsService = module.get(TransactionsService);
    accountsService = module.get(AccountsService);
    categoriesService = module.get(CategoriesService);
    emailService = module.get(EmailService);
    usersService = module.get(UsersService);
    notificationsService = module.get(NotificationsService);

    // Mock user lookup
    usersService.findUserData.mockResolvedValue({
      id: mockUserId,
      email: mockUserEmail,
      name: mockUserName,
    } as any);

    jest.clearAllMocks();
    notificationsService.createSystemNotification.mockResolvedValue({} as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('process', () => {
    it('should successfully process export with transactions', async () => {
      const mockAccounts: Account[] = [
        {
          id: 'account-1',
          name: 'Checking Account',
          currency: 'GBP',
        } as Account,
      ];

      const mockCategories: Category[] = [
        {
          id: 'category-1',
          name: 'Food',
        } as Category,
      ];

      const mockTransactions = [
        {
          id: 'tx-1',
          accountId: 'account-1',
          description: 'Grocery Store',
          notes: 'Weekly shopping',
          amount: -50,
          currency: 'GBP',
          date: new Date('2024-01-15'),
          categoryId: 'category-1',
        },
        {
          id: 'tx-2',
          accountId: 'account-1',
          description: 'Salary',
          notes: null,
          amount: 2000,
          currency: 'GBP',
          date: new Date('2024-01-01'),
          categoryId: null,
        },
      ];

      accountsService.findAllUserAccounts.mockResolvedValue(mockAccounts);
      categoriesService.findAllUserCategories.mockResolvedValue(mockCategories);
      transactionsService.getAllUserTransactionsForExport.mockResolvedValue(
        mockTransactions as any,
      );

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      const result = await processor.process(job as Job<CsvExportJobData>);

      expect(result).toEqual({ transactionCount: 2 });
      expect(accountsService.findAllUserAccounts).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(categoriesService.findAllUserCategories).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(
        transactionsService.getAllUserTransactionsForExport,
      ).toHaveBeenCalledWith({
        userId: mockUserId,
        accounts: undefined,
        startDate: undefined,
        endDate: undefined,
      });
      expect(emailService.sendExportCompletionEmail).toHaveBeenCalledWith({
        to: mockUserEmail,
        userName: mockUserName,
        transactionCount: 2,
        csvContent: expect.any(String),
      });
    });

    it('should apply date filters correctly', async () => {
      accountsService.findAllUserAccounts.mockResolvedValue([]);
      categoriesService.findAllUserCategories.mockResolvedValue([]);
      transactionsService.getAllUserTransactionsForExport.mockResolvedValue([]);

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-01-31T23:59:59.999Z',
          },
        },
      };

      await processor.process(job as Job<CsvExportJobData>);

      const callArgs =
        transactionsService.getAllUserTransactionsForExport.mock.calls[0][0];
      expect(callArgs.startDate).toBeInstanceOf(Date);
      expect(callArgs.endDate).toBeInstanceOf(Date);
      expect(callArgs.startDate?.getHours()).toBe(0);
      expect(callArgs.startDate?.getMinutes()).toBe(0);
      expect(callArgs.endDate?.getHours()).toBe(23);
      expect(callArgs.endDate?.getMinutes()).toBe(59);
    });

    it('should apply account filters', async () => {
      accountsService.findAllUserAccounts.mockResolvedValue([]);
      categoriesService.findAllUserCategories.mockResolvedValue([]);
      transactionsService.getAllUserTransactionsForExport.mockResolvedValue([]);

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {
            accounts: ['account-1', 'account-2'],
          },
        },
      };

      await processor.process(job as Job<CsvExportJobData>);

      expect(
        transactionsService.getAllUserTransactionsForExport,
      ).toHaveBeenCalledWith({
        userId: mockUserId,
        accounts: ['account-1', 'account-2'],
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should send error email on failure', async () => {
      const error = new Error('Database connection failed');
      accountsService.findAllUserAccounts.mockRejectedValue(error);

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      await expect(
        processor.process(job as Job<CsvExportJobData>),
      ).rejects.toThrow('Database connection failed');

      expect(emailService.sendExportErrorEmail).toHaveBeenCalledWith({
        to: mockUserEmail,
        userName: mockUserName,
        errorMessage: 'Database connection failed',
      });
    });

    it('should handle user without email', async () => {
      usersService.findUserData.mockResolvedValue({
        id: mockUserId,
        email: null,
        name: mockUserName,
      } as any);

      accountsService.findAllUserAccounts.mockResolvedValue([]);
      categoriesService.findAllUserCategories.mockResolvedValue([]);
      transactionsService.getAllUserTransactionsForExport.mockResolvedValue([]);

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      const result = await processor.process(job as Job<CsvExportJobData>);

      expect(result).toEqual({ transactionCount: 0 });
      expect(emailService.sendExportCompletionEmail).not.toHaveBeenCalled();
    });

    it('should export transactions with no category', async () => {
      const mockAccounts: Account[] = [
        {
          id: 'account-1',
          name: 'Checking',
        } as Account,
      ];

      const mockTransactions = [
        {
          id: 'tx-1',
          accountId: 'account-1',
          description: 'Transaction without category',
          notes: '',
          amount: 100,
          currency: 'GBP',
          date: new Date('2024-01-15'),
          categoryId: null,
        },
      ];

      accountsService.findAllUserAccounts.mockResolvedValue(mockAccounts);
      categoriesService.findAllUserCategories.mockResolvedValue([]);
      transactionsService.getAllUserTransactionsForExport.mockResolvedValue(
        mockTransactions as any,
      );

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      const result = await processor.process(job as Job<CsvExportJobData>);

      expect(result).toEqual({ transactionCount: 1 });
      expect(emailService.sendExportCompletionEmail).toHaveBeenCalled();
    });
  });

  describe('generateCsvContent', () => {
    it('should generate valid CSV with headers', async () => {
      const mockAccounts: Account[] = [
        { id: 'acc-1', name: 'Test Account' } as Account,
      ];
      const mockCategories: Category[] = [
        { id: 'cat-1', name: 'Test Category' } as Category,
      ];
      const mockTransactions = [
        {
          id: 'tx-1',
          accountId: 'acc-1',
          description: 'Test',
          amount: 100,
          currency: 'GBP',
          date: new Date('2024-01-15'),
          categoryId: 'cat-1',
        },
      ];

      accountsService.findAllUserAccounts.mockResolvedValue(mockAccounts);
      categoriesService.findAllUserCategories.mockResolvedValue(mockCategories);
      transactionsService.getAllUserTransactionsForExport.mockResolvedValue(
        mockTransactions as any,
      );

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      await processor.process(job as Job<CsvExportJobData>);

      const csvContent =
        emailService.sendExportCompletionEmail.mock.calls[0][0].csvContent;
      const lines = csvContent.split('\n');

      expect(lines[0]).toBe(
        'Date,Account,Description,Amount,Currency,Notes,Category',
      );
      expect(lines.length).toBe(2); // header + 1 transaction
    });

    it('should escape CSV fields with special characters', async () => {
      const mockAccounts: Account[] = [
        { id: 'acc-1', name: 'Account, with comma' } as Account,
      ];
      const mockCategories: Category[] = [
        { id: 'cat-1', name: 'Category "quoted"' } as Category,
      ];
      const mockTransactions = [
        {
          id: 'tx-1',
          accountId: 'acc-1',
          description: 'Description with\nnewline',
          notes: 'Notes with "quotes"',
          amount: 100,
          currency: 'GBP',
          date: new Date('2024-01-15'),
          categoryId: 'cat-1',
        },
      ];

      accountsService.findAllUserAccounts.mockResolvedValue(mockAccounts);
      categoriesService.findAllUserCategories.mockResolvedValue(mockCategories);
      transactionsService.getAllUserTransactionsForExport.mockResolvedValue(
        mockTransactions as any,
      );

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      await processor.process(job as Job<CsvExportJobData>);

      const csvContent =
        emailService.sendExportCompletionEmail.mock.calls[0][0].csvContent;

      // Check that special characters are properly escaped in the CSV
      expect(csvContent).toContain('"Account, with comma"');
      expect(csvContent).toContain('"Description with\nnewline"');
      expect(csvContent).toContain('"Notes with ""quotes"""');
      expect(csvContent).toContain('"Category ""quoted"""');
    });

    it('should format dates correctly', async () => {
      const mockAccounts: Account[] = [
        { id: 'acc-1', name: 'Account' } as Account,
      ];
      const mockTransactions = [
        {
          id: 'tx-1',
          accountId: 'acc-1',
          description: 'Test',
          amount: 100,
          currency: 'GBP',
          date: new Date('2024-03-25T14:30:00.000Z'),
          categoryId: null,
        },
      ];

      accountsService.findAllUserAccounts.mockResolvedValue(mockAccounts);
      categoriesService.findAllUserCategories.mockResolvedValue([]);
      transactionsService.getAllUserTransactionsForExport.mockResolvedValue(
        mockTransactions as any,
      );

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      await processor.process(job as Job<CsvExportJobData>);

      const csvContent =
        emailService.sendExportCompletionEmail.mock.calls[0][0].csvContent;
      const lines = csvContent.split('\n');
      const dataLine = lines[1];

      expect(dataLine).toContain('2024-03-25');
    });

    it('should handle empty transactions list', async () => {
      accountsService.findAllUserAccounts.mockResolvedValue([]);
      categoriesService.findAllUserCategories.mockResolvedValue([]);
      transactionsService.getAllUserTransactionsForExport.mockResolvedValue([]);

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      await processor.process(job as Job<CsvExportJobData>);

      const csvContent =
        emailService.sendExportCompletionEmail.mock.calls[0][0].csvContent;
      const lines = csvContent.split('\n');

      expect(lines.length).toBe(1); // Only header
      expect(lines[0]).toBe(
        'Date,Account,Description,Amount,Currency,Notes,Category',
      );
    });

    it('should handle missing account and category mappings', async () => {
      accountsService.findAllUserAccounts.mockResolvedValue([]);
      categoriesService.findAllUserCategories.mockResolvedValue([]);

      const mockTransactions = [
        {
          id: 'tx-1',
          accountId: 'unknown-account',
          description: 'Test',
          amount: 100,
          currency: 'GBP',
          date: new Date('2024-01-15'),
          categoryId: 'unknown-category',
        },
      ];

      transactionsService.getAllUserTransactionsForExport.mockResolvedValue(
        mockTransactions as any,
      );

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      await processor.process(job as Job<CsvExportJobData>);

      const csvContent =
        emailService.sendExportCompletionEmail.mock.calls[0][0].csvContent;
      const lines = csvContent.split('\n');
      const dataLine = lines[1];

      // Should use account ID when name not found, and empty string for category
      expect(dataLine).toContain('unknown-account');
    });

    it('should handle fields with leading/trailing whitespace', async () => {
      const mockAccounts: Account[] = [
        { id: 'acc-1', name: '  Account with spaces  ' } as Account,
      ];
      const mockTransactions = [
        {
          id: 'tx-1',
          accountId: 'acc-1',
          description: '  Description  ',
          notes: '  Notes  ',
          amount: 100,
          currency: 'GBP',
          date: new Date('2024-01-15'),
          categoryId: null,
        },
      ];

      accountsService.findAllUserAccounts.mockResolvedValue(mockAccounts);
      categoriesService.findAllUserCategories.mockResolvedValue([]);
      transactionsService.getAllUserTransactionsForExport.mockResolvedValue(
        mockTransactions as any,
      );

      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      await processor.process(job as Job<CsvExportJobData>);

      const csvContent =
        emailService.sendExportCompletionEmail.mock.calls[0][0].csvContent;

      // Fields with leading/trailing whitespace should be quoted
      expect(csvContent).toContain('"  Account with spaces  "');
      expect(csvContent).toContain('"  Description  "');
      expect(csvContent).toContain('"  Notes  "');
    });
  });

  describe('event handlers', () => {
    it('should log on job completion', () => {
      const logSpy = jest.spyOn(processor['logger'], 'log');
      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };

      processor.onCompleted(job as Job<CsvExportJobData>);

      expect(logSpy).toHaveBeenCalledWith('Job job-123 completed successfully');
    });

    it('should log on job failure', () => {
      const errorSpy = jest.spyOn(processor['logger'], 'error');
      const job: Partial<Job<CsvExportJobData>> = {
        id: 'job-123',
        data: {
          userId: mockUserId,
          dto: {},
        },
      };
      const error = new Error('Test error');

      processor.onFailed(job as Job<CsvExportJobData>, error);

      expect(errorSpy).toHaveBeenCalledWith('Job job-123 failed: Test error');
    });
  });
});
