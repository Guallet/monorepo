/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { ExportDataProcessor, ExportJobData } from './export-data.processor.js';
import { TransactionsService } from '../../transactions/transactions.service.js';
import { AccountsService } from '../../accounts/accounts.service.js';
import { CategoriesService } from '../../categories/categories.service.js';
import { EmailService } from '../../email/email.service.js';
import { UsersService } from '../../users/users.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { CsvExportEngine } from '../engines/csv-export.engine.js';
import { OfeExportEngine } from '../engines/ofe-export.engine.js';
import { JsonExportEngine } from '../engines/json-export.engine.js';
import { Account } from '../../accounts/entities/account.entity.js';
import { Category } from '../../categories/entities/category.entity.js';
import type { Mocked } from 'vitest';

describe('ExportDataProcessor', () => {
  let processor: ExportDataProcessor;
  let transactionsService: Mocked<TransactionsService>;
  let accountsService: Mocked<AccountsService>;
  let categoriesService: Mocked<CategoriesService>;
  let emailService: Mocked<EmailService>;
  let usersService: Mocked<UsersService>;
  let notificationsService: Mocked<NotificationsService>;

  const mockUserId = 'user-123';
  const mockUserEmail = 'test@example.com';
  const mockUserName = 'Test User';

  const mockAccounts: Account[] = [
    { id: 'account-1', name: 'Checking Account', currency: 'GBP' } as Account,
  ];

  const mockCategories: Category[] = [
    { id: 'category-1', name: 'Food' } as Category,
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportDataProcessor,
        CsvExportEngine,
        OfeExportEngine,
        JsonExportEngine,
        {
          provide: TransactionsService,
          useValue: { getAllUserTransactionsForExport: vi.fn() },
        },
        {
          provide: AccountsService,
          useValue: { findAllUserAccounts: vi.fn() },
        },
        {
          provide: CategoriesService,
          useValue: { findAllUserCategories: vi.fn() },
        },
        {
          provide: EmailService,
          useValue: {
            sendExportCompletionEmail: vi.fn(),
            sendExportErrorEmail: vi.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: { findUserData: vi.fn() },
        },
        {
          provide: NotificationsService,
          useValue: { createSystemNotification: vi.fn() },
        },
      ],
    }).compile();

    processor = module.get(ExportDataProcessor);
    transactionsService = module.get(TransactionsService);
    accountsService = module.get(AccountsService);
    categoriesService = module.get(CategoriesService);
    emailService = module.get(EmailService);
    usersService = module.get(UsersService);
    notificationsService = module.get(NotificationsService);

    usersService.findUserData.mockResolvedValue({
      id: mockUserId,
      email: mockUserEmail,
      name: mockUserName,
    } as any);

    notificationsService.createSystemNotification.mockResolvedValue({} as any);
    accountsService.findAllUserAccounts.mockResolvedValue(mockAccounts);
    categoriesService.findAllUserCategories.mockResolvedValue(mockCategories);
    transactionsService.getAllUserTransactionsForExport.mockResolvedValue(
      mockTransactions as any,
    );
  });

  afterEach(() => vi.restoreAllMocks());

  // ── routing ────────────────────────────────────────────────────────────

  it.each<{ format: 'csv' | 'ofe' | 'json'; ext: string; label: string }>([
    { format: 'csv', ext: '.csv', label: 'CSV' },
    { format: 'ofe', ext: '.ofx', label: 'OFX' },
    { format: 'json', ext: '.json', label: 'JSON' },
  ])(
    'routes "$format" jobs to the correct engine and sends email with $ext attachment',
    async ({ format, ext, label }) => {
      const job: Partial<Job<ExportJobData>> = {
        id: `job-${format}`,
        data: { userId: mockUserId, dto: { format } },
      };

      const result = await processor.process(job as Job<ExportJobData>);

      expect(result).toEqual({ transactionCount: 2 });

      const sentPayload =
        emailService.sendExportCompletionEmail.mock.calls[0][0];
      expect(sentPayload.attachmentFilename).toMatch(new RegExp(`\\${ext}$`));
      expect(sentPayload.exportFormatLabel).toBe(label);
      expect(sentPayload.transactionCount).toBe(2);
    },
  );

  it('throws for unsupported format', async () => {
    const job: Partial<Job<ExportJobData>> = {
      id: 'job-bad',
      data: { userId: mockUserId, dto: { format: 'xml' as any } },
    };

    await expect(processor.process(job as Job<ExportJobData>)).rejects.toThrow(
      'Unsupported export format: xml',
    );
  });

  // ── filters ────────────────────────────────────────────────────────────

  it('applies date and account filters', async () => {
    accountsService.findAllUserAccounts.mockResolvedValue([]);
    categoriesService.findAllUserCategories.mockResolvedValue([]);
    transactionsService.getAllUserTransactionsForExport.mockResolvedValue([]);

    const job: Partial<Job<ExportJobData>> = {
      id: 'job-filter',
      data: {
        userId: mockUserId,
        dto: {
          format: 'csv',
          accounts: ['account-1'],
          startDate: '2024-01-01T10:00:00.000Z',
          endDate: '2024-01-31T15:30:00.000Z',
        },
      },
    };

    await processor.process(job as Job<ExportJobData>);

    const callArgs =
      transactionsService.getAllUserTransactionsForExport.mock.calls[0][0];
    expect(callArgs.userId).toBe(mockUserId);
    expect(callArgs.accounts).toEqual(['account-1']);
    expect(callArgs.startDate).toBeInstanceOf(Date);
    expect(callArgs.endDate).toBeInstanceOf(Date);
    expect(callArgs.startDate?.getHours()).toBe(0);
    expect(callArgs.endDate?.getHours()).toBe(23);
  });

  // ── CSV content ────────────────────────────────────────────────────────

  it('generates correct CSV content', async () => {
    const job: Partial<Job<ExportJobData>> = {
      id: 'job-csv-content',
      data: { userId: mockUserId, dto: { format: 'csv' } },
    };

    await processor.process(job as Job<ExportJobData>);

    const content = emailService.sendExportCompletionEmail.mock.calls[0][0]
      .attachmentContent as string;
    expect(content).toContain(
      'Date,Account,Description,Amount,Currency,Notes,Category',
    );
    expect(content).toContain('Checking Account');
    expect(content).toContain('Grocery Store');
    expect(content).toContain('Food');
  });

  // ── OFE content / decimal-string regression ────────────────────────────

  it('handles decimal string amounts in OFE export', async () => {
    transactionsService.getAllUserTransactionsForExport.mockResolvedValue([
      {
        id: 'tx-str',
        accountId: 'account-1',
        description: 'Test',
        amount: '-42.50' as any,
        currency: 'GBP',
        date: new Date('2024-06-01'),
      },
    ] as any);

    const job: Partial<Job<ExportJobData>> = {
      id: 'job-ofe-dec',
      data: { userId: mockUserId, dto: { format: 'ofe' } },
    };

    await processor.process(job as Job<ExportJobData>);

    const content = emailService.sendExportCompletionEmail.mock.calls[0][0]
      .attachmentContent as string;
    expect(content).toContain('<TRNAMT>-42.50</TRNAMT>');
    expect(content).toContain('<TRNTYPE>DEBIT</TRNTYPE>');
  });

  // ── error path ─────────────────────────────────────────────────────────

  it('sends error email and notification, then rethrows', async () => {
    const error = new Error('Database failure');
    accountsService.findAllUserAccounts.mockRejectedValue(error);

    const job: Partial<Job<ExportJobData>> = {
      id: 'job-err',
      data: { userId: mockUserId, dto: { format: 'csv' } },
    };

    await expect(processor.process(job as Job<ExportJobData>)).rejects.toThrow(
      'Database failure',
    );

    expect(emailService.sendExportErrorEmail).toHaveBeenCalledWith(
      expect.objectContaining({ errorMessage: 'Database failure' }),
    );
    expect(notificationsService.createSystemNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        message: 'Export data finished with error',
      }),
    );
  });

  // ── no-email edge case ─────────────────────────────────────────────────

  it('skips email when user has no email address', async () => {
    usersService.findUserData.mockResolvedValue({
      id: mockUserId,
      email: null,
      name: mockUserName,
    } as any);

    const job: Partial<Job<ExportJobData>> = {
      id: 'job-no-email',
      data: { userId: mockUserId, dto: { format: 'csv' } },
    };

    await processor.process(job as Job<ExportJobData>);

    expect(emailService.sendExportCompletionEmail).not.toHaveBeenCalled();
  });
});
