import { AiChatMessageRole } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { Box, Text } from '@mantine/core';

interface ChatMessageBubbleProps {
  role: AiChatMessageRole;
  content: string;
}

export function ChatMessageBubble({
  role,
  content,
}: Readonly<ChatMessageBubbleProps>) {
  const { spacing, borderRadius, colors } = useTheme();
  const isUser = role === 'user';

  return (
    <Box
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        padding: `${spacing.sm}px ${spacing.md}px`,
        borderRadius: borderRadius.lg,
        backgroundColor: isUser ? colors.primary : 'var(--mantine-color-gray-0)',
        border: isUser ? 'none' : '1px solid var(--mantine-color-gray-2)',
      }}
    >
      <Text
        size="sm"
        c={isUser ? 'white' : undefined}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {content}
      </Text>
    </Box>
  );
}
