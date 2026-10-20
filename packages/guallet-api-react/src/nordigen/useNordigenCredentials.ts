import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';
import { SaveNordigenCredentialsRequest } from '@guallet/api-client';

const KEY = ['nordigen', 'credentials'];

export function useNordigenCredentials() {
  const client = useGualletClient();
  const query = useQuery({
    queryKey: KEY,
    queryFn: () => client.nordigen.getCredentialStatus(),
  });
  return { credentialStatus: query.data ?? null, ...query };
}

export function useNordigenCredentialMutations() {
  const client = useGualletClient();
  const queryClient = useQueryClient();
  const saveCredentialsMutation = useMutation({
    mutationFn: (request: SaveNordigenCredentialsRequest) =>
      client.nordigen.saveCredentials(request),
    onSuccess: (data) => queryClient.setQueryData(KEY, data),
  });
  const deleteCredentialsMutation = useMutation({
    mutationFn: () => client.nordigen.deleteCredentials(),
    onSuccess: (data) => queryClient.setQueryData(KEY, data),
  });
  return { saveCredentialsMutation, deleteCredentialsMutation };
}
