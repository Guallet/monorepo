import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const ACCOUNT_CHARTS_QUERY_KEY = "accounts-charts";

export function useAccountCharts(accountId: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [ACCOUNT_CHARTS_QUERY_KEY, accountId],
    queryFn: async () => {
      return await gualletClient.accounts.getAccountChartData(accountId);
    },
  });

  return {
    ...query,
  };
}
