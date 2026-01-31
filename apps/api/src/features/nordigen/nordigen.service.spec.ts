/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { NordigenService } from './nordigen.service';
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

describe('NordigenService', () => {
  let service: NordigenService;
  let mockClientInstance: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockClientInstance = {
      institution: {
        getInstitutions: jest.fn(),
        getInstitutionById: jest.fn(),
      },
      account: jest.fn().mockReturnValue({
        getMetadata: jest.fn(),
        getDetails: jest.fn(),
        getBalances: jest.fn(),
        getTransactions: jest.fn(),
      }),
      requisition: {
        getRequisitionById: jest.fn(),
        deleteRequisition: jest.fn(),
        createRequisition: jest.fn(),
      },
      generateToken: jest.fn(),
      exchangeToken: jest.fn(),
      token: '',
    };

    MockNordigenClient.mockImplementation(
      () => mockClientInstance as unknown as NordigenClient,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [NordigenService],
    }).compile();

    service = module.get<NordigenService>(NordigenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInstitutions', () => {
    it('should return institutions for a country code', async () => {
      const countryCode = 'GB';
      const mockInstitutions = [{ id: 'inst-1', name: 'Test Bank' }];

      mockClientInstance.generateToken.mockResolvedValue({
        access: 'token',
        access_expires: 3600,
        refresh: 'ref',
        refresh_expires: 86400,
      });
      mockClientInstance.institution.getInstitutions.mockResolvedValue(
        mockInstitutions,
      );

      const result = await service.getInstitutions(countryCode);

      expect(result).toEqual(mockInstitutions);
      expect(
        mockClientInstance.institution.getInstitutions,
      ).toHaveBeenCalledWith({ country: countryCode });
    });
  });

  describe('getAccountDetails', () => {
    it('should return account details', async () => {
      const accountId = 'account-1';
      const mockAccount = { iban: 'GB123' };

      mockClientInstance.generateToken.mockResolvedValue({
        access: 'token',
        access_expires: 3600,
        refresh: 'ref',
        refresh_expires: 86400,
      });
      mockClientInstance
        .account(accountId)
        .getDetails.mockResolvedValue({ account: mockAccount });

      const result = await service.getAccountDetails(accountId);

      expect(result).toEqual(mockAccount);
    });
  });
});
