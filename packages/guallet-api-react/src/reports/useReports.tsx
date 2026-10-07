import { useQuery } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';
import type { MonthlyReportRequest } from '@guallet/api-client';

const REPORTS_QUERY_KEY = 'reports';

export function useMonthlyReport(args: MonthlyReportRequest) {
  const client = useGualletClient();
  const query = useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'monthly', args],
    queryFn: () => client.reports.getMonthlyReport(args),
    staleTime: 0,
  });
  return { report: query.data, ...query };
}

export function useCashflowReports(args: {
  year: number;
  accounts?: string[] | null;
  categories?: string[] | null;
  startDate?: Date | null;
  endDate?: Date | null;
}) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [REPORTS_QUERY_KEY, 'cashflow', args],
    queryFn: async () => {
      return await gualletClient.reports.getCashflowReport(args);
    },
    enabled: !!args.year,
  });

  return {
    cashflowData: query.data,
    ...query,
  };
}

export function useReports() {
  // Generic reports hook - can be extended for other report types
  const gualletClient = useGualletClient();

  return {
    getCashflowReport: (args: {
      year: number;
      accounts?: string[] | null;
      categories?: string[] | null;
      startDate?: Date | null;
      endDate?: Date | null;
    }) => gualletClient.reports.getCashflowReport(args),
  };
}
