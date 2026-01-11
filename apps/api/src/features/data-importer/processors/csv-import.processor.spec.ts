/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CsvImportProcessor } from './csv-import.processor';
import { AccountsService } from '../../accounts/accounts.service';
import { CategoriesService } from '../../categories/categories.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { CsvImportRequestDto } from '../dto/csv-import-request.dto';
import { Account } from '../../accounts/entities/account.entity';
import { Category } from '../../categories/entities/category.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

describe('CsvImportProcessor', () => {
  let processor: CsvImportProcessor;
  let accountsService: jest.Mocked<AccountsService>;
  let categoriesService: jest.Mocked<CategoriesService>;
  let emailService: jest.Mocked<EmailService>;
  let usersService: jest.Mocked<UsersService>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;

  const mockUserId = 'user-123';
  const mockUserEmail = 'test@example.com';

  beforeEach(async () => {
    transactionRepository = {
      save: jest.fn(),
    } as any;

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue(transactionRepository),
      },
    } as any;

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    const mockAccountsService = {
      create: jest.fn(),
      findByUserIdAndName: jest.fn(),
      findOneById: jest.fn(),
    };

    const mockCategoriesService = {
      create: jest.fn(),
      findByUserIdAndName: jest.fn(),
    };

    const mockEmailService = {
      sendImportCompletionEmail: jest.fn(),
      sendImportErrorEmail: jest.fn(),
    };

    const mockUsersService = {
      findUserData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvImportProcessor,
        {
          provide: DataSource,
          useValue: mockDataSource,
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
      ],
    }).compile();

    processor = module.get<CsvImportProcessor>(CsvImportProcessor);
    accountsService = module.get(AccountsService);
    categoriesService = module.get(CategoriesService);
    emailService = module.get(EmailService);
    usersService = module.get(UsersService);

    // Mock user lookup
    usersService.findUserData.mockResolvedValue({
      id: mockUserId,
      email: mockUserEmail,
      name: 'Test User',
    } as any);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('process', () => {
    it('should successfully process valid CSV data', async () => {
      const mockAccount = {
        id: 'account-123',
        name: 'Test Account',
        currency: 'USD',
      } as Account;

      const dto: CsvImportRequestDto = {
        csvData: [
          {
            date: '2024-01-01',
            amount: '100.00',
            description: 'Test transaction',
            account: 'Test Account',
            notes: 'Test notes',
            category: 'Food',
          },
        ],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {
          'Test Account': {
            id: 'account-123',
            name: 'Test Account',
            shouldCreate: false,
          },
        },
        categoryMappings: {
          Food: {
            id: 'category-123',
            name: 'Food',
            shouldCreate: false,
          },
        },
      };

      const mockJob = {
        id: 'job-123',
        data: { userId: mockUserId, dto },
        updateProgress: jest.fn(),
      } as unknown as Job;

      accountsService.findOneById.mockResolvedValue(mockAccount);
      transactionRepository.save.mockResolvedValue([{ id: 'tx-123' }] as any);

      const result = await processor.process(mockJob);

      expect(result).toEqual({ processed: 1, failed: 0 });
      expect(emailService.sendImportCompletionEmail).toHaveBeenCalledWith({
        to: mockUserEmail,
        userName: 'Test User',
        processedCount: 1,
        failedCount: 0,
      });
    });

    it('should create new accounts when shouldCreate is true', async () => {
      const mockAccount = {
        id: 'new-account-123',
        name: 'New Account',
        currency: 'USD',
      } as Account;

      const dto: CsvImportRequestDto = {
        csvData: [
          {
            date: '2024-01-01',
            amount: '50.00',
            description: 'Test',
            account: 'New Account',
            notes: '',
            category: '',
          },
        ],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {
          'New Account': {
            name: 'New Account',
            shouldCreate: true,
          },
        },
        categoryMappings: {},
      };

      const mockJob = {
        id: 'job-123',
        data: { userId: mockUserId, dto },
        updateProgress: jest.fn(),
      } as unknown as Job;

      accountsService.create.mockResolvedValue(mockAccount);
      accountsService.findOneById.mockResolvedValue(mockAccount);
      transactionRepository.save.mockResolvedValue([{ id: 'tx-123' }] as any);

      const result = await processor.process(mockJob);

      expect(accountsService.create).toHaveBeenCalledWith({
        user_id: mockUserId,
        dto: {
          name: 'New Account',
          type: 'CURRENT',
          source: 'CSV_IMPORT',
          currency: 'GBP',
        },
      });
      expect(result.processed).toBe(1);
    });

    it('should create new categories when shouldCreate is true', async () => {
      const mockAccount = {
        id: 'account-123',
        name: 'Test Account',
        currency: 'USD',
      } as Account;

      const mockCategory = {
        id: 'new-category-123',
        name: 'New Category',
      } as Category;

      const dto: CsvImportRequestDto = {
        csvData: [
          {
            date: '2024-01-01',
            amount: '75.00',
            description: 'Test',
            account: 'Test Account',
            notes: '',
            category: 'New Category',
          },
        ],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {
          'Test Account': {
            id: 'account-123',
            name: 'Test Account',
            shouldCreate: false,
          },
        },
        categoryMappings: {
          'New Category': {
            name: 'New Category',
            shouldCreate: true,
          },
        },
      };

      const mockJob = {
        id: 'job-123',
        data: { userId: mockUserId, dto },
        updateProgress: jest.fn(),
      } as unknown as Job;

      accountsService.findOneById.mockResolvedValue(mockAccount);
      categoriesService.create.mockResolvedValue(mockCategory);
      transactionRepository.save.mockResolvedValue([{ id: 'tx-123' }] as any);

      const result = await processor.process(mockJob);

      expect(categoriesService.create).toHaveBeenCalledWith({
        user_id: mockUserId,
        dto: {
          name: 'New Category',
          icon: 'tag',
          colour: '#999999',
          parentId: null,
        },
      });
      expect(result.processed).toBe(1);
    });

    it('should skip rows with invalid date', async () => {
      const mockAccount = {
        id: 'account-123',
        name: 'Test Account',
        currency: 'USD',
      } as Account;

      const dto: CsvImportRequestDto = {
        csvData: [
          {
            date: 'invalid-date',
            amount: '100.00',
            description: 'Test',
            account: 'Test Account',
            notes: '',
            category: '',
          },
        ],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {
          'Test Account': {
            id: 'account-123',
            name: 'Test Account',
            shouldCreate: false,
          },
        },
        categoryMappings: {},
      };

      const mockJob = {
        id: 'job-123',
        data: { userId: mockUserId, dto },
        updateProgress: jest.fn(),
      } as unknown as Job;

      accountsService.findOneById.mockResolvedValue(mockAccount);

      const result = await processor.process(mockJob);

      expect(result).toEqual({ processed: 0, failed: 1 });
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });

    it('should skip rows with invalid amount', async () => {
      const mockAccount = {
        id: 'account-123',
        name: 'Test Account',
        currency: 'USD',
      } as Account;

      const dto: CsvImportRequestDto = {
        csvData: [
          {
            date: '2024-01-01',
            amount: 'not-a-number',
            description: 'Test',
            account: 'Test Account',
            notes: '',
            category: '',
          },
        ],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {
          'Test Account': {
            id: 'account-123',
            name: 'Test Account',
            shouldCreate: false,
          },
        },
        categoryMappings: {},
      };

      const mockJob = {
        id: 'job-123',
        data: { userId: mockUserId, dto },
        updateProgress: jest.fn(),
      } as unknown as Job;

      accountsService.findOneById.mockResolvedValue(mockAccount);

      const result = await processor.process(mockJob);

      expect(result).toEqual({ processed: 0, failed: 1 });
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });

    it('should handle multiple transactions in batches', async () => {
      const mockAccount = {
        id: 'account-123',
        name: 'Test Account',
        currency: 'USD',
      } as Account;

      // Create 200 rows to test batching (batch size is 150)
      const csvData = Array.from({ length: 200 }, (_, i) => ({
        date: '2024-01-01',
        amount: `${i + 1}.00`,
        description: `Transaction ${i + 1}`,
        account: 'Test Account',
        notes: '',
        category: '',
      }));

      const dto: CsvImportRequestDto = {
        csvData,
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {
          'Test Account': {
            id: 'account-123',
            name: 'Test Account',
            shouldCreate: false,
          },
        },
        categoryMappings: {},
      };

      const mockJob = {
        id: 'job-123',
        data: { userId: mockUserId, dto },
        updateProgress: jest.fn(),
      } as unknown as Job;

      accountsService.findOneById.mockResolvedValue(mockAccount);
      transactionRepository.save.mockResolvedValue(
        Array.from({ length: 150 }, (_, i) => ({ id: `tx-${i}` })) as any,
      );

      const result = await processor.process(mockJob);

      expect(result.processed).toBe(200);
      expect(result.failed).toBe(0);
      // Should be called twice: once for first 150, once for remaining 50
      expect(transactionRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should handle error during account creation and continue', async () => {
      const dto: CsvImportRequestDto = {
        csvData: [
          {
            date: '2024-01-01',
            amount: '100',
            description: 'Test',
            account: 'Test',
            notes: '',
            category: '',
          },
        ],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {
          Test: {
            name: 'Test',
            shouldCreate: true,
          },
        },
        categoryMappings: {},
      };

      const mockJob = {
        id: 'job-123',
        data: { userId: mockUserId, dto },
        updateProgress: jest.fn(),
      } as unknown as Job;

      const error = new Error('Database connection failed');
      accountsService.create.mockRejectedValue(error);

      // Account creation fails, but processor continues and counts transaction as failed
      const result = await processor.process(mockJob);

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);
      expect(emailService.sendImportCompletionEmail).toHaveBeenCalledWith({
        to: mockUserEmail,
        userName: 'Test User',
        processedCount: 0,
        failedCount: 1,
      });
    });

    it('should rollback transaction on batch insert failure', async () => {
      const mockAccount = {
        id: 'account-123',
        name: 'Test Account',
        currency: 'USD',
      } as Account;

      const dto: CsvImportRequestDto = {
        csvData: [
          {
            date: '2024-01-01',
            amount: '100.00',
            description: 'Test',
            account: 'Test Account',
            notes: '',
            category: '',
          },
        ],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {
          'Test Account': {
            id: 'account-123',
            name: 'Test Account',
            shouldCreate: false,
          },
        },
        categoryMappings: {},
      };

      const mockJob = {
        id: 'job-123',
        data: { userId: mockUserId, dto },
        updateProgress: jest.fn(),
      } as unknown as Job;

      accountsService.findOneById.mockResolvedValue(mockAccount);
      transactionRepository.save.mockRejectedValue(new Error('Insert failed'));

      const result = await processor.process(mockJob);

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should handle missing account mapping', async () => {
      const dto: CsvImportRequestDto = {
        csvData: [
          {
            date: '2024-01-01',
            amount: '100.00',
            description: 'Test',
            account: 'Unknown Account',
            notes: '',
            category: '',
          },
        ],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {},
        categoryMappings: {},
      };

      const mockJob = {
        id: 'job-123',
        data: { userId: mockUserId, dto },
        updateProgress: jest.fn(),
      } as unknown as Job;

      const result = await processor.process(mockJob);

      expect(result).toEqual({ processed: 0, failed: 1 });
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });

    it('should process transactions without categories', async () => {
      const mockAccount = {
        id: 'account-123',
        name: 'Test Account',
        currency: 'USD',
      } as Account;

      const dto: CsvImportRequestDto = {
        csvData: [
          {
            date: '2024-01-01',
            amount: '100.00',
            description: 'Test transaction',
            account: 'Test Account',
            notes: 'Test notes',
            category: '',
          },
        ],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {
          'Test Account': {
            id: 'account-123',
            name: 'Test Account',
            shouldCreate: false,
          },
        },
        categoryMappings: {},
      };

      const mockJob = {
        id: 'job-123',
        data: { userId: mockUserId, dto },
        updateProgress: jest.fn(),
      } as unknown as Job;

      accountsService.findOneById.mockResolvedValue(mockAccount);
      transactionRepository.save.mockResolvedValue([{ id: 'tx-123' }] as any);

      const result = await processor.process(mockJob);

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(transactionRepository.save).toHaveBeenCalled();
    });
  });
});
