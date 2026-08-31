import { Test, TestingModule } from '@nestjs/testing';
import { ObAccountsController } from './ObAccounts.controller.js';
import { OpenbankingService } from './openbanking.service.js';
import { NordigenService } from '../../features/nordigen/nordigen.service.js';
import { UserPrincipal } from '../../auth/user-principal.js';

describe('ObAccountsController', () => {
  let controller: ObAccountsController;

  const mockOpenbankingService = {};

  const mockNordigenService = {
    getAccountMetadata: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObAccountsController],
      providers: [
        {
          provide: OpenbankingService,
          useValue: mockOpenbankingService,
        },
        {
          provide: NordigenService,
          useValue: mockNordigenService,
        },
      ],
    }).compile();

    controller = module.get<ObAccountsController>(ObAccountsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getObAccounts', () => {
    it('should return a list of account IDs', () => {
      const result = controller.getObAccounts(mockUser);

      expect(result).toEqual({
        accounts: ['123456789', '987654321'],
      });
    });
  });

  describe('getObAccount', () => {
    it('should return account metadata', async () => {
      const accountId = 'account-123';
      const mockMetadata = {
        id: accountId,
        iban: 'GB00TEST1234567890',
        status: 'READY',
      };

      mockNordigenService.getAccountMetadata.mockResolvedValue(mockMetadata);

      const result = await controller.getObAccount(mockUser, accountId);

      expect(result).toEqual(mockMetadata);
      expect(mockNordigenService.getAccountMetadata).toHaveBeenCalledWith(
        accountId,
      );
    });
  });
});
