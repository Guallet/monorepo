import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import { UpdateNordigenCredentialsRequest } from "@guallet/api-client";

const NORDIGEN_CREDENTIALS_QUERY_KEY = ["user", "nordigen-credentials"];

export function useNordigenCredentials() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: NORDIGEN_CREDENTIALS_QUERY_KEY,
    queryFn: async () => {
      return await gualletClient.user.getNordigenCredentials();
    },
  });

  return {
    credentials: query.data ?? null,
    ...query,
  };
}

export function useNordigenCredentialsMutations() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const updateNordigenCredentialsMutation = useMutation({
    mutationFn: async (request: UpdateNordigenCredentialsRequest) => {
      return await gualletClient.user.updateNordigenCredentials(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NORDIGEN_CREDENTIALS_QUERY_KEY,
      });
    },
  });

  const deleteNordigenCredentialsMutation = useMutation({
    mutationFn: async () => {
      return await gualletClient.user.deleteNordigenCredentials();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NORDIGEN_CREDENTIALS_QUERY_KEY,
      });
    },
  });

  return {
    updateNordigenCredentialsMutation,
    deleteNordigenCredentialsMutation,
  };
}
