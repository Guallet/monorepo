import { CashflowDataDto } from '@guallet/api-client';
import { useQuery } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';

const REPORTS_QUERY_KEY = 'reports';

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
