/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import {
  JsonExportJobData,
  JsonExportProcessor,
} from './json-export.processor';
import { TransactionsService } from '../../transactions/transactions.service';
import { AccountsService } from '../../accounts/accounts.service';
import { CategoriesService } from '../../categories/categories.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('JsonExportProcessor', () => {
  let processor: JsonExportProcessor;
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
        JsonExportProcessor,
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

    processor = module.get<JsonExportProcessor>(JsonExportProcessor);
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
  });

  it('exports JSON attachment with mapped account and category names', async () => {
    accountsService.findAllUserAccounts.mockResolvedValue([
      { id: 'account-1', name: 'Checking Account' } as any,
    ]);
    categoriesService.findAllUserCategories.mockResolvedValue([
      { id: 'category-1', name: 'Food' } as any,
    ]);
    transactionsService.getAllUserTransactionsForExport.mockResolvedValue([
      {
        id: 'tx-1',
        accountId: 'account-1',
        description: 'Lunch',
        notes: null,
        amount: '-12.34' as any,
        currency: 'GBP',
        date: new Date('2026-02-01T10:00:00.000Z'),
        categoryId: 'category-1',
      },
    ] as any);

    const job: Partial<Job<JsonExportJobData>> = {
      id: 'job-123',
      data: {
        userId: mockUserId,
        dto: {},
      },
    };

    await expect(
      processor.process(job as Job<JsonExportJobData>),
    ).resolves.toEqual({ transactionCount: 1 });

    expect(emailService.sendExportCompletionEmail).toHaveBeenCalledTimes(1);
    const sentPayload = emailService.sendExportCompletionEmail.mock.calls[0][0];
    expect(sentPayload).toEqual(
      expect.objectContaining({
        to: mockUserEmail,
        userName: mockUserName,
        transactionCount: 1,
        attachmentFilename: expect.stringMatching(/\.json$/),
        exportFormatLabel: 'JSON',
      }),
    );

    const exported = JSON.parse(
      sentPayload.attachmentContent as string,
    ) as any[];
    expect(exported).toEqual([
      {
        id: 'tx-1',
        date: '2026-02-01T10:00:00.000Z',
        account: 'Checking Account',
        description: 'Lunch',
        amount: '-12.34',
        currency: 'GBP',
        notes: '',
        category: 'Food',
      },
    ]);
  });

  it('applies date and account filters to export query', async () => {
    accountsService.findAllUserAccounts.mockResolvedValue([]);
    categoriesService.findAllUserCategories.mockResolvedValue([]);
    transactionsService.getAllUserTransactionsForExport.mockResolvedValue([]);

    const job: Partial<Job<JsonExportJobData>> = {
      id: 'job-124',
      data: {
        userId: mockUserId,
        dto: {
          accounts: ['account-1', 'account-2'],
          startDate: '2026-02-01T03:25:00.000Z',
          endDate: '2026-02-28T12:44:00.000Z',
        },
      },
    };

    await processor.process(job as Job<JsonExportJobData>);

    const callArgs =
      transactionsService.getAllUserTransactionsForExport.mock.calls[0][0];

    expect(callArgs.userId).toBe(mockUserId);
    expect(callArgs.accounts).toEqual(['account-1', 'account-2']);
    expect(callArgs.startDate).toBeInstanceOf(Date);
    expect(callArgs.endDate).toBeInstanceOf(Date);
    expect(callArgs.startDate?.getHours()).toBe(0);
    expect(callArgs.startDate?.getMinutes()).toBe(0);
    expect(callArgs.endDate?.getHours()).toBe(23);
    expect(callArgs.endDate?.getMinutes()).toBe(59);
  });

  it('sends error email and rethrows when export fails', async () => {
    const error = new Error('Database failure');
    accountsService.findAllUserAccounts.mockRejectedValue(error);

    const job: Partial<Job<JsonExportJobData>> = {
      id: 'job-125',
      data: {
        userId: mockUserId,
        dto: {},
      },
    };

    await expect(
      processor.process(job as Job<JsonExportJobData>),
    ).rejects.toThrow('Database failure');

    expect(emailService.sendExportErrorEmail).toHaveBeenCalledWith({
      to: mockUserEmail,
      userName: mockUserName,
      errorMessage: 'Database failure',
    });
  });
});
