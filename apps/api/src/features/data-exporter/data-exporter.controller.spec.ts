/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { DataExporterController } from './data-exporter.controller';
import { getQueueToken } from '@nestjs/bullmq';
import { CSV_EXPORT_QUEUE } from './processors/csv-export.processor';

describe('DataExporterController', () => {
  let controller: DataExporterController;
  let mockQueue: jest.Mocked<any>;

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataExporterController],
      providers: [
        {
          provide: getQueueToken(CSV_EXPORT_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    controller = module.get<DataExporterController>(DataExporterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportCsv', () => {
    it('should queue export job and return success message', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const dto = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        accounts: ['account-1', 'account-2'],
      };

      const result = await controller.exportCsv(mockUser as any, dto);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-csv-export',
        { userId: 'user-123', dto, format: 'csv' },
        expect.any(Object),
      );
      expect(result.message).toContain('CSV export started');
    });

    it('should queue export job without filters', async () => {
      const mockUser = { id: 'user-456', email: 'test2@example.com' };
      const dto = {};

      const result = await controller.exportCsv(mockUser as any, dto);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-csv-export',
        { userId: 'user-456', dto, format: 'csv' },
        expect.any(Object),
      );
      expect(result.message).toContain('CSV export started');
    });
  });

  describe('exportOfe', () => {
    it('should queue OFE export job and return success message', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const dto = {
        startDate: '2024-01-01T00:00:00.000Z',
      };

      const result = await controller.exportOfe(mockUser as any, dto);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-csv-export',
        { userId: 'user-123', dto, format: 'ofe' },
        expect.any(Object),
      );
      expect(result.message).toContain('OFE export started');
    });
  });
});
