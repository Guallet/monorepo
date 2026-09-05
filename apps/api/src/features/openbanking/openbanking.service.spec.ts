import { Test, TestingModule } from '@nestjs/testing';
import { OpenbankingService } from './openbanking.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObConnection } from './entities/connection.entity.js';
import { NordigenAccount } from './entities/nordigen-account.entity.js';
import { Account } from '../../features/accounts/entities/account.entity.js';
import { Institution } from '../../features/institutions/entities/institution.entity.js';
import { Transaction } from '../../features/transactions/entities/transaction.entity.js';
import { NordigenService } from '../../features/nordigen/nordigen.service.js';
import { NotFoundException } from '@nestjs/common';
import { NordigenRequisitionDto } from '../nordigen/dto/nordigen-requisition.dto.js';

describe('OpenbankingService', () => {
  let service: OpenbankingService;

  const mockObConnectionRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  };

  const mockNordigenAccountRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const mockAccountRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
  };

  const mockInstitutionRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
  };

  const mockTransactionRepository = {
    find: vi.fn(),
    save: vi.fn(),
    upsert: vi.fn(),
  };

  const mockNordigenService = {
    getInstitutions: vi.fn(),
    getAccountMetadata: vi.fn(),
    getAccountDetails: vi.fn(),
    getAccountBalance: vi.fn(),
    getAccountTransactions: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenbankingService,
        {
          provide: getRepositoryToken(ObConnection),
          useValue: mockObConnectionRepository,
        },
        {
          provide: getRepositoryToken(NordigenAccount),
          useValue: mockNordigenAccountRepository,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(Institution),
          useValue: mockInstitutionRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: NordigenService,
          useValue: mockNordigenService,
        },
      ],
    }).compile();

    service = module.get<OpenbankingService>(OpenbankingService);

    // Clear all mocks before each test
    vi.clearAllMocks();
    mockObConnectionRepository.findOne.mockResolvedValue(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailableCountries', () => {
    it('should return list of countries with localized names', () => {
      const result = service.getAvailableCountries('en');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('code');
      expect(result[0]).toHaveProperty('name');
    });

    it('should return different names for different locales', () => {
      const resultEn = service.getAvailableCountries('en');
      const resultEs = service.getAvailableCountries('es');

      expect(resultEn).toBeDefined();
      expect(resultEs).toBeDefined();
      // Names should be different for different locales
      const gbEn = resultEn.find((c) => c.code === 'GB');
      const gbEs = resultEs.find((c) => c.code === 'GB');
      expect(gbEn?.name).not.toBe(gbEs?.name);
    });
  });

  describe('deleteConnection', () => {
    it('should delete a connection and its accounts', async () => {
      const args = {
        user_id: 'user-123',
        connection_id: 'conn-1',
      };

      const mockConnection = {
        id: args.connection_id,
        user_id: args.user_id,
        accounts: ['account-1', 'account-2'],
      };

      mockObConnectionRepository.findOne.mockResolvedValue(mockConnection);
      mockNordigenAccountRepository.delete.mockResolvedValue({});
      mockObConnectionRepository.remove.mockResolvedValue(mockConnection);

      const result = await service.deleteConnection(args);

      expect(result).toBeDefined();
      expect(result.connection_id).toBe(args.connection_id);
      expect(result.accounts).toEqual(['account-1', 'account-2']);
      expect(mockNordigenAccountRepository.delete).toHaveBeenCalledTimes(2);
      expect(mockObConnectionRepository.remove).toHaveBeenCalledWith(
        mockConnection,
      );
    });

    it('should throw NotFoundException if connection not found', async () => {
      const args = {
        user_id: 'user-123',
        connection_id: 'non-existent',
      };

      mockObConnectionRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteConnection(args)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('saveRequisition', () => {
    it('should save a requisition', async () => {
      const userId = 'user-123';
      const requisitionDto = {
        id: 'req-1',
        created: new Date('2024-01-01'),
        redirect: 'http://localhost:3000',
        status: 'LN',
        institution_id: 'inst-1',
        agreement: 'agr-1',
        reference: 'ref-1',
        accounts: ['account-1'],
        user_language: 'en',
        link: 'https://nordigen.com/auth',
        ssn: null,
        account_selection: false,
        redirect_immediate: false,
      } as unknown as NordigenRequisitionDto;

      mockObConnectionRepository.save.mockResolvedValue({});

      await service.saveRequisition(userId, requisitionDto);

      expect(mockObConnectionRepository.save).toHaveBeenCalled();
    });

    it('should not overwrite a requisition owned by another user', async () => {
      mockObConnectionRepository.findOne.mockResolvedValue({
        id: 'req-1',
        user_id: 'another-user',
      });

      await expect(
        service.saveRequisition('user-123', {
          id: 'req-1',
        } as NordigenRequisitionDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockObConnectionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('ownership checks', () => {
    it('should reject account connection before remote calls when it is not owned', async () => {
      mockObConnectionRepository.find.mockResolvedValue([
        { user_id: 'user-123', accounts: ['owned-account'] },
      ]);

      await expect(
        service.connectToAccounts('user-123', ['another-account']),
      ).rejects.toThrow(NotFoundException);
      expect(mockNordigenService.getAccountMetadata).not.toHaveBeenCalled();
    });

    it('should reject account synchronization before remote calls when its linked account is not owned', async () => {
      mockNordigenAccountRepository.findOne.mockResolvedValue({
        id: 'ob-account',
        linked_account_id: 'app-account',
      });
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.syncAccountTransactions('user-123', 'ob-account'),
      ).rejects.toThrow(NotFoundException);
      expect(mockNordigenService.getAccountMetadata).not.toHaveBeenCalled();
    });
  });
});
