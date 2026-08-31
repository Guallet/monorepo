import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { UserPrincipal } from '../../auth/user-principal.js';

describe('ReportsController', () => {
  let controller: ReportsController;

  const mockReportsService = {
    getCashFlowReport: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCashflowReport', () => {
    it('should return cashflow report for current year', async () => {
      const currentYear = new Date().getFullYear();
      const mockReport = {
        year: currentYear,
        totalTransactions: 100,
        data: [],
      };

      const mockQuery = {
        accounts: [],
        categories: [],
        startDate: '',
        endDate: '',
      };

      mockReportsService.getCashFlowReport.mockResolvedValue(mockReport);

      const result = await controller.getCashflowReport(
        mockUser,
        mockQuery,
        2026,
      );

      expect(result).toEqual(mockReport);
      expect(mockReportsService.getCashFlowReport).toHaveBeenCalledWith({
        user_id: mockUser.id,
        year: currentYear,
      });
    });

    it('should return cashflow report for specified year', async () => {
      const year = 2023;
      const mockReport = {
        year: year,
        totalTransactions: 50,
        data: [],
      };

      const mockQuery = {
        accounts: [],
        categories: [],
        startDate: '',
        endDate: '',
      };

      mockReportsService.getCashFlowReport.mockResolvedValue(mockReport);

      const result = await controller.getCashflowReport(
        mockUser,
        mockQuery,
        year,
      );

      expect(result).toEqual(mockReport);
      expect(mockReportsService.getCashFlowReport).toHaveBeenCalledWith({
        user_id: mockUser.id,
        year: year,
      });
    });

    it('should handle empty report data', async () => {
      const year = 2024;
      const mockReport = {
        year: year,
        totalTransactions: 0,
        data: [],
      };

      const mockQuery = {
        accounts: [],
        categories: [],
        startDate: '',
        endDate: '',
      };

      mockReportsService.getCashFlowReport.mockResolvedValue(mockReport);

      const result = await controller.getCashflowReport(
        mockUser,
        mockQuery,
        year,
      );

      expect(result).toEqual(mockReport);
      expect(result.totalTransactions).toBe(0);
      expect(result.data).toEqual([]);
    });
  });
});
