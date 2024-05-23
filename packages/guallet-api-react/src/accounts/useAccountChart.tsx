import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const ACCOUNT_CHARTS_QUERY_KEY = "accounts-charts";

export function useAccountCharts(accountId: string) {
  const gualletClient = useGualletClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [ACCOUNT_CHARTS_QUERY_KEY, accountId],
    queryFn: async () => {
      return await gualletClient.accounts.getAccountChartData(accountId);
    },
  });

  return {
    data: data ?? null,
    isLoading,
    refetch,
    isFetching,
  };
}
