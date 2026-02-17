/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { DataExporterController } from './data-exporter.controller';
import { getQueueToken } from '@nestjs/bullmq';
import {
  CSV_EXPORT_QUEUE,
  CSV_EXPORT_JOB,
} from './processors/csv-export.processor';
import {
  OFE_EXPORT_QUEUE,
  OFE_EXPORT_JOB,
} from './processors/ofe-export.processor';
import {
  JSON_EXPORT_QUEUE,
  JSON_EXPORT_JOB,
} from './processors/json-export.processor';

describe('DataExporterController', () => {
  let controller: DataExporterController;
  let csvQueue: jest.Mocked<any>;
  let ofeQueue: jest.Mocked<any>;
  let jsonQueue: jest.Mocked<any>;

  beforeEach(async () => {
    csvQueue = {
      add: jest.fn().mockResolvedValue({ id: 'test-csv-job-id' }),
    };
    ofeQueue = {
      add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    };
    jsonQueue = {
      add: jest.fn().mockResolvedValue({ id: 'test-json-job-id' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataExporterController],
      providers: [
        {
          provide: getQueueToken(CSV_EXPORT_QUEUE),
          useValue: csvQueue,
        },
        {
          provide: getQueueToken(OFE_EXPORT_QUEUE),
          useValue: ofeQueue,
        },
        {
          provide: getQueueToken(JSON_EXPORT_QUEUE),
          useValue: jsonQueue,
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

      expect(csvQueue.add).toHaveBeenCalledWith(
        CSV_EXPORT_JOB,
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

      const result = await controller.exportCsv(mockUser as any, dto);

      expect(ofeQueue.add).toHaveBeenCalledWith(
        OFE_EXPORT_JOB,
        {
          userId: 'user-123',
          dto: expect.objectContaining({
            startDate: dto.startDate,
          }),
        },
        expect.any(Object),
      );
      expect(ofeQueue.add.mock.calls[0][1].dto.format).toBeUndefined();
      expect(result.message).toContain('OFE export started');
    });

    it('should queue export job without filters', async () => {
      const mockUser = { id: 'user-456', email: 'test2@example.com' };
      const dto = {};

      const result = await controller.exportCsv(mockUser as any, dto);

      expect(csvQueue.add).toHaveBeenCalledWith(
        CSV_EXPORT_JOB,
        { userId: 'user-456', dto },
        expect.any(Object),
      );
      expect(result.message).toContain('CSV export started');
    });

    it('should queue JSON export job when format is json', async () => {
      const mockUser = { id: 'user-789', email: 'test3@example.com' };
      const dto = {
        format: 'json' as const,
      };

      const result = await controller.exportCsv(mockUser as any, dto);

      expect(jsonQueue.add).toHaveBeenCalledWith(
        JSON_EXPORT_JOB,
        { userId: 'user-789', dto: {} },
        expect.any(Object),
      );
      expect(result.message).toContain('JSON export started');
    });
  });
});
