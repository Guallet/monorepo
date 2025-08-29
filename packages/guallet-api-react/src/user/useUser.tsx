import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";

const USER_QUERY_KEY = "user";

export function useUser() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.user.getUserDetails();
    },
  });

  return {
    user: query.data ?? null,
    ...query,
  };
}

export function useUserSettings() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [USER_QUERY_KEY, "settings"],
    queryFn: async () => {
      return await gualletClient.user.getUserSettings();
    },
  });

  return {
    settings: query.data ?? null,
    ...query,
  };
}
