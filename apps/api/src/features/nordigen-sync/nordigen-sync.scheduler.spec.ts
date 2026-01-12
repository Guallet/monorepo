import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { NordigenSyncScheduler } from './nordigen-sync.scheduler';
import { UsersService } from '../users/users.service';
import { NORDIGEN_SYNC_QUEUE, NORDIGEN_SYNC_JOB } from './nordigen-sync.processor';

describe('NordigenSyncScheduler', () => {
  let scheduler: NordigenSyncScheduler;
  let usersService: jest.Mocked<UsersService>;
  let syncQueue: jest.Mocked<any>;

  const mockSyncQueue = {
    add: jest.fn(),
  };

  const mockUsersService = {
    getUsersWithNordigenCredentials: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NordigenSyncScheduler,
        {
          provide: getQueueToken(NORDIGEN_SYNC_QUEUE),
          useValue: mockSyncQueue,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    scheduler = module.get<NordigenSyncScheduler>(NordigenSyncScheduler);
    usersService = module.get(UsersService);
    syncQueue = module.get(getQueueToken(NORDIGEN_SYNC_QUEUE));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  describe('scheduleDailySync', () => {
    it('should enqueue sync jobs for all users with Nordigen credentials', async () => {
      const mockUsers = [
        { id: 'user-1', nordigen_secret_id: 'id-1', nordigen_secret_key: 'key-1' },
        { id: 'user-2', nordigen_secret_id: 'id-2', nordigen_secret_key: 'key-2' },
        { id: 'user-3', nordigen_secret_id: 'id-3', nordigen_secret_key: 'key-3' },
      ];

      mockUsersService.getUsersWithNordigenCredentials.mockResolvedValue(mockUsers);
      mockSyncQueue.add.mockResolvedValue({});

      await scheduler.scheduleDailySync();

      expect(mockUsersService.getUsersWithNordigenCredentials).toHaveBeenCalled();
      expect(mockSyncQueue.add).toHaveBeenCalledTimes(3);

      // Verify each user gets a job
      expect(mockSyncQueue.add).toHaveBeenCalledWith(
        NORDIGEN_SYNC_JOB,
        { userId: 'user-1' },
        expect.objectContaining({
          attempts: 3,
          removeOnComplete: 100,
          removeOnFail: 50,
        }),
      );
      expect(mockSyncQueue.add).toHaveBeenCalledWith(
        NORDIGEN_SYNC_JOB,
        { userId: 'user-2' },
        expect.any(Object),
      );
      expect(mockSyncQueue.add).toHaveBeenCalledWith(
        NORDIGEN_SYNC_JOB,
        { userId: 'user-3' },
        expect.any(Object),
      );
    });

    it('should handle empty user list gracefully', async () => {
      mockUsersService.getUsersWithNordigenCredentials.mockResolvedValue([]);

      await scheduler.scheduleDailySync();

      expect(mockUsersService.getUsersWithNordigenCredentials).toHaveBeenCalled();
      expect(mockSyncQueue.add).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockUsersService.getUsersWithNordigenCredentials.mockRejectedValue(
        new Error('Database error'),
      );

      // Should not throw, just log error
      await expect(scheduler.scheduleDailySync()).resolves.not.toThrow();
    });
  });
});
