/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { DataImporterController } from './data-importer.controller';
import { UserPrincipal } from 'src/auth/user-principal';
import { CsvImportRequestDto } from './dto/csv-import-request.dto';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import {
  CSV_IMPORT_QUEUE,
  CSV_IMPORT_JOB,
} from './processors/csv-import.processor';

describe('DataImporterController', () => {
  let controller: DataImporterController;
  let csvImportQueue: jest.Mocked<Queue>;

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const mockQueue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataImporterController],
      providers: [
        {
          provide: getQueueToken(CSV_IMPORT_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    controller = module.get<DataImporterController>(DataImporterController);
    csvImportQueue = module.get(getQueueToken(CSV_IMPORT_QUEUE));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importCsv', () => {
    it('should enqueue CSV import job and return accepted response', async () => {
      const dto: CsvImportRequestDto = {
        csvData: [
          {
            date: '2024-01-01',
            amount: '100.00',
            description: 'Test transaction',
            account: 'Test Account',
            notes: '',
            category: '',
          },
        ],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {
          'Test Account': {
            name: 'Test Account',
            shouldCreate: true,
          },
        },
        categoryMappings: {},
      };

      const mockJob = { id: 'job-123' } as Job;
      csvImportQueue.add.mockResolvedValue(mockJob as any);

      const result = await controller.importCsv(mockUser, dto);

      expect(csvImportQueue.add).toHaveBeenCalledWith(
        CSV_IMPORT_JOB,
        { userId: mockUser.id, dto },
        {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
      expect(result).toEqual({
        message:
          'CSV import started. You will receive an email when the import is complete.',
        processedCount: 0,
        failedCount: 0,
      });
    });

    it('should handle queue errors gracefully', async () => {
      const dto: CsvImportRequestDto = {
        csvData: [],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {},
        categoryMappings: {},
      };

      csvImportQueue.add.mockRejectedValue(new Error('Queue error'));

      await expect(controller.importCsv(mockUser, dto)).rejects.toThrow(
        'Queue error',
      );
    });
  });

  describe('importOfe', () => {
    it('should enqueue OFE import job and return accepted response', async () => {
      const dto: CsvImportRequestDto = {
        csvData: [],
        fieldMappings: {
          account: 'account',
          date: 'date',
          amount: 'amount',
          description: 'description',
          notes: 'notes',
          category: 'category',
        },
        accountMappings: {},
        categoryMappings: {},
      };

      const mockJob = { id: 'job-234' } as Job;
      csvImportQueue.add.mockResolvedValue(mockJob as any);

      const result = await controller.importOfe(mockUser, dto);

      expect(csvImportQueue.add).toHaveBeenCalledWith(
        CSV_IMPORT_JOB,
        { userId: mockUser.id, dto },
        {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
      expect(result).toEqual({
        message:
          'OFE import started. You will receive an email when the import is complete.',
        processedCount: 0,
        failedCount: 0,
      });
    });
  });
});
