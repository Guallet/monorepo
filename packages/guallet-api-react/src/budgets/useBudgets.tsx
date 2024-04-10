import { BudgetDto } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const BUDGETS_QUERY_KEY = "budgets";

export function useBudgets() {
  const gualletClient = useGualletClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [BUDGETS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.budgets.getAll();
    },
    gcTime: 1000 * 60 * 60, // 1 Hour
    staleTime: 1000 * 60 * 60, // 1 Hour
  });

  return {
    budgets: data?.filter((dto): dto is BudgetDto => dto !== undefined) ?? [],
    isLoading,
    refetch,
    isFetching,
  };
}
