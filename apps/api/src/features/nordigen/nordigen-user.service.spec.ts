/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { NordigenUserService } from './nordigen-user.service';
import { UnauthorizedException } from '@nestjs/common';
import NordigenClient from 'nordigen-node';

jest.mock('nordigen-node', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

const MockNordigenClient = NordigenClient as jest.MockedClass<
  typeof NordigenClient
>;

describe('NordigenUserService', () => {
  let service: NordigenUserService;
  let mockClientInstance: any;

  beforeEach(async () => {
    mockClientInstance = {
      generateToken: jest.fn(),
      account: jest.fn().mockReturnValue({
        getMetadata: jest.fn(),
        getDetails: jest.fn(),
        getBalances: jest.fn(),
        getTransactions: jest.fn(),
      }),
    };

    MockNordigenClient.mockImplementation(
      () => mockClientInstance as unknown as NordigenClient,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [NordigenUserService],
    }).compile();

    service = module.get<NordigenUserService>(NordigenUserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAuthenticatedClient', () => {
    it('should create and authenticate a client', async () => {
      const credentials = {
        secretId: 'test-secret-id',
        secretKey: 'test-secret-key',
      };

      mockClientInstance.generateToken.mockResolvedValue({
        access: 'test-access-token',
      });

      const client = await service.createAuthenticatedClient(credentials);

      expect(client).toBe(mockClientInstance);
      expect(client.token).toBe('test-access-token');
      expect(mockClientInstance.generateToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on failure', async () => {
      const credentials = { secretId: 'invalid-id', secretKey: 'invalid-key' };
      mockClientInstance.generateToken.mockRejectedValue(new Error('Invalid'));

      await expect(
        service.createAuthenticatedClient(credentials),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getAccessToken', () => {
    it('should return access token on success', async () => {
      const credentials = {
        secretId: 'test-secret-id',
        secretKey: 'test-secret-key',
      };

      mockClientInstance.generateToken.mockResolvedValue({
        access: 'test-access-token',
      });

      const result = await service.getAccessToken(credentials);

      expect(result).toBe('test-access-token');
      expect(MockNordigenClient).toHaveBeenCalledWith(
        expect.objectContaining({
          secretId: credentials.secretId,
          secretKey: credentials.secretKey,
        }),
      );
    });

    it('should throw InternalServerErrorException on invalid credentials', async () => {
      const credentials = {
        secretId: 'invalid-id',
        secretKey: 'invalid-key',
      };

      mockClientInstance.generateToken.mockRejectedValue(new Error('Invalid'));

      // The user changed UnauthorizedException to InternalServerErrorException in getAccessToken
      await expect(service.getAccessToken(credentials)).rejects.toThrow(
        /Invalid Nordigen credentials/,
      );
    });
  });

  describe('getAccountMetadata', () => {
    it('should return account metadata', async () => {
      const accountId = 'test-account-id';
      const mockMetadata = { id: accountId, status: 'READY' };

      mockClientInstance
        .account(accountId)
        .getMetadata.mockResolvedValue(mockMetadata);

      const result = await service.getAccountMetadata(
        mockClientInstance as unknown as NordigenClient,
        accountId,
      );

      expect(result).toEqual(mockMetadata);
      expect(mockClientInstance.account).toHaveBeenCalledWith(accountId);
    });
  });

  describe('getAccountTransactions', () => {
    it('should return booked transactions', async () => {
      const accountId = 'test-account-id';
      const mockTransactions = [{ transactionId: 'tx-1' }];

      mockClientInstance.account(accountId).getTransactions.mockResolvedValue({
        transactions: { booked: mockTransactions, pending: [] },
      });

      const result = await service.getAccountTransactions(
        mockClientInstance as unknown as NordigenClient,
        accountId,
      );

      expect(result).toEqual(mockTransactions);
    });
  });
});
