import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { afterEach } from 'vitest';

describe('ReportsController', () => {
  let controller: ReportsController;

  const mockReportsService = {
    getCashFlowReport: vi.fn(),
    getMoneyFlowReport: vi.fn(),
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
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMoneyFlowReport', () => {
    const start = '2025-12-31T18:30:00.000-05:30';
    const end = '2026-02-01T05:29:59.999Z';
    const accountId = '00000000-0000-4000-8000-000000000001';

    it('passes the authenticated user, selected accounts and date instants to the service', async () => {
      const report = { rows: [] };
      mockReportsService.getMoneyFlowReport.mockResolvedValue(report);

      await expect(
        controller.getMoneyFlowReport(mockUser, start, end, accountId),
      ).resolves.toEqual(report);
      expect(mockReportsService.getMoneyFlowReport).toHaveBeenCalledWith({
        user_id: mockUser.id,
        accounts: [accountId],
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date(end),
      });
    });

    it.each([
      [undefined, end, accountId],
      ['2026-01-01', end, accountId],
      ['2026-02-30T00:00:00.000Z', end, accountId],
      [end, start, accountId],
      [start, end, 'invalid'],
    ])('rejects invalid filters (%s, %s, %s)', async (from, to, accounts) => {
      await expect(
        controller.getMoneyFlowReport(mockUser, from, to, accounts),
      ).rejects.toHaveProperty('status', 400);
      expect(mockReportsService.getMoneyFlowReport).not.toHaveBeenCalled();
    });
  });

  describe('getCashflowReport', () => {
    it('should return cashflow report for current year', async () => {
      const currentYear = new Date().getFullYear();
      const mockReport = {
        year: currentYear,
        totalTransactions: 100,
        data: [],
      };

      mockReportsService.getCashFlowReport.mockResolvedValue(mockReport);

      const result = await controller.getCashflowReport(mockUser, 2026);

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

      mockReportsService.getCashFlowReport.mockResolvedValue(mockReport);

      const result = await controller.getCashflowReport(mockUser, year);

      expect(result).toEqual(mockReport);
      expect(mockReportsService.getCashFlowReport).toHaveBeenCalledWith({
        user_id: mockUser.id,
        year: year,
      });
    });

    it('should pass supported filters to the report service', async () => {
      const report = { year: 2023, totalTransactions: 0, data: [] };
      mockReportsService.getCashFlowReport.mockResolvedValue(report);

      await controller.getCashflowReport(
        mockUser,
        2023,
        '00000000-0000-4000-8000-000000000001,00000000-0000-4000-8000-000000000002',
        '00000000-0000-4000-8000-000000000003',
        '2023-02-01T00:00:00.000Z',
        '2023-02-28T00:00:00.000Z',
      );

      expect(mockReportsService.getCashFlowReport).toHaveBeenCalledWith({
        user_id: mockUser.id,
        year: 2023,
        accounts: [
          '00000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000002',
        ],
        categories: ['00000000-0000-4000-8000-000000000003'],
        startDate: new Date('2023-02-01T00:00:00.000Z'),
        endDate: new Date('2023-02-28T00:00:00.000Z'),
      });
    });

    it('preserves date instants when the API and browser use different time zones', async () => {
      vi.stubEnv('TZ', 'UTC');

      await controller.getCashflowReport(
        mockUser,
        2025,
        undefined,
        undefined,
        '2025-10-15T14:00:00.000Z',
        '2025-10-16T13:59:59.999Z',
      );

      const reportFilters =
        mockReportsService.getCashFlowReport.mock.calls[0][0];
      expect(reportFilters.startDate.toISOString()).toBe(
        '2025-10-15T14:00:00.000Z',
      );
      expect(reportFilters.endDate.toISOString()).toBe(
        '2025-10-16T13:59:59.999Z',
      );
    });

    it('should handle empty report data', async () => {
      const year = 2024;
      const mockReport = {
        year: year,
        totalTransactions: 0,
        data: [],
      };

      mockReportsService.getCashFlowReport.mockResolvedValue(mockReport);

      const result = await controller.getCashflowReport(mockUser, year);

      expect(result).toEqual(mockReport);
      expect(result.totalTransactions).toBe(0);
      expect(result.data).toEqual([]);
    });
  });
});
