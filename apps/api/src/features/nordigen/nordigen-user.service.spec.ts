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

const MockNordigenClient = NordigenClient as jest.MockedClass<typeof NordigenClient>;

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

    MockNordigenClient.mockImplementation(() => mockClientInstance);

    const module: TestingModule = await Test.createTestingModule({
      providers: [NordigenUserService],
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

      mockClientInstance.generateToken.mockResolvedValue({
        access: 'test-access-token',
      });

      const result = await service.getAccessToken(credentials);

      expect(result).toBe('test-access-token');
      expect(MockNordigenClient).toHaveBeenCalledWith(expect.objectContaining({
        secretId: credentials.secretId,
        secretKey: credentials.secretKey,
      }));
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const credentials = {
        secretId: 'invalid-id',
        secretKey: 'invalid-key',
      };

      mockClientInstance.generateToken.mockRejectedValue(new Error('Invalid'));

      await expect(service.getAccessToken(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getAccountMetadata', () => {
    it('should return account metadata', async () => {
      const credentials = { secretId: 'sid', secretKey: 'sk' };
      const accountId = 'test-account-id';
      const mockMetadata = { id: accountId, status: 'READY' };

      mockClientInstance.generateToken.mockResolvedValue({ access: 'token' });
      mockClientInstance.account(accountId).getMetadata.mockResolvedValue(mockMetadata);

      const result = await service.getAccountMetadata(credentials, accountId);

      expect(result).toEqual(mockMetadata);
      expect(mockClientInstance.account).toHaveBeenCalledWith(accountId);
    });
  });

  describe('getAccountTransactions', () => {
    it('should return booked transactions', async () => {
      const credentials = { secretId: 'sid', secretKey: 'sk' };
      const accountId = 'test-account-id';
      const mockTransactions = [
        { transactionId: 'tx-1' }
      ];

      mockClientInstance.generateToken.mockResolvedValue({ access: 'token' });
      mockClientInstance.account(accountId).getTransactions.mockResolvedValue({
        transactions: { booked: mockTransactions, pending: [] }
      });

      const result = await service.getAccountTransactions(credentials, accountId);

      expect(result).toEqual(mockTransactions);
    });
  });
});
