import { Test, TestingModule } from '@nestjs/testing';
import { ObConnectionsController } from './ObConnections.controller.js';
import { OpenbankingService } from './openbanking.service.js';
import { NordigenService } from '../../features/nordigen/nordigen.service.js';
import { InstitutionsService } from '../../features/institutions/institutions.service.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('ObConnectionsController', () => {
  let controller: ObConnectionsController;

  const mockOpenbankingService = {
    getAvailableCountries: jest.fn(),
    getConnections: jest.fn(),
    getConnection: jest.fn(),
    deleteConnection: jest.fn(),
    saveRequisition: jest.fn(),
    updateRequisition: jest.fn(),
    connectToAccounts: jest.fn(),
    syncAccountTransactions: jest.fn(),
  };

  const mockNordigenService = {
    getInstitutions: jest.fn(),
    getRequisition: jest.fn(),
    deleteRequisition: jest.fn(),
    createRequisition: jest.fn(),
    getAccountMetadata: jest.fn(),
    getAccountDetails: jest.fn(),
  };

  const mockInstitutionsService = {
    findOneByNordigenId: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObConnectionsController],
      providers: [
        {
          provide: OpenbankingService,
          useValue: mockOpenbankingService,
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

    controller = module.get<ObConnectionsController>(ObConnectionsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
    mockOpenbankingService.getConnection.mockResolvedValue({
      id: 'conn-1',
      created: new Date('2024-01-01'),
      redirect: 'https://example.com/callback',
      status: 'LN',
      institution_id: 'inst-1',
      agreement: 'agreement-1',
      reference: 'reference-1',
      accounts: [],
      user_language: null,
      link: 'https://example.com/connect',
      account_selection: false,
      redirect_immediate: false,
      updated_at: new Date('2024-01-02'),
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCountries', () => {
    it('should return available countries', () => {
      const mockCountries = [
        { code: 'GB', name: 'United Kingdom' },
        { code: 'DE', name: 'Germany' },
      ];

      mockOpenbankingService.getAvailableCountries.mockReturnValue(
        mockCountries,
      );

      const result = controller.getCountries('en');

      expect(result).toEqual(mockCountries);
      expect(mockOpenbankingService.getAvailableCountries).toHaveBeenCalledWith(
        'en',
      );
    });

    it('should use default language if not provided', () => {
      mockOpenbankingService.getAvailableCountries.mockReturnValue([]);

      controller.getCountries();

      expect(mockOpenbankingService.getAvailableCountries).toHaveBeenCalledWith(
        'en',
      );
    });
  });

  describe('getInstitutions', () => {
    it('should return institutions for a country', async () => {
      const country = 'GB';
      const mockInstitutions = [{ id: 'inst-1', name: 'Test Bank' }];

      mockNordigenService.getInstitutions.mockResolvedValue(mockInstitutions);

      const result = await controller.getInstitutions(country);

      expect(result).toEqual(mockInstitutions);
      expect(mockNordigenService.getInstitutions).toHaveBeenCalledWith(country);
    });
  });

  describe('getInstitution', () => {
    it('should return a specific institution', async () => {
      const institutionId = 'inst-1';
      const mockInstitution = {
        id: institutionId,
        name: 'Test Bank',
      };

      mockInstitutionsService.findOneByNordigenId.mockResolvedValue(
        mockInstitution,
      );

      const result = await controller.getInstitution(institutionId);

      expect(result).toEqual(mockInstitution);
    });

    it('should throw NotFoundException if institution not found', async () => {
      const institutionId = 'non-existent';

      mockInstitutionsService.findOneByNordigenId.mockResolvedValue(null);

      await expect(controller.getInstitution(institutionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getConnectionDetails', () => {
    it('should return connection details', async () => {
      const connectionId = 'conn-1';

      const result = await controller.getConnectionDetails(
        mockUser,
        connectionId,
      );

      expect(result).toEqual(
        expect.objectContaining({ id: connectionId, status: 'LN' }),
      );
      expect(result).not.toHaveProperty('user_id');
      expect(mockOpenbankingService.getConnection).toHaveBeenCalledWith(
        mockUser.id,
        connectionId,
      );
    });

    it('should throw NotFoundException if connection not found', async () => {
      const connectionId = 'non-existent';

      mockOpenbankingService.getConnection.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.getConnectionDetails(mockUser, connectionId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteConnection', () => {
    it('should delete a connection', async () => {
      const connectionId = 'conn-1';
      const mockResponse = { summary: 'Requisition deleted' };
      const mockDeleteResult = {
        connection_id: connectionId,
        accounts: [],
      };

      mockNordigenService.deleteRequisition.mockResolvedValue(mockResponse);
      mockOpenbankingService.deleteConnection.mockResolvedValue(
        mockDeleteResult,
      );

      const result = await controller.deleteConnection(mockUser, connectionId);

      expect(result).toEqual(mockDeleteResult);
      expect(mockNordigenService.deleteRequisition).toHaveBeenCalledWith(
        connectionId,
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      const connectionId = 'conn-1';

      mockNordigenService.deleteRequisition.mockRejectedValue(
        new Error('API Error'),
      );

      await expect(
        controller.deleteConnection(mockUser, connectionId),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should not call Nordigen when the connection is not owned', async () => {
      mockOpenbankingService.getConnection.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.deleteConnection(mockUser, 'conn-2'),
      ).rejects.toThrow(NotFoundException);
      expect(mockNordigenService.deleteRequisition).not.toHaveBeenCalled();
    });
  });

  describe('getConnections', () => {
    it('should return user connections', async () => {
      const mockConnections = [
        {
          id: 'conn-1',
          created: new Date('2024-01-01'),
          redirect: 'https://example.com/callback',
          status: 'LN',
          institution_id: 'inst-1',
          agreement: 'agreement-1',
          reference: 'reference-1',
          accounts: [],
          user_language: null,
          link: 'https://example.com/connect',
          account_selection: false,
          redirect_immediate: false,
          updated_at: new Date('2024-01-02'),
          user_id: mockUser.id,
        },
      ];

      mockOpenbankingService.getConnections.mockResolvedValue(mockConnections);

      const result = await controller.getConnections(mockUser);

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('user_id');
      expect(mockOpenbankingService.getConnections).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  describe('create', () => {
    it('should create a new connection', async () => {
      const createDto = {
        institution_id: 'inst-1',
        redirect_to: 'http://localhost:3000/callback',
      };

      const mockRequisition = {
        id: 'req-1',
        link: 'https://nordigen.com/auth',
        institution_id: createDto.institution_id,
      };

      mockNordigenService.createRequisition.mockResolvedValue(mockRequisition);
      mockOpenbankingService.saveRequisition.mockResolvedValue(undefined);

      const result = await controller.create(mockUser, createDto);

      expect(result).toEqual({
        link: mockRequisition.link,
        institution_id: mockRequisition.institution_id,
      });
    });
  });

  describe('connectToAccount', () => {
    it('should connect to accounts', async () => {
      const connectDto = {
        account_ids: ['account-1', 'account-2'],
      };

      const mockResult = {
        accounts_count: connectDto.account_ids.length,
      };

      mockOpenbankingService.connectToAccounts.mockResolvedValue(mockResult);

      const result = await controller.connectToAccount(mockUser, connectDto);

      expect(result).toEqual(mockResult);
      expect(mockOpenbankingService.connectToAccounts).toHaveBeenCalledWith(
        mockUser.id,
        connectDto.account_ids,
      );
    });
  });

  describe('getObAccountTransactions', () => {
    it('should sync account transactions', async () => {
      const accountId = 'account-1';
      mockOpenbankingService.syncAccountTransactions.mockResolvedValue(
        undefined,
      );

      const result = await controller.getObAccountTransactions(
        mockUser,
        accountId,
      );

      expect(result).toEqual({ account_id: accountId, synced: true });
      expect(
        mockOpenbankingService.syncAccountTransactions,
      ).toHaveBeenCalledWith(mockUser.id, accountId);
    });

    it('should throw error if sync fails', async () => {
      const accountId = 'account-1';

      mockOpenbankingService.syncAccountTransactions.mockRejectedValue(
        new Error('Sync failed'),
      );

      await expect(
        controller.getObAccountTransactions(mockUser, accountId),
      ).rejects.toThrow();
    });
  });

  describe('getObAccounts', () => {
    it('should return accounts for a connection', async () => {
      const requisitionId = 'req-1';
      const mockRequisition = {
        id: requisitionId,
        accounts: ['account-1', 'account-2'],
      };

      const mockAccountMetadata = {
        id: 'account-1',
        status: 'READY',
      };

      const mockAccountDetails = {
        iban: 'GB00TEST1234567890',
        currency: 'GBP',
      };

      mockNordigenService.getRequisition.mockResolvedValue(mockRequisition);
      mockOpenbankingService.updateRequisition.mockResolvedValue(undefined);
      mockNordigenService.getAccountMetadata.mockResolvedValue(
        mockAccountMetadata,
      );
      mockNordigenService.getAccountDetails.mockResolvedValue(
        mockAccountDetails,
      );

      const result = await controller.getObAccounts(mockUser, requisitionId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
