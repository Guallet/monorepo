import type {
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
} from '@guallet/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';

const INSTITUTIONS_QUERY_KEY = 'institutions';

export function useInstitutionMutations() {
  const queryClient = useQueryClient();
  const client = useGualletClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [INSTITUTIONS_QUERY_KEY] });

  const createInstitutionMutation = useMutation({
    mutationFn: ({ request }: { request: CreateInstitutionRequest }) =>
      client.institutions.create(request),
    onSuccess: (institution) => {
      queryClient.setQueryData(
        [INSTITUTIONS_QUERY_KEY, institution.id],
        institution,
      );
      void invalidate();
    },
  });
  const updateInstitutionMutation = useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateInstitutionRequest;
    }) => client.institutions.update(id, request),
    onSuccess: (institution) => {
      queryClient.setQueryData(
        [INSTITUTIONS_QUERY_KEY, institution.id],
        institution,
      );
      void invalidate();
    },
  });
  const deleteInstitutionMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => client.institutions.delete(id),
    onSuccess: (_, { id }) => {
      queryClient.removeQueries({
        queryKey: [INSTITUTIONS_QUERY_KEY, id],
        exact: true,
      });
      void invalidate();
    },
  });
  return {
    createInstitutionMutation,
    updateInstitutionMutation,
    deleteInstitutionMutation,
  };
}
