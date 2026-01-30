import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { NordigenUserService } from './nordigen-user.service';
import { of, throwError } from 'rxjs';
import { UnauthorizedException } from '@nestjs/common';
import { AxiosResponse, AxiosHeaders } from 'axios';

describe('NordigenUserService', () => {
  let service: NordigenUserService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NordigenUserService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<NordigenUserService>(NordigenUserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAccessToken', () => {
    it('should return access token on success', async () => {
      const credentials = {
        secretId: 'test-secret-id',
        secretKey: 'test-secret-key',
      };

      const mockResponse: AxiosResponse = {
        data: {
          access: 'test-access-token',
          access_expires: 86400,
          refresh: 'test-refresh-token',
          refresh_expires: 2592000,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.getAccessToken(credentials);

      expect(result).toBe('test-access-token');
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://bankaccountdata.gocardless.com/api/v2/token/new/',
        {
          secret_id: credentials.secretId,
          secret_key: credentials.secretKey,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const credentials = {
        secretId: 'invalid-secret-id',
        secretKey: 'invalid-secret-key',
      };

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Invalid credentials')),
      );

      await expect(service.getAccessToken(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getAccountMetadata', () => {
    it('should return account metadata', async () => {
      const credentials = {
        secretId: 'test-secret-id',
        secretKey: 'test-secret-key',
      };
      const accountId = 'test-account-id';

      const tokenResponse: AxiosResponse = {
        data: { access: 'test-token' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      const metadataResponse: AxiosResponse = {
        data: {
          id: accountId,
          status: 'READY',
          institution_id: 'inst-1',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      mockHttpService.post.mockReturnValue(of(tokenResponse));
      mockHttpService.get.mockReturnValue(of(metadataResponse));

      const result = await service.getAccountMetadata(credentials, accountId);

      expect(result.id).toBe(accountId);
      expect(result.status).toBe('READY');
    });
  });

  describe('getAccountTransactions', () => {
    it('should return booked transactions', async () => {
      const credentials = {
        secretId: 'test-secret-id',
        secretKey: 'test-secret-key',
      };
      const accountId = 'test-account-id';

      const tokenResponse: AxiosResponse = {
        data: { access: 'test-token' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      const transactionsResponse: AxiosResponse = {
        data: {
          transactions: {
            booked: [
              {
                transactionId: 'tx-1',
                transactionAmount: { amount: '100.00', currency: 'GBP' },
              },
              {
                transactionId: 'tx-2',
                transactionAmount: { amount: '-50.00', currency: 'GBP' },
              },
            ],
            pending: [],
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      mockHttpService.post.mockReturnValue(of(tokenResponse));
      mockHttpService.get.mockReturnValue(of(transactionsResponse));

      const result = await service.getAccountTransactions(
        credentials,
        accountId,
      );

      expect(result).toHaveLength(2);
      expect(result[0].transactionId).toBe('tx-1');
    });
  });
});
