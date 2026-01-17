import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { NordigenSyncScheduler } from './nordigen-sync.scheduler';
import { NordigenKeysService } from '../nordigen-keys/nordigen-keys.service';
import { NORDIGEN_SYNC_QUEUE, NORDIGEN_SYNC_JOB } from './nordigen-sync.processor';

describe('NordigenSyncScheduler', () => {
  let scheduler: NordigenSyncScheduler;
  let nordigenKeysService: jest.Mocked<NordigenKeysService>;
  let syncQueue: jest.Mocked<any>;

  const mockSyncQueue = {
    add: jest.fn(),
  };

  const mockNordigenKeysService = {
    findAllKeysWithAccounts: jest.fn(),
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
          provide: NordigenKeysService,
          useValue: mockNordigenKeysService,
        },
      ],
    }).compile();

    scheduler = module.get<NordigenSyncScheduler>(NordigenSyncScheduler);
    nordigenKeysService = module.get(NordigenKeysService);
    syncQueue = module.get(getQueueToken(NORDIGEN_SYNC_QUEUE));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  describe('scheduleDailySync', () => {
    it('should enqueue sync jobs for all keys with linked accounts', async () => {
      const mockKeys = [
        { id: 'key-1', linkedAccounts: [{ account_id: 'acc-1' }] },
        { id: 'key-2', linkedAccounts: [{ account_id: 'acc-2' }] },
        { id: 'key-3', linkedAccounts: [{ account_id: 'acc-3' }] },
      ];

      mockNordigenKeysService.findAllKeysWithAccounts.mockResolvedValue(mockKeys);
      mockSyncQueue.add.mockResolvedValue({});

      await scheduler.scheduleDailySync();

      expect(mockNordigenKeysService.findAllKeysWithAccounts).toHaveBeenCalled();
      expect(mockSyncQueue.add).toHaveBeenCalledTimes(3);

      // Verify each key gets a job
      expect(mockSyncQueue.add).toHaveBeenCalledWith(
        NORDIGEN_SYNC_JOB,
        { keyId: 'key-1' },
        expect.objectContaining({
          attempts: 3,
          removeOnComplete: 100,
          removeOnFail: 50,
        }),
      );
      expect(mockSyncQueue.add).toHaveBeenCalledWith(
        NORDIGEN_SYNC_JOB,
        { keyId: 'key-2' },
        expect.any(Object),
      );
      expect(mockSyncQueue.add).toHaveBeenCalledWith(
        NORDIGEN_SYNC_JOB,
        { keyId: 'key-3' },
        expect.any(Object),
      );
    });

    it('should handle empty keys list gracefully', async () => {
      mockNordigenKeysService.findAllKeysWithAccounts.mockResolvedValue([]);

      await scheduler.scheduleDailySync();

      expect(mockNordigenKeysService.findAllKeysWithAccounts).toHaveBeenCalled();
      expect(mockSyncQueue.add).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockNordigenKeysService.findAllKeysWithAccounts.mockRejectedValue(
        new Error('Database error'),
      );

      // Should not throw, just log error
      await expect(scheduler.scheduleDailySync()).resolves.not.toThrow();
    });
  });
});
