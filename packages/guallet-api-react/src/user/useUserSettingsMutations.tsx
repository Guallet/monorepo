import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import { UpdateUserSettingsRequest } from "@guallet/api-client";

const USER_QUERY_KEY = "user";

export function useUserSettingsMutations() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const updateUserSettingsMutation = useMutation({
    mutationFn: async (request: UpdateUserSettingsRequest) => {
      return await gualletClient.user.updateUserSettings(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEY, "settings"],
      });
    },
  });

  return {
    updateUserSettingsMutation,
  };
}
