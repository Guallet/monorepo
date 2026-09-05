import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NordigenAccount } from './entities/nordigen-account.entity.js';
import { Account } from '../../features/accounts/entities/account.entity.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';
import { NordigenService } from '../../features/nordigen/nordigen.service.js';
import { InstitutionsService } from '../../features/institutions/institutions.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

describe('SyncService', () => {
  let service: SyncService;

  const mockNordigenAccountRepository = {
    find: vi.fn(),
    save: vi.fn(),
  };

  const mockAccountRepository = {
    find: vi.fn(),
    save: vi.fn(),
  };

  const mockTransactionRepository = {
    find: vi.fn(),
    save: vi.fn(),
  };

  const mockNordigenService = {
    getInstitutions: vi.fn(),
    getAccountMetadata: vi.fn(),
    getAccountBalance: vi.fn(),
    getAccountTransactions: vi.fn(),
  };

  const mockInstitutionsService = {
    createOrUpdate: vi.fn(),
    saveAll: vi.fn(),
  };

  const mockNotificationsService = {
    createSystemNotification: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: getRepositoryToken(NordigenAccount),
          useValue: mockNordigenAccountRepository,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: NordigenService,
          useValue: mockNordigenService,
        },
        {
          provide: InstitutionsService,
          useValue: mockInstitutionsService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncOpenBankingInstitutionsFromNordigen', () => {
    it('should sync institutions for supported countries', async () => {
      const mockInstitutions = [
        {
          id: 'inst-1',
          name: 'Test Bank',
          logo: 'http://example.com/logo.png',
          countries: ['GB'],
        },
      ];

      mockNordigenService.getInstitutions.mockResolvedValue(mockInstitutions);
      mockInstitutionsService.saveAll.mockResolvedValue({});

      await service.syncOpenBankingInstitutionsFromNordigen();

      // Should be called for each supported country
      expect(mockNordigenService.getInstitutions).toHaveBeenCalled();
      expect(mockInstitutionsService.saveAll).toHaveBeenCalled();
    });

    it('should handle empty institutions list', async () => {
      mockNordigenService.getInstitutions.mockResolvedValue([]);
      mockInstitutionsService.saveAll.mockResolvedValue({});

      await service.syncOpenBankingInstitutionsFromNordigen();

      expect(mockNordigenService.getInstitutions).toHaveBeenCalled();
    });
  });

  describe('syncConnectedAccounts', () => {
    it('should sync connected accounts', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          nordigen_account_id: 'nord-1',
        },
      ];

      mockNordigenAccountRepository.find.mockResolvedValue(mockAccounts);
      mockNordigenService.getAccountMetadata.mockResolvedValue({
        status: 'READY',
      });
      mockNordigenService.getAccountBalance.mockResolvedValue([
        {
          balanceAmount: { amount: '1000', currency: 'GBP' },
        },
      ]);
      mockNordigenService.getAccountTransactions.mockResolvedValue([]);
      mockAccountRepository.find.mockResolvedValue([]);

      const result = await service.syncConnectedAccounts();

      expect(result).toBeDefined();
      expect(result.accounts_synced).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should track errors during sync', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          nordigen_account_id: 'nord-1',
        },
      ];

      mockNordigenAccountRepository.find.mockResolvedValue(mockAccounts);
      mockNordigenService.getAccountMetadata.mockRejectedValue(
        new Error('API Error'),
      );

      const result = await service.syncConnectedAccounts();

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
