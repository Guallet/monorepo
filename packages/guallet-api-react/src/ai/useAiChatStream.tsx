import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { useGualletClient } from '../GualletClientProvider';
import {
  AI_CHAT_MESSAGES_QUERY_KEY,
  AI_CHAT_SESSIONS_QUERY_KEY,
} from './useAiChat';

/**
 * Sends a chat message and exposes the assistant reply as it streams in.
 * On completion the messages query is invalidated so the persisted messages
 * replace the locally streamed text.
 */
export function useAiChatStream() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();
  const [streamingReply, setStreamingReply] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async ({ sessionId, content }: { sessionId: string; content: string }) => {
      setError(null);
      setIsStreaming(true);
      setStreamingReply('');

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await gualletClient.ai.streamChatMessage({
          sessionId,
          request: { content },
          signal: abortController.signal,
        });

        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            setStreamingReply((previous) => previous + chunk);
          }
        }
      } catch (streamError) {
        if (!abortController.signal.aborted) {
          setError(
            streamError instanceof Error
              ? streamError
              : new Error('Failed to send message'),
          );
        }
      } finally {
        abortControllerRef.current = null;
        await queryClient.invalidateQueries({
          queryKey: [AI_CHAT_MESSAGES_QUERY_KEY, sessionId],
        });
        await queryClient.invalidateQueries({
          queryKey: [AI_CHAT_SESSIONS_QUERY_KEY],
        });
        setIsStreaming(false);
        setStreamingReply('');
      }
    },
    [gualletClient, queryClient],
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { sendMessage, abort, streamingReply, isStreaming, error };
}
