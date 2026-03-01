/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { ImportDataProcessor, ImportJobData } from './import-data.processor';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CsvImportEngine } from '../engines/csv-import.engine';
import { OfeImportEngine } from '../engines/ofe-import.engine';
import { JsonImportEngine } from '../engines/json-import.engine';
import { DataImportRequestDto } from '../dto/data-import-request.dto';

describe('ImportDataProcessor', () => {
  let processor: ImportDataProcessor;
  let emailService: jest.Mocked<EmailService>;
  let usersService: jest.Mocked<UsersService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let csvEngine: jest.Mocked<CsvImportEngine>;
  let ofeEngine: jest.Mocked<OfeImportEngine>;
  let jsonEngine: jest.Mocked<JsonImportEngine>;

  const mockUserId = 'user-123';
  const mockUserEmail = 'test@example.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportDataProcessor,
        {
          provide: EmailService,
          useValue: {
            sendImportCompletionEmail: jest.fn(),
            sendImportErrorEmail: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserData: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createSystemNotification: jest.fn(),
          },
        },
        {
          provide: CsvImportEngine,
          useValue: {
            formatLabel: 'CSV',
            execute: jest.fn(),
          },
        },
        {
          provide: OfeImportEngine,
          useValue: {
            formatLabel: 'OFE',
            execute: jest.fn(),
          },
        },
        {
          provide: JsonImportEngine,
          useValue: {
            formatLabel: 'JSON',
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<ImportDataProcessor>(ImportDataProcessor);
    emailService = module.get(EmailService);
    usersService = module.get(UsersService);
    notificationsService = module.get(NotificationsService);
    csvEngine = module.get(CsvImportEngine);
    ofeEngine = module.get(OfeImportEngine);
    jsonEngine = module.get(JsonImportEngine);

    usersService.findUserData.mockResolvedValue({
      id: mockUserId,
      email: mockUserEmail,
      name: 'Test User',
      default_currency: 'GBP',
    } as any);

    notificationsService.createSystemNotification.mockResolvedValue({} as any);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should route CSV import to csv engine', async () => {
      const dto: DataImportRequestDto = {
        format: 'csv',
        csvData: [
          {
            date: '2024-01-01',
            amount: '50',
            description: 'Test',
            account: 'Acc',
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
          Acc: { id: 'acc-1', name: 'Acc', shouldCreate: false },
        },
        categoryMappings: {},
      };

      const job = {
        id: 'job-1',
        data: { userId: mockUserId, dto } as ImportJobData,
        updateProgress: jest.fn(),
      } as unknown as Job<ImportJobData>;

      csvEngine.execute.mockResolvedValue({ processed: 1, failed: 0 });

      const result = await processor.process(job);

      expect(csvEngine.execute).toHaveBeenCalledWith(
        mockUserId,
        dto,
        expect.any(Function),
      );
      expect(result).toEqual({ processed: 1, failed: 0 });
    });

    it('should route OFE import to ofe engine', async () => {
      const dto: DataImportRequestDto = {
        format: 'ofe',
        ofeContent:
          '<OFX><STMTTRN><DTPOSTED>20240101</DTPOSTED><TRNAMT>100</TRNAMT><NAME>Test</NAME></STMTTRN></OFX>',
      };

      const job = {
        id: 'job-2',
        data: { userId: mockUserId, dto } as ImportJobData,
        updateProgress: jest.fn(),
      } as unknown as Job<ImportJobData>;

      ofeEngine.execute.mockResolvedValue({ processed: 1, failed: 0 });

      const result = await processor.process(job);

      expect(ofeEngine.execute).toHaveBeenCalledWith(
        mockUserId,
        dto,
        expect.any(Function),
      );
      expect(result).toEqual({ processed: 1, failed: 0 });
    });

    it('should route JSON import to json engine', async () => {
      const dto: DataImportRequestDto = {
        format: 'json',
        jsonContent: JSON.stringify([
          { date: '2024-01-01', amount: 100, description: 'Test tx' },
        ]),
      };

      const job = {
        id: 'job-3',
        data: { userId: mockUserId, dto } as ImportJobData,
        updateProgress: jest.fn(),
      } as unknown as Job<ImportJobData>;

      jsonEngine.execute.mockResolvedValue({ processed: 1, failed: 0 });

      const result = await processor.process(job);

      expect(jsonEngine.execute).toHaveBeenCalledWith(
        mockUserId,
        dto,
        expect.any(Function),
      );
      expect(result).toEqual({ processed: 1, failed: 0 });
    });

    it('should default to CSV when format is not specified', async () => {
      const dto = {} as DataImportRequestDto;

      const job = {
        id: 'job-4',
        data: { userId: mockUserId, dto } as ImportJobData,
        updateProgress: jest.fn(),
      } as unknown as Job<ImportJobData>;

      csvEngine.execute.mockResolvedValue({ processed: 0, failed: 0 });

      await processor.process(job);

      expect(csvEngine.execute).toHaveBeenCalled();
    });

    it('should throw for unsupported format', async () => {
      const dto = { format: 'xml' as any } as DataImportRequestDto;

      const job = {
        id: 'job-5',
        data: { userId: mockUserId, dto } as ImportJobData,
        updateProgress: jest.fn(),
      } as unknown as Job<ImportJobData>;

      await expect(processor.process(job)).rejects.toThrow(
        'Unsupported import format: xml',
      );
    });

    it('should send success notification email after import', async () => {
      const dto: DataImportRequestDto = {
        format: 'csv',
        csvData: [],
        fieldMappings: {
          account: 'a',
          date: 'd',
          amount: 'a',
          description: 'd',
          notes: 'n',
          category: 'c',
        },
        accountMappings: {},
        categoryMappings: {},
      };

      const job = {
        id: 'job-6',
        data: { userId: mockUserId, dto } as ImportJobData,
        updateProgress: jest.fn(),
      } as unknown as Job<ImportJobData>;

      csvEngine.execute.mockResolvedValue({ processed: 5, failed: 1 });

      await processor.process(job);

      expect(emailService.sendImportCompletionEmail).toHaveBeenCalledWith({
        to: mockUserEmail,
        userName: 'Test User',
        processedCount: 5,
        failedCount: 1,
      });
    });

    it('should send error notification email when engine throws', async () => {
      const dto: DataImportRequestDto = {
        format: 'ofe',
        ofeContent: 'invalid-content',
      };

      const job = {
        id: 'job-7',
        data: { userId: mockUserId, dto } as ImportJobData,
        updateProgress: jest.fn(),
      } as unknown as Job<ImportJobData>;

      ofeEngine.execute.mockRejectedValue(new Error('Parse error'));

      await expect(processor.process(job)).rejects.toThrow('Parse error');

      expect(emailService.sendImportErrorEmail).toHaveBeenCalledWith({
        to: mockUserEmail,
        userName: 'Test User',
        errorMessage: 'Parse error',
      });
    });

    it('should send success notification to user after import', async () => {
      const dto: DataImportRequestDto = {
        format: 'json',
        jsonContent: '[]',
      };

      const job = {
        id: 'job-8',
        data: { userId: mockUserId, dto } as ImportJobData,
        updateProgress: jest.fn(),
      } as unknown as Job<ImportJobData>;

      jsonEngine.execute.mockResolvedValue({ processed: 0, failed: 0 });

      await processor.process(job);

      expect(
        notificationsService.createSystemNotification,
      ).toHaveBeenCalledWith({
        userId: mockUserId,
        message: 'Import data finished successfully',
        icon: '🔔',
        type: expect.any(String),
      });
    });

    it('should send error notification to user when engine throws', async () => {
      const dto: DataImportRequestDto = {
        format: 'csv',
        csvData: [],
        fieldMappings: {
          account: 'a',
          date: 'd',
          amount: 'a',
          description: 'd',
          notes: 'n',
          category: 'c',
        },
        accountMappings: {},
        categoryMappings: {},
      };

      const job = {
        id: 'job-9',
        data: { userId: mockUserId, dto } as ImportJobData,
        updateProgress: jest.fn(),
      } as unknown as Job<ImportJobData>;

      csvEngine.execute.mockRejectedValue(new Error('DB error'));

      await expect(processor.process(job)).rejects.toThrow('DB error');

      expect(
        notificationsService.createSystemNotification,
      ).toHaveBeenCalledWith({
        userId: mockUserId,
        message: 'Import data finished with error',
        icon: '⚠️',
        type: expect.any(String),
      });
    });
  });
});
