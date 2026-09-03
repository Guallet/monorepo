import { Test, TestingModule } from '@nestjs/testing';
import { ObASyncController } from './ObSync.controller.js';
import { SyncService } from './sync.service.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { ForbiddenException } from '@nestjs/common';

describe('ObASyncController', () => {
  let controller: ObASyncController;

  const mockSyncService = {
    syncConnectedAccounts: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObASyncController],
      providers: [
        {
          provide: SyncService,
          useValue: mockSyncService,
        },
      ],
    }).compile();

    controller = module.get<ObASyncController>(ObASyncController);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getObAccounts', () => {
    it('should sync accounts for admin user', async () => {
      const mockAdminUser: UserPrincipal = new UserPrincipal(
        'admin-123',
        'admin@example.com',
        ['admin'],
      );

      const mockSyncResult = {
        accounts_synced: 5,
        errors: [],
      };

      mockSyncService.syncConnectedAccounts.mockResolvedValue(mockSyncResult);

      const result = await controller.getObAccounts(mockAdminUser);

      expect(result).toEqual(mockSyncResult);
      expect(mockSyncService.syncConnectedAccounts).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for non-admin user', async () => {
      const mockUser: UserPrincipal = new UserPrincipal(
        'user-123',
        'user@example.com',
        [],
      );

      await expect(controller.getObAccounts(mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
