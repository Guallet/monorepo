/* oxlint-disable typescript/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { NordigenService } from './nordigen.service';
import { HttpService } from '@nestjs/axios';
import { NordigenRepository } from './nordigen.repository';
import { NordigenCredentials } from './entities/nordigen-credentials.entity';
import { AiCredentialEncryptionService } from 'src/features/ai/ai-credential-encryption.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('NordigenService', () => {
  let service: NordigenService;

  const mockHttpService = {
    get: vi.fn(),
    post: vi.fn(),
  };

  const mockNordigenRepository = {
    getToken: vi.fn(),
    createToken: vi.fn(),
    updateToken: vi.fn(),
    deleteUserToken: vi.fn(),
  };

  const mockCredentialsRepository = {
    createQueryBuilder: vi.fn(() => ({
      addSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue({
        encrypted_credentials: 'encrypted-credentials',
      }),
    })),
  };

  const mockCipher = {
    decrypt: vi.fn().mockReturnValue(
      JSON.stringify({
        secretId: 'test-secret-id',
        secretKey: 'test-secret-key',
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NordigenService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: NordigenRepository,
          useValue: mockNordigenRepository,
        },
        {
          provide: getRepositoryToken(NordigenCredentials),
          useValue: mockCredentialsRepository,
        },
        {
          provide: AiCredentialEncryptionService,
          useValue: mockCipher,
        },
      ],
    }).compile();

    service = module.get<NordigenService>(NordigenService);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInstitutions', () => {
    it('should return institutions for a country code', async () => {
      const countryCode = 'GB';
      const mockInstitutions = [
        {
          id: 'institution-1',
          name: 'Test Bank',
          bic: 'TESTBIC',
          transaction_total_days: '90',
          countries: ['GB'],
          logo: 'http://example.com/logo.png',
        },
      ];

      const mockResponse: AxiosResponse = {
        data: mockInstitutions,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      // Mock the token retrieval
      const mockToken = {
        id: 1,
        access: 'test-access-token',
        access_expires_on: new Date(Date.now() + 3600000), // 1 hour from now
        refresh: 'test-refresh-token',
        refresh_expires_on: new Date(Date.now() + 86400000), // 1 day from now
      };

      mockNordigenRepository.getToken.mockResolvedValue(mockToken);
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getInstitutions('user-id', countryCode);

      expect(result).toEqual(mockInstitutions);
    });
  });

  describe('getInstitution', () => {
    it('should return a specific institution', async () => {
      const institutionId = 'institution-1';
      const mockInstitution = {
        id: institutionId,
        name: 'Test Bank',
        bic: 'TESTBIC',
        transaction_total_days: '90',
        countries: ['GB'],
        logo: 'http://example.com/logo.png',
      };

      const mockResponse: AxiosResponse = {
        data: mockInstitution,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockToken = {
        id: 1,
        access: 'test-access-token',
        access_expires_on: new Date(Date.now() + 3600000),
        refresh: 'test-refresh-token',
        refresh_expires_on: new Date(Date.now() + 86400000),
      };

      mockNordigenRepository.getToken.mockResolvedValue(mockToken);
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getInstitution('user-id', institutionId);

      expect(result).toEqual(mockInstitution);
    });
  });

  describe('getAccountMetadata', () => {
    it('should return account metadata', async () => {
      const accountId = 'account-1';
      const mockMetadata = {
        id: accountId,
        created: '2024-01-01T00:00:00Z',
        last_accessed: '2024-01-10T00:00:00Z',
        iban: 'GB00TEST1234567890',
        institution_id: 'institution-1',
        status: 'READY',
        owner_name: 'Test User',
      };

      const mockResponse: AxiosResponse = {
        data: mockMetadata,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockToken = {
        id: 1,
        access: 'test-access-token',
        access_expires_on: new Date(Date.now() + 3600000),
        refresh: 'test-refresh-token',
        refresh_expires_on: new Date(Date.now() + 86400000),
      };

      mockNordigenRepository.getToken.mockResolvedValue(mockToken);
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getAccountMetadata('user-id', accountId);

      expect(result).toEqual(mockMetadata);
    });
  });

  describe('getAccountDetails', () => {
    it('should return account details', async () => {
      const accountId = 'account-1';
      const mockAccount = {
        iban: 'GB00TEST1234567890',
        currency: 'GBP',
        ownerName: 'Test User',
        name: 'Test Account',
      };

      const mockResponse: AxiosResponse = {
        data: {
          account: mockAccount,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockToken = {
        id: 1,
        access: 'test-access-token',
        access_expires_on: new Date(Date.now() + 3600000),
        refresh: 'test-refresh-token',
        refresh_expires_on: new Date(Date.now() + 86400000),
      };

      mockNordigenRepository.getToken.mockResolvedValue(mockToken);
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getAccountDetails('user-id', accountId);

      expect(result).toEqual(mockAccount);
    });
  });

  describe('getAccountBalance', () => {
    it('should return account balances', async () => {
      const accountId = 'account-1';
      const mockBalances = [
        {
          balanceAmount: {
            amount: '1000.00',
            currency: 'GBP',
          },
          balanceType: 'expected',
        },
      ];

      const mockResponse: AxiosResponse = {
        data: {
          balances: mockBalances,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockToken = {
        id: 1,
        access: 'test-access-token',
        access_expires_on: new Date(Date.now() + 3600000),
        refresh: 'test-refresh-token',
        refresh_expires_on: new Date(Date.now() + 86400000),
      };

      mockNordigenRepository.getToken.mockResolvedValue(mockToken);
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getAccountBalance('user-id', accountId);

      expect(result).toEqual(mockBalances);
    });
  });

  describe('token management', () => {
    it('should get a new token when none exists', async () => {
      const mockTokenDto = {
        access: 'new-access-token',
        access_expires: 3600,
        refresh: 'new-refresh-token',
        refresh_expires: 86400,
      };

      const mockResponse: AxiosResponse = {
        data: mockTokenDto,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockSavedToken = {
        id: 1,
        access: mockTokenDto.access,
        access_expires_on: new Date(
          Date.now() + mockTokenDto.access_expires * 1000,
        ),
        refresh: mockTokenDto.refresh,
        refresh_expires_on: new Date(
          Date.now() + mockTokenDto.refresh_expires * 1000,
        ),
      };

      mockNordigenRepository.getToken.mockResolvedValue(null);
      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockNordigenRepository.createToken.mockResolvedValue(mockSavedToken);

      // This will trigger token creation when making a request
      const mockInstitutionsResponse: AxiosResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockInstitutionsResponse));

      await service.getInstitutions('user-id', 'GB');

      expect(mockNordigenRepository.createToken).toHaveBeenCalled();
    });
  });
});
