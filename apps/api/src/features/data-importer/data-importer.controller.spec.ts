/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { DataImporterController } from './data-importer.controller';
import { UserPrincipal } from 'src/auth/user-principal';
import { DataImportRequestDto } from './dto/data-import-request.dto';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import {
  IMPORT_DATA_QUEUE,
  IMPORT_DATA_JOB,
} from './processors/import-data.processor';

describe('DataImporterController', () => {
  let controller: DataImporterController;
  let importQueue: jest.Mocked<Queue>;

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
          provide: getQueueToken(IMPORT_DATA_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    controller = module.get<DataImporterController>(DataImporterController);
    importQueue = module.get(getQueueToken(IMPORT_DATA_QUEUE));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importData', () => {
    it('should enqueue CSV import job and return accepted response', async () => {
      const dto: DataImportRequestDto = {
        format: 'csv',
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
      importQueue.add.mockResolvedValue(mockJob as any);

      const result = await controller.importData(mockUser, dto);

      expect(importQueue.add).toHaveBeenCalledWith(
        IMPORT_DATA_JOB,
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

    it('should enqueue OFE import job and return accepted response', async () => {
      const dto: DataImportRequestDto = {
        format: 'ofe',
        ofeContent:
          '<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST><STMTTRN><DTPOSTED>20240101</DTPOSTED><TRNAMT>1</TRNAMT><NAME>Test</NAME></STMTTRN></BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>',
      };

      const mockJob = { id: 'job-234' } as Job;
      importQueue.add.mockResolvedValue(mockJob as any);

      const result = await controller.importData(mockUser, dto);

      expect(importQueue.add).toHaveBeenCalledWith(
        IMPORT_DATA_JOB,
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

    it('should enqueue JSON import job and return accepted response', async () => {
      const dto: DataImportRequestDto = {
        format: 'json',
        jsonContent: JSON.stringify([
          { date: '2024-01-01', amount: 100, description: 'Test' },
        ]),
      };

      const mockJob = { id: 'job-345' } as Job;
      importQueue.add.mockResolvedValue(mockJob as any);

      const result = await controller.importData(mockUser, dto);

      expect(importQueue.add).toHaveBeenCalledWith(
        IMPORT_DATA_JOB,
        { userId: mockUser.id, dto },
        {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
      expect(result).toEqual({
        message:
          'JSON import started. You will receive an email when the import is complete.',
        processedCount: 0,
        failedCount: 0,
      });
    });

    it('should handle queue errors gracefully', async () => {
      const dto: DataImportRequestDto = {
        format: 'csv',
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

      importQueue.add.mockRejectedValue(new Error('Queue error'));

      await expect(controller.importData(mockUser, dto)).rejects.toThrow(
        'Queue error',
      );
    });

    it('should default to CSV format when format is not specified', async () => {
      const dto = {
        format: undefined as any,
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
      } as DataImportRequestDto;

      const mockJob = { id: 'job-456' } as Job;
      importQueue.add.mockResolvedValue(mockJob as any);

      const result = await controller.importData(mockUser, dto);

      expect(result.message).toContain('import started');
    });
  });
});
