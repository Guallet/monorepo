import { Test, TestingModule } from '@nestjs/testing';
import { ObAccountsController } from './ObAccounts.controller.js';
import { OpenbankingService } from './openbanking.service.js';
import { UserPrincipal } from '../../auth/user-principal.js';

describe('ObAccountsController', () => {
  let controller: ObAccountsController;

  const mockOpenbankingService = {
    getLinkedAccounts: vi.fn(),
    getAccountMetadata: vi.fn(),
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
      ],
    }).compile();

    controller = module.get<ObAccountsController>(ObAccountsController);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getObAccounts', () => {
    it('should return a list of account IDs', async () => {
      mockOpenbankingService.getLinkedAccounts.mockResolvedValue([
        { id: '123456789' },
        { id: '987654321' },
      ]);

      const result = await controller.getObAccounts(mockUser);

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

      mockOpenbankingService.getAccountMetadata.mockResolvedValue(mockMetadata);

      const result = await controller.getObAccount(mockUser, accountId);

      expect(result).toEqual(mockMetadata);
      expect(mockOpenbankingService.getAccountMetadata).toHaveBeenCalledWith(
        mockUser.id,
        accountId,
      );
    });
  });
});
