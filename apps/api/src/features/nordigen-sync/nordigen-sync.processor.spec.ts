import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NordigenSyncProcessor } from './nordigen-sync.processor';
import { NordigenAccount } from '../openbanking/entities/nordigen-account.entity';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { NordigenUserService } from '../nordigen/nordigen-user.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { NordigenKeysService } from '../nordigen-keys/nordigen-keys.service';
import { UnauthorizedException } from '@nestjs/common';
import { Job } from 'bullmq';

describe('NordigenSyncProcessor', () => {
  let processor: NordigenSyncProcessor;
  let nordigenUserService: jest.Mocked<NordigenUserService>;
  let emailService: jest.Mocked<EmailService>;
  let usersService: jest.Mocked<UsersService>;
  let nordigenKeysService: jest.Mocked<NordigenKeysService>;
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

  const mockNordigenKeysService = {
    findAllKeysWithAccounts: jest.fn(),
    findKeyWithAccountsById: jest.fn(),
    updateSyncStatus: jest.fn(),
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
        {
          provide: NordigenKeysService,
          useValue: mockNordigenKeysService,
        },
      ],
    }).compile();

    processor = module.get<NordigenSyncProcessor>(NordigenSyncProcessor);
    nordigenUserService = module.get(NordigenUserService);
    emailService = module.get(EmailService);
    usersService = module.get(UsersService);
    nordigenKeysService = module.get(NordigenKeysService);
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
    it('should return early if key has no linked accounts', async () => {
      const mockJob = {
        id: 'job-1',
        data: { keyId: 'key-123' },
      } as Job<{ keyId: string }>;

      const mockKey = {
        id: 'key-123',
        user_id: 'user-123',
        secret_id: 'secret-id',
        secret_key: 'secret-key',
        linkedAccounts: [],
      };

      mockNordigenKeysService.findKeyWithAccountsById.mockResolvedValue(mockKey);

      const result = await processor.process(mockJob);

      expect(result.accountsSynced).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should throw error and send email if credentials are invalid', async () => {
      const mockJob = {
        id: 'job-1',
        data: { keyId: 'key-123' },
      } as Job<{ keyId: string }>;

      const mockKey = {
        id: 'key-123',
        user_id: 'user-123',
        secret_id: 'invalid-id',
        secret_key: 'invalid-key',
        linkedAccounts: [{ account_id: 'account-1' }],
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockNordigenKeysService.findKeyWithAccountsById.mockResolvedValue(mockKey);
      mockNordigenUserService.getAccessToken.mockRejectedValue(
        new Error('Invalid credentials'),
      );
      mockUsersService.findUserData.mockResolvedValue(mockUser);
      mockEmailService.sendNordigenCredentialsErrorEmail.mockResolvedValue(
        undefined,
      );
      mockNordigenKeysService.updateSyncStatus.mockResolvedValue(undefined);

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
        data: { keyId: 'key-123' },
      } as Job<{ keyId: string }>;

      const mockKey = {
        id: 'key-123',
        user_id: 'user-123',
        secret_id: 'valid-id',
        secret_key: 'valid-key',
        linkedAccounts: [{ account_id: 'account-1' }],
      };

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

      mockNordigenKeysService.findKeyWithAccountsById.mockResolvedValue(mockKey);
      mockNordigenUserService.getAccessToken.mockResolvedValue('test-token');

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
      mockNordigenKeysService.updateSyncStatus.mockResolvedValue(undefined);

      const result = await processor.process(mockJob);

      expect(result.accountsSynced).toBe(1);
      expect(result.errors).toHaveLength(0);
    });
  });
});
