import {
  CreateAiAgentRequest,
  CreateAiProviderConnectionRequest,
  UpdateAiAgentRequest,
  UpdateAiProviderConnectionRequest,
} from '@guallet/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';
import {
  AI_AGENTS_QUERY_KEY,
  AI_MODELS_QUERY_KEY,
  AI_PROVIDER_CONNECTIONS_QUERY_KEY,
} from './useAi';

export function useAiMutations() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const invalidateConnections = async () => {
    await queryClient.invalidateQueries({
      queryKey: [AI_PROVIDER_CONNECTIONS_QUERY_KEY],
    });
  };

  const invalidateAgents = async () => {
    await queryClient.invalidateQueries({ queryKey: [AI_AGENTS_QUERY_KEY] });
  };

  const createProviderConnectionMutation = useMutation({
    mutationFn: async (request: CreateAiProviderConnectionRequest) => {
      return await gualletClient.ai.createProviderConnection(request);
    },
    onSuccess: async () => {
      await invalidateConnections();
    },
  });

  const updateProviderConnectionMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateAiProviderConnectionRequest;
    }) => {
      return await gualletClient.ai.updateProviderConnection({ id, request });
    },
    onSuccess: async (_data, variables) => {
      queryClient.removeQueries({
        queryKey: [AI_MODELS_QUERY_KEY, variables.id],
      });
      await invalidateConnections();
    },
  });

  const deleteProviderConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await gualletClient.ai.deleteProviderConnection(id);
    },
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: [AI_MODELS_QUERY_KEY, id] });
      await invalidateConnections();
      await invalidateAgents();
    },
  });

  const createAgentMutation = useMutation({
    mutationFn: async (request: CreateAiAgentRequest) => {
      return await gualletClient.ai.createAgent(request);
    },
    onSuccess: invalidateAgents,
  });

  const updateAgentMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string;
      request: UpdateAiAgentRequest;
    }) => {
      return await gualletClient.ai.updateAgent({ id, request });
    },
    onSuccess: invalidateAgents,
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await gualletClient.ai.deleteAgent(id);
    },
    onSuccess: invalidateAgents,
  });

  return {
    createProviderConnectionMutation,
    updateProviderConnectionMutation,
    deleteProviderConnectionMutation,
    createAgentMutation,
    updateAgentMutation,
    deleteAgentMutation,
  };
}
