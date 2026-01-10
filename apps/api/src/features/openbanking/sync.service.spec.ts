import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NordigenAccount } from './entities/nordigen-account.entity';
import { Account } from 'src/features/accounts/entities/account.entity';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import { NordigenService } from 'src/features/nordigen/nordigen.service';
import { InstitutionsService } from 'src/features/institutions/institutions.service';

describe('SyncService', () => {
  let service: SyncService;

  const mockNordigenAccountRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockAccountRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockTransactionRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockNordigenService = {
    getInstitutions: jest.fn(),
    getAccountMetadata: jest.fn(),
    getAccountBalance: jest.fn(),
    getAccountTransactions: jest.fn(),
  };

  const mockInstitutionsService = {
    createOrUpdate: jest.fn(),
    saveAll: jest.fn(),
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
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);

    // Clear all mocks before each test
    jest.clearAllMocks();
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
