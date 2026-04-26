import { BudgetDto, TransactionDto } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const BUDGETS_QUERY_KEY = "budgets";

export function useBudgets(params?: { month?: number; year?: number }) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [BUDGETS_QUERY_KEY, params],
    queryFn: async () => {
      return await gualletClient.budgets.getAll(params);
    },
    gcTime: 1000 * 60 * 60, // 1 Hour
    staleTime: 1000 * 60 * 60, // 1 Hour
  });

  return {
    budgets:
      query.data?.filter((dto): dto is BudgetDto => dto !== undefined) ?? [],
    ...query,
  };
}

export function useBudget(
  budgetId: string,
  params?: { month?: number; year?: number },
) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [BUDGETS_QUERY_KEY, budgetId, params],
    queryFn: async () => {
      return await gualletClient.budgets.getById({ budgetId, params });
    },
  });

  return {
    budget: query.data ?? null,
    ...query,
  };
}

export function useBudgetTransactions({
  budgetId,
  args,
}: {
  budgetId: string;
  args: { month: number; year: number } | null;
}) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [BUDGETS_QUERY_KEY, budgetId, "transactions", args],
    queryFn: async () => {
      return await gualletClient.budgets.getBudgetTransactions({
        budgetId,
        params: args ?? undefined,
      });
    },
  });

  return {
    transactions:
      query.data?.filter((dto): dto is TransactionDto => dto !== undefined) ??
      [],
    ...query,
  };
}
