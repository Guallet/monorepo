/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { DataExporterController } from './data-exporter.controller.js';
import { getQueueToken } from '@nestjs/bullmq';
import {
  EXPORT_DATA_QUEUE,
  EXPORT_DATA_JOB,
} from './processors/export-data.processor.js';

describe('DataExporterController', () => {
  let controller: DataExporterController;
  let exportQueue: jest.Mocked<any>;

  beforeEach(async () => {
    exportQueue = {
      add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataExporterController],
      providers: [
        {
          provide: getQueueToken(EXPORT_DATA_QUEUE),
          useValue: exportQueue,
        },
      ],
    }).compile();

    controller = module.get<DataExporterController>(DataExporterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportData', () => {
    it('should queue CSV export job by default', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const dto = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        accounts: ['account-1', 'account-2'],
      };

      const result = await controller.exportData(mockUser as any, dto);

      expect(exportQueue.add).toHaveBeenCalledWith(
        EXPORT_DATA_JOB,
        { userId: 'user-123', dto },
        expect.any(Object),
      );
      expect(result.message).toContain('CSV export started');
    });

    it('should queue OFE export job when format is ofe', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const dto = {
        startDate: '2024-01-01T00:00:00.000Z',
        format: 'ofe' as const,
      };

      const result = await controller.exportData(mockUser as any, dto);

      expect(exportQueue.add).toHaveBeenCalledWith(
        EXPORT_DATA_JOB,
        { userId: 'user-123', dto },
        expect.any(Object),
      );
      expect(result.message).toContain('OFE export started');
    });

    it('should queue export job without filters', async () => {
      const mockUser = { id: 'user-456', email: 'test2@example.com' };
      const dto = {};

      const result = await controller.exportData(mockUser as any, dto);

      expect(exportQueue.add).toHaveBeenCalledWith(
        EXPORT_DATA_JOB,
        { userId: 'user-456', dto },
        expect.any(Object),
      );
      expect(result.message).toContain('CSV export started');
    });

    it('should queue JSON export job when format is json', async () => {
      const mockUser = { id: 'user-789', email: 'test3@example.com' };
      const dto = { format: 'json' as const };

      const result = await controller.exportData(mockUser as any, dto);

      expect(exportQueue.add).toHaveBeenCalledWith(
        EXPORT_DATA_JOB,
        { userId: 'user-789', dto },
        expect.any(Object),
      );
      expect(result.message).toContain('JSON export started');
    });
  });
});
