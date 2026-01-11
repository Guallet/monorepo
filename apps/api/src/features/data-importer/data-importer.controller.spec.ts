import { Test, TestingModule } from '@nestjs/testing';
import { DataImporterController } from './data-importer.controller';
import { DataImporterService } from './data-importer.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { CsvImportRequestDto } from './dto/csv-import-request.dto';

describe('DataImporterController', () => {
  let controller: DataImporterController;

  const mockDataImporterService = {
    importCsvData: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataImporterController],
      providers: [
        {
          provide: DataImporterService,
          useValue: mockDataImporterService,
        },
      ],
    }).compile();

    controller = module.get<DataImporterController>(DataImporterController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importCsv', () => {
    it('should call dataImporterService.importCsvData with correct parameters', () => {
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

      const expectedResponse = {
        message:
          'CSV import started. You will receive an email when the import is complete.',
        processedCount: 0,
        failedCount: 0,
      };

      mockDataImporterService.importCsvData.mockReturnValue(expectedResponse);

      const result = controller.importCsv(mockUser, dto);

      expect(mockDataImporterService.importCsvData).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
