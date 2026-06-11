import { EmptyState } from '@/components/EmptyState/EmptyState';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useTheme } from '@guallet/ui-react';
import {
  useAiAgents,
  useAiChatMessages,
  useAiChatMutations,
  useAiChatSessions,
  useAiChatStream,
} from '@guallet/api-react';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  ScrollArea,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMessageCircle, IconPlus, IconRobot } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatComposer } from '../components/ChatComposer';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ChatSessionRow } from '../components/ChatSessionRow';

export function AiAssistantScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spacing } = useTheme();
  const { agents, isLoading: isLoadingAgents } = useAiAgents();
  const { sessions, isLoading: isLoadingSessions } = useAiChatSessions();
  const { createChatSessionMutation, deleteChatSessionMutation } =
    useAiChatMutations();
  const { sendMessage, abort, streamingReply, isStreaming, error } =
    useAiChatStream();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(
    null,
  );
  const { messages } = useAiChatMessages(activeSessionId ?? undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamingReply, pendingUserMessage]);

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) ?? null;

  const agentOptions = agents.map((agent) => ({
    value: agent.id,
    label: agent.modelName ? `${agent.name} (${agent.modelName})` : agent.name,
  }));
  const effectiveAgentId =
    selectedAgentId ?? (agents.length > 0 ? agents[0].id : null);

  const showPendingUserMessage =
    pendingUserMessage !== null &&
    !messages.some(
      (message) =>
        message.role === 'user' && message.content === pendingUserMessage,
    );

  const handleSend = async (content: string) => {
    try {
      let sessionId = activeSessionId;
      if (!sessionId) {
        if (!effectiveAgentId) return;
        const session = await createChatSessionMutation.mutateAsync({
          agentId: effectiveAgentId,
        });
        sessionId = session.id;
        setActiveSessionId(sessionId);
      }
      setPendingUserMessage(content);
      await sendMessage({ sessionId, content });
    } catch (sendError) {
      console.error('Failed to send chat message:', sendError);
      notifications.show({
        title: t('screens.assistant.error.title', 'Error'),
        message: t(
          'screens.assistant.error.sendMessage',
          'Failed to send the message.',
        ),
        color: 'error',
      });
    } finally {
      setPendingUserMessage(null);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSessionMutation.mutateAsync(sessionId);
      if (sessionId === activeSessionId) {
        setActiveSessionId(null);
      }
    } catch (deleteError) {
      console.error('Failed to delete chat session:', deleteError);
      notifications.show({
        title: t('screens.assistant.error.title', 'Error'),
        message: t(
          'screens.assistant.error.deleteSession',
          'Failed to delete the chat.',
        ),
        color: 'error',
      });
    }
  };

  const isLoading = isLoadingAgents || isLoadingSessions;
  const hasAgents = agents.length > 0;

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.assistant.title', 'AI Assistant')}
    >
      {!isLoading && !hasAgents ? (
        <EmptyState
          illustration={<IconRobot size={48} strokeWidth={1.5} />}
          title={t('screens.assistant.empty.title', 'No agents yet')}
          description={t(
            'screens.assistant.empty.description',
            'Create an AI agent in Settings before starting a chat.',
          )}
          primaryAction={{
            label: t('screens.assistant.empty.createAgent', 'Create agent'),
            icon: <IconPlus size={16} strokeWidth={1.5} />,
            onClick: () => navigate({ to: '/settings/ai/new' }),
          }}
        />
      ) : (
        <Flex
          gap={spacing.md}
          px={spacing.md}
          pb={spacing.md}
          style={{ height: 'calc(100dvh - 150px)' }}
        >
          <Card
            withBorder
            shadow="sm"
            radius="lg"
            p={0}
            w={300}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <Box p={spacing.sm}>
              <Button
                fullWidth
                variant="light"
                leftSection={<IconPlus size={16} strokeWidth={1.5} />}
                onClick={() => setActiveSessionId(null)}
              >
                {t('screens.assistant.sessions.newChatButton', 'New chat')}
              </Button>
            </Box>
            <Divider />
            <ScrollArea style={{ flex: 1 }}>
              {sessions.length === 0 ? (
                <Text size="xs" c="dimmed" ta="center" p={spacing.md}>
                  {t(
                    'screens.assistant.sessions.empty',
                    'Your chats from the last 30 days will appear here.',
                  )}
                </Text>
              ) : (
                sessions.map((session) => (
                  <ChatSessionRow
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={() => setActiveSessionId(session.id)}
                    onDelete={() => void handleDeleteSession(session.id)}
                  />
                ))
              )}
            </ScrollArea>
          </Card>

          <Card
            withBorder
            shadow="sm"
            radius="lg"
            p={0}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {activeSession ? (
              <Group
                gap={spacing.xs}
                px={spacing.md}
                py={spacing.sm}
                style={{
                  borderBottom: '1px solid var(--mantine-color-gray-2)',
                }}
              >
                <Text size="sm" fw={600} truncate style={{ flex: 1 }}>
                  {activeSession.title}
                </Text>
                <Badge variant="light" color="primary">
                  {activeSession.agentName}
                </Badge>
              </Group>
            ) : (
              <Group
                gap={spacing.xs}
                px={spacing.md}
                py={spacing.sm}
                style={{
                  borderBottom: '1px solid var(--mantine-color-gray-2)',
                }}
              >
                <Text size="sm" fw={600} style={{ flex: 1 }}>
                  {t('screens.assistant.newChat.title', 'New chat')}
                </Text>
                <Select
                  size="xs"
                  w={260}
                  data={agentOptions}
                  value={effectiveAgentId}
                  allowDeselect={false}
                  aria-label={t(
                    'screens.assistant.newChat.agentLabel',
                    'Agent',
                  )}
                  onChange={(value) => setSelectedAgentId(value)}
                />
              </Group>
            )}

            <ScrollArea style={{ flex: 1 }} p={spacing.md}>
              <Stack gap={spacing.sm}>
                {!activeSession &&
                  !showPendingUserMessage &&
                  streamingReply === '' && (
                    <Stack align="center" gap={spacing.xs} py={spacing.xxl}>
                      <IconMessageCircle size={40} strokeWidth={1.5} />
                      <Text c="dimmed" size="sm" ta="center" maw={420}>
                        {t(
                          'screens.assistant.newChat.hint',
                          'Ask anything about your finances — for example, "Which category did I spend the most on last year?"',
                        )}
                      </Text>
                    </Stack>
                  )}
                {messages.map((message) => (
                  <ChatMessageBubble
                    key={message.id}
                    role={message.role}
                    content={message.content}
                  />
                ))}
                {showPendingUserMessage && (
                  <ChatMessageBubble role="user" content={pendingUserMessage} />
                )}
                {streamingReply !== '' && (
                  <ChatMessageBubble role="assistant" content={streamingReply} />
                )}
                {error && (
                  <Text size="xs" c="error">
                    {t(
                      'screens.assistant.error.stream',
                      'The assistant could not reply. Please try again.',
                    )}
                  </Text>
                )}
                <Box ref={bottomRef} />
              </Stack>
            </ScrollArea>

            <Box
              p={spacing.sm}
              style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
            >
              <ChatComposer
                isStreaming={isStreaming}
                disabled={!activeSession && !effectiveAgentId}
                onSend={(content) => void handleSend(content)}
                onAbort={abort}
              />
            </Box>
          </Card>
        </Flex>
      )}
    </BaseScreen>
  );
}
