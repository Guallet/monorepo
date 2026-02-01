/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NordigenService } from './nordigen.service';
import { HttpService } from '@nestjs/axios';
import { NordigenRepository } from './nordigen.repository';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('NordigenService', () => {
  let service: NordigenService;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  const mockNordigenRepository = {
    getToken: jest.fn(),
    createToken: jest.fn(),
    updateToken: jest.fn(),
    deleteToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NordigenService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'nordigen') {
                return {
                  secretId: process.env.NORDIGEN_SECRET_ID,
                  secretKey: process.env.NORDIGEN_SECRET_KEY,
                };
              }
              return undefined;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: NordigenRepository,
          useValue: mockNordigenRepository,
        },
      ],
    }).compile();

    service = module.get<NordigenService>(NordigenService);

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set environment variables for testing
    process.env.NORDIGEN_SECRET_ID = 'test-secret-id';
    process.env.NORDIGEN_SECRET_KEY = 'test-secret-key';
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

      const result = await service.getInstitutions(countryCode);

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

      const result = await service.getInstitution(institutionId);

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

      const result = await service.getAccountMetadata(accountId);

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

      const result = await service.getAccountDetails(accountId);

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

      const result = await service.getAccountBalance(accountId);

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

      await service.getInstitutions('GB');

      expect(mockNordigenRepository.createToken).toHaveBeenCalled();
    });
  });
});
