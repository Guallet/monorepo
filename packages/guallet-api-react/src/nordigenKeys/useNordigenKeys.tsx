import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import {
  CreateNordigenKeyRequest,
  UpdateNordigenKeyRequest,
  LinkAccountsRequest,
} from "@guallet/api-client";

const NORDIGEN_KEYS_QUERY_KEY = ["nordigen-keys"];

export function useNordigenKeys() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: NORDIGEN_KEYS_QUERY_KEY,
    queryFn: async () => {
      return await gualletClient.nordigenKeys.getAll();
    },
  });

  return {
    keys: query.data ?? [],
    ...query,
  };
}

export function useNordigenKey(id: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [...NORDIGEN_KEYS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.nordigenKeys.getById(id);
    },
    enabled: !!id,
  });

  return {
    key: query.data ?? null,
    ...query,
  };
}

export function useNordigenKeysMutations() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (request: CreateNordigenKeyRequest) => {
      return await gualletClient.nordigenKeys.create(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NORDIGEN_KEYS_QUERY_KEY,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateNordigenKeyRequest;
    }) => {
      return await gualletClient.nordigenKeys.update(id, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NORDIGEN_KEYS_QUERY_KEY,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await gualletClient.nordigenKeys.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NORDIGEN_KEYS_QUERY_KEY,
      });
    },
  });

  const linkAccountsMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: LinkAccountsRequest;
    }) => {
      return await gualletClient.nordigenKeys.linkAccounts(id, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NORDIGEN_KEYS_QUERY_KEY,
      });
    },
  });

  const unlinkAccountsMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: LinkAccountsRequest;
    }) => {
      return await gualletClient.nordigenKeys.unlinkAccounts(id, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NORDIGEN_KEYS_QUERY_KEY,
      });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    linkAccountsMutation,
    unlinkAccountsMutation,
  };
}
