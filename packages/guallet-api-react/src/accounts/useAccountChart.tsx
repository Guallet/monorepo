import { useQuery } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';

const ACCOUNT_CHARTS_QUERY_KEY = 'accounts-charts';

export function useAccountCharts(
  accountId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    enabled: !!accountId,
    queryKey: [
      ACCOUNT_CHARTS_QUERY_KEY,
      accountId,
      startDate?.toISOString(),
      endDate?.toISOString(),
    ],
    queryFn: async () => {
      if (!accountId) return null;
      return await gualletClient.accounts.getAccountChartData(
        accountId,
        startDate,
        endDate,
      );
    },
  });

  return {
    ...query,
  };
}
