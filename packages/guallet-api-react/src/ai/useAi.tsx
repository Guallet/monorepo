import {
  AiAgentDto,
  AiProviderConnectionDto,
  AiModelDto,
} from '@guallet/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';

export const AI_PROVIDER_CONNECTIONS_QUERY_KEY = 'ai-provider-connections';
export const AI_AGENTS_QUERY_KEY = 'ai-agents';
export const AI_MODELS_QUERY_KEY = 'ai-models';

export function useAiProviderConnections() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [AI_PROVIDER_CONNECTIONS_QUERY_KEY],
    queryFn: async () => {
      const connections = await gualletClient.ai.getProviderConnections();
      connections.forEach((connection) => {
        queryClient.setQueryData(
          [AI_PROVIDER_CONNECTIONS_QUERY_KEY, connection.id],
          connection,
        );
      });
      return connections;
    },
  });

  return {
    connections:
      query.data?.filter(
        (dto): dto is AiProviderConnectionDto => dto !== undefined,
      ) ?? [],
    ...query,
  };
}

export function useAiModels(connectionId?: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [AI_MODELS_QUERY_KEY, connectionId],
    queryFn: async () => {
      return await gualletClient.ai.getModels(connectionId!);
    },
    enabled: Boolean(connectionId),
    staleTime: 1000 * 60 * 15,
  });

  return {
    models:
      query.data?.filter((dto): dto is AiModelDto => dto !== undefined) ?? [],
    ...query,
  };
}

export function useAiAgents() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [AI_AGENTS_QUERY_KEY],
    queryFn: async () => {
      const agents = await gualletClient.ai.getAgents();
      agents.forEach((agent) => {
        queryClient.setQueryData([AI_AGENTS_QUERY_KEY, agent.id], agent);
      });
      return agents;
    },
  });

  return {
    agents:
      query.data?.filter((dto): dto is AiAgentDto => dto !== undefined) ?? [],
    ...query,
  };
}
