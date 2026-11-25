import { GualletClientImpl } from './../GualletClient';
import {
  CashflowDataDto,
  MoneyFlowFilters,
  MoneyFlowReportDto,
} from './reports.models';

const REPORTS_PATH = 'reports';

export class ReportsApi {
  constructor(private readonly client: GualletClientImpl) {}

  getMoneyFlowReport({
    startDate,
    endDate,
    accounts,
  }: MoneyFlowFilters): Promise<MoneyFlowReportDto> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    if (accounts?.length) {
      params.set('accounts', accounts.join(','));
    }

    return this.client.get<MoneyFlowReportDto>({
      path: `${REPORTS_PATH}/money-flow?${params}`,
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
