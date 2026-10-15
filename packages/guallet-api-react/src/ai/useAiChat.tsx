import { AiChatMessageDto, AiChatSessionDto } from '@guallet/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from '../GualletClientProvider';

export const AI_CHAT_SESSIONS_QUERY_KEY = 'ai-chat-sessions';
export const AI_CHAT_MESSAGES_QUERY_KEY = 'ai-chat-messages';

export function useAiChatSessions() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [AI_CHAT_SESSIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.ai.getChatSessions();
    },
  });

  return {
    sessions:
      query.data?.filter((dto): dto is AiChatSessionDto => dto !== undefined) ??
      [],
    ...query,
  };
}

export function useAiChatMessages(sessionId?: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [AI_CHAT_MESSAGES_QUERY_KEY, sessionId],
    queryFn: async () => {
      return await gualletClient.ai.getChatMessages(sessionId!);
    },
    enabled: Boolean(sessionId),
  });

  return {
    messages:
      query.data?.filter((dto): dto is AiChatMessageDto => dto !== undefined) ??
      [],
    ...query,
  };
}

export function useAiChatMutations() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const invalidateSessions = async () => {
    await queryClient.invalidateQueries({
      queryKey: [AI_CHAT_SESSIONS_QUERY_KEY],
    });
  };

  const createChatSessionMutation = useMutation({
    mutationFn: async ({ agentId }: { agentId: string }) => {
      return await gualletClient.ai.createChatSession({ agentId });
    },
    onSuccess: invalidateSessions,
  });

  const deleteChatSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await gualletClient.ai.deleteChatSession(id);
    },
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({
        queryKey: [AI_CHAT_MESSAGES_QUERY_KEY, id],
      });
      await invalidateSessions();
    },
  });

  return {
    createChatSessionMutation,
    deleteChatSessionMutation,
  };
}
