/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { OfeExportJobData, OfeExportProcessor } from './ofe-export.processor';
import { TransactionsService } from '../../transactions/transactions.service';
import { AccountsService } from '../../accounts/accounts.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('OfeExportProcessor', () => {
  let processor: OfeExportProcessor;
  let transactionsService: jest.Mocked<TransactionsService>;
  let accountsService: jest.Mocked<AccountsService>;
  let emailService: jest.Mocked<EmailService>;
  let usersService: jest.Mocked<UsersService>;

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
        OfeExportProcessor,
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
        {
          provide: AccountsService,
          useValue: mockAccountsService,
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

    processor = module.get<OfeExportProcessor>(OfeExportProcessor);
    transactionsService = module.get(TransactionsService);
    accountsService = module.get(AccountsService);
    emailService = module.get(EmailService);
    usersService = module.get(UsersService);

    usersService.findUserData.mockResolvedValue({
      id: mockUserId,
      email: mockUserEmail,
      name: mockUserName,
    } as any);

    mockNotificationsService.createSystemNotification.mockResolvedValue(
      {} as any,
    );
  });

  it('handles decimal string amounts when generating OFX export', async () => {
    accountsService.findAllUserAccounts.mockResolvedValue([
      {
        id: 'account-1',
        name: 'Checking Account',
      } as any,
    ]);

    transactionsService.getAllUserTransactionsForExport.mockResolvedValue([
      {
        id: 'tx-1',
        accountId: 'account-1',
        description: 'Coffee',
        notes: 'Morning',
        amount: '-12.345' as any,
        currency: 'GBP',
        date: new Date('2026-02-01T10:00:00.000Z'),
      },
    ] as any);

    const job: Partial<Job<OfeExportJobData>> = {
      id: 'job-123',
      data: {
        userId: mockUserId,
        dto: {},
      },
    };

    await expect(
      processor.process(job as Job<OfeExportJobData>),
    ).resolves.toEqual({ transactionCount: 1 });

    expect(emailService.sendExportCompletionEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendExportCompletionEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockUserEmail,
        userName: mockUserName,
        transactionCount: 1,
        attachmentContent: expect.stringContaining('<TRNTYPE>DEBIT</TRNTYPE>'),
      }),
    );

    const sentEmailPayload =
      emailService.sendExportCompletionEmail.mock.calls[0][0];
    expect(sentEmailPayload.attachmentContent).toContain(
      '<TRNAMT>-12.35</TRNAMT>',
    );
  });
});
