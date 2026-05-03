import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';

export function useUserMutations() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const deleteUserAccountMutation = useMutation({
    mutationFn: async () => {
      await gualletClient.user.deleteUserAccount();
    },
    onSuccess: () => {
      queryClient.removeQueries();
    },
  });

  return {
    deleteUserAccountMutation,
  };
}
