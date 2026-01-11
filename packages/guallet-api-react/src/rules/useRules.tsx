import { RuleDto, FieldDefinitionDto } from '@guallet/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';

export const RULES_QUERY_KEY = 'rules';
export const RULES_FIELD_DEFINITIONS_QUERY_KEY = 'rules-field-definitions';

export function useRules() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [RULES_QUERY_KEY],
    queryFn: async () => {
      const rules = await gualletClient.rules.getAll();

      // Prime the cache for each rule by ID
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

export function useRule(id: string | null) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    enabled: !!id,
    queryKey: [RULES_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.rules.get(id!);
    },
    gcTime: 1000 * 60 * 60, // 1 Hour
    staleTime: 1000 * 60 * 60, // 1 Hour
  });

  return { rule: query.data ?? null, ...query };
}

export function useFieldDefinitions() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [RULES_FIELD_DEFINITIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.rules.getFieldDefinitions();
    },
    gcTime: 1000 * 60 * 60 * 24, // 24 Hours (field definitions rarely change)
    staleTime: 1000 * 60 * 60 * 24, // 24 Hours
  });

  return {
    fieldDefinitions:
      query.data?.fields?.filter(
        (dto): dto is FieldDefinitionDto => dto !== undefined,
      ) ?? [],
    ...query,
  };
}
