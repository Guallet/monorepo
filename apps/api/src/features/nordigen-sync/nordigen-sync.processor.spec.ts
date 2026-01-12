import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NordigenSyncProcessor } from './nordigen-sync.processor';
import { NordigenAccount } from '../openbanking/entities/nordigen-account.entity';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { NordigenUserService } from '../nordigen/nordigen-user.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { Job } from 'bullmq';

describe('NordigenSyncProcessor', () => {
  let processor: NordigenSyncProcessor;
  let nordigenUserService: jest.Mocked<NordigenUserService>;
  let emailService: jest.Mocked<EmailService>;
  let usersService: jest.Mocked<UsersService>;
  let nordigenAccountsRepository: jest.Mocked<any>;
  let accountsRepository: jest.Mocked<any>;

  const mockNordigenAccountsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAccountsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockTransactionsRepository = {
    upsert: jest.fn(),
  };

  const mockNordigenUserService = {
    getAccessToken: jest.fn(),
    getAccountMetadata: jest.fn(),
    getAccountDetails: jest.fn(),
    getAccountBalance: jest.fn(),
    getAccountTransactions: jest.fn(),
  };

  const mockEmailService = {
    sendNordigenCredentialsErrorEmail: jest.fn(),
  };

  const mockUsersService = {
    findUserData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NordigenSyncProcessor,
        {
          provide: getRepositoryToken(NordigenAccount),
          useValue: mockNordigenAccountsRepository,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountsRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionsRepository,
        },
        {
          provide: NordigenUserService,
          useValue: mockNordigenUserService,
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

    processor = module.get<NordigenSyncProcessor>(NordigenSyncProcessor);
    nordigenUserService = module.get(NordigenUserService);
    emailService = module.get(EmailService);
    usersService = module.get(UsersService);
    nordigenAccountsRepository = module.get(
      getRepositoryToken(NordigenAccount),
    );
    accountsRepository = module.get(getRepositoryToken(Account));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should return early if user has no Nordigen credentials', async () => {
      const mockJob = {
        id: 'job-1',
        data: { userId: 'user-123' },
      } as Job<{ userId: string }>;

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        nordigen_secret_id: null,
        nordigen_secret_key: null,
      };

      mockUsersService.findUserData.mockResolvedValue(mockUser);

      const result = await processor.process(mockJob);

      expect(result.accountsSynced).toBe(0);
      expect(result.errors).toContain('No Nordigen credentials found');
    });

    it('should throw error and send email if credentials are invalid', async () => {
      const mockJob = {
        id: 'job-1',
        data: { userId: 'user-123' },
      } as Job<{ userId: string }>;

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        nordigen_secret_id: 'invalid-id',
        nordigen_secret_key: 'invalid-key',
      };

      mockUsersService.findUserData.mockResolvedValue(mockUser);
      mockNordigenUserService.getAccessToken.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );
      mockEmailService.sendNordigenCredentialsErrorEmail.mockResolvedValue(
        undefined,
      );

      await expect(processor.process(mockJob)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(
        mockEmailService.sendNordigenCredentialsErrorEmail,
      ).toHaveBeenCalledWith({
        to: 'test@example.com',
        userName: 'Test User',
      });
    });

    it('should successfully sync accounts', async () => {
      const mockJob = {
        id: 'job-1',
        data: { userId: 'user-123' },
      } as Job<{ userId: string }>;

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        nordigen_secret_id: 'valid-id',
        nordigen_secret_key: 'valid-key',
      };

      const mockAccounts = [
        { id: 'account-1', user_id: 'user-123' },
        { id: 'account-2', user_id: 'user-123' },
      ];

      const mockNordigenAccounts = [
        {
          id: 'nordigen-1',
          linked_account_id: 'account-1',
          metadata_status: 'READY',
        },
      ];

      const mockGualletAccount = {
        id: 'account-1',
        balance: 100,
      };

      mockUsersService.findUserData.mockResolvedValue(mockUser);
      mockNordigenUserService.getAccessToken.mockResolvedValue('test-token');
      mockAccountsRepository.find.mockResolvedValue(mockAccounts);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockNordigenAccounts),
      };
      mockNordigenAccountsRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      mockAccountsRepository.findOne.mockResolvedValue(mockGualletAccount);
      mockNordigenUserService.getAccountMetadata.mockResolvedValue({
        id: 'nordigen-1',
        status: 'READY',
      });
      mockNordigenUserService.getAccountDetails.mockResolvedValue({
        status: 'enabled',
      });
      mockNordigenUserService.getAccountBalance.mockResolvedValue([
        {
          balanceType: 'closingAvailable',
          balanceAmount: { amount: '150.00', currency: 'GBP' },
        },
      ]);
      mockNordigenUserService.getAccountTransactions.mockResolvedValue([]);
      mockNordigenAccountsRepository.save.mockResolvedValue({});
      mockAccountsRepository.save.mockResolvedValue({});
      mockTransactionsRepository.upsert.mockResolvedValue({});

      const result = await processor.process(mockJob);

      expect(result.accountsSynced).toBe(1);
      expect(result.errors).toHaveLength(0);
    });
  });
});
