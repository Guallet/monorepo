import {
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
} from '@guallet/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';

const INSTITUTIONS_QUERY_KEY = 'institutions';

export function useInstitutionMutations() {
  const queryClient = useQueryClient();
  const gualletClient = useGualletClient();

  const createInstitutionMutation = useMutation({
    mutationFn: async ({ request }: { request: CreateInstitutionRequest }) => {
      return await gualletClient.institutions.create(request);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [INSTITUTIONS_QUERY_KEY],
      });
    },
    onError: async (error) => {
      console.error(error);
    },
  });

  const updateInstitutionMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateInstitutionRequest;
    }) => {
      return await gualletClient.accounts.update(id, request);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({
        queryKey: [INSTITUTIONS_QUERY_KEY, data.id],
      });
    },
    onError: async (error) => {
      console.error(error);
    },
  });

  return {
    createInstitutionMutation,
    updateInstitutionMutation,
  };
}
