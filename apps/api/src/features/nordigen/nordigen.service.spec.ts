/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { NordigenService } from './nordigen.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('NordigenService', () => {
  let service: NordigenService;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NordigenService,
        {
          provide: HttpService,
          useValue: mockHttpService,
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

      const mockTokenDto = {
        access: 'test-access-token',
        access_expires: 3600,
        refresh: 'test-refresh-token',
        refresh_expires: 86400,
      };

      const mockTokenResponse: AxiosResponse = {
        data: mockTokenDto,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockTokenResponse));
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

      const mockTokenDto = {
        access: 'test-access-token',
        access_expires: 3600,
        refresh: 'test-refresh-token',
        refresh_expires: 86400,
      };

      const mockTokenResponse: AxiosResponse = {
        data: mockTokenDto,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockTokenResponse));
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

      const mockTokenDto = {
        access: 'test-access-token',
        access_expires: 3600,
        refresh: 'test-refresh-token',
        refresh_expires: 86400,
      };

      const mockTokenResponse: AxiosResponse = {
        data: mockTokenDto,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockTokenResponse));
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

      const mockTokenDto = {
        access: 'test-access-token',
        access_expires: 3600,
        refresh: 'test-refresh-token',
        refresh_expires: 86400,
      };

      const mockTokenResponse: AxiosResponse = {
        data: mockTokenDto,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockTokenResponse));
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

      const mockTokenDto = {
        access: 'test-access-token',
        access_expires: 3600,
        refresh: 'test-refresh-token',
        refresh_expires: 86400,
      };

      const mockTokenResponse: AxiosResponse = {
        data: mockTokenDto,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockTokenResponse));
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getAccountBalance(accountId);

      expect(result).toEqual(mockBalances);
    });
  });

  describe('token management', () => {
    it('should get a new token and store it in memory', async () => {
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

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const mockInstitutionsResponse: AxiosResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockInstitutionsResponse));

      await service.getInstitutions('GB');

      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v2/token/new/'),
        expect.any(Object),
        expect.any(Object),
      );
    });
  });
});
