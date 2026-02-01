import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';
import { RuleDto } from '@guallet/api-client';

const RULES_QUERY_KEY = 'rules';

export function useRules() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [RULES_QUERY_KEY],
    queryFn: async () => {
      const rules = await gualletClient.rules.getAll();

      // Prime the cache with individual rules
      rules?.forEach((rule) => {
        queryClient.setQueryData([RULES_QUERY_KEY, rule.id], rule);
      });

      return rules;
    },
  });

  return {
    rules: query.data?.filter((dto): dto is RuleDto => dto !== undefined) ?? [],
    ...query,
  };
}

export function useRule(id: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [RULES_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.rules.get(id);
    },
    enabled: !!id,
  });

  return {
    rule: query.data ?? null,
    ...query,
  };
}
