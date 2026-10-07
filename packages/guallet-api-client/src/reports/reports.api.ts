import { GualletClientImpl } from './../GualletClient';
import {
  CashflowDataDto,
  MonthlyReportDto,
  MonthlyReportRequest,
} from './reports.models';

const REPORTS_PATH = 'reports';

export class ReportsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getMonthlyReport(
    args: MonthlyReportRequest,
  ): Promise<MonthlyReportDto> {
    const params = new URLSearchParams({
      year: args.year.toString(),
      month: args.month.toString(),
    });
    if (args.accounts?.length) params.set('accounts', args.accounts.join(','));
    if (args.categories?.length)
      params.set('categories', args.categories.join(','));
    return this.client.get<MonthlyReportDto>({
      path: `${REPORTS_PATH}/monthly?${params.toString()}`,
    });
  }

  async getCashflowReport(args: {
    year: number;
    accounts?: string[] | null;
    categories?: string[] | null;
    startDate?: Date | null;
    endDate?: Date | null;
  }): Promise<CashflowDataDto> {
    const params = new URLSearchParams({
      year: args.year.toString(),
    });

    if (args.accounts?.length) {
      params.append('accounts', args.accounts.join(','));
    }
    if (args.categories?.length) {
      params.append('categories', args.categories.join(','));
    }
    if (args.startDate) {
      params.append('startDate', args.startDate.toISOString());
    }
    if (args.endDate) {
      params.append('endDate', args.endDate.toISOString());
    }

    return await this.client.get<CashflowDataDto>({
      path: `${REPORTS_PATH}/cashflow?${params.toString()}`,
    });
  }
}
