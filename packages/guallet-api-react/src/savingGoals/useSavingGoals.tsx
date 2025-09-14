import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import { SavingGoalDto } from "@guallet/api-client/src/savingGoals";

const SAVING_GOALS_QUERY_KEY = "savingGoals";

export function useSavingGoals() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [SAVING_GOALS_QUERY_KEY],
    queryFn: async () => {
      const goals = await gualletClient.savingGoals.getAll();
      // Fill the cache with individual goals
      goals.forEach((goal) => {
        queryClient.setQueryData([SAVING_GOALS_QUERY_KEY, goal.id], goal);
      });
      return goals;
    },
  });

  return {
    savingGoals:
      query.data?.filter((dto): dto is SavingGoalDto => dto !== undefined) ??
      [],
    ...query,
  };
}

export function useSavingGoal(id: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [SAVING_GOALS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.savingGoals.get(id);
    },
  });

  return {
    savingGoal: query.data ?? null,
    ...query,
  };
}
