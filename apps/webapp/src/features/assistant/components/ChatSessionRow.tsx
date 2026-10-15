import { AiChatSessionDto } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { ActionIcon, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ChatSessionRowProps {
  session: AiChatSessionDto;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function ChatSessionRow({
  session,
  isActive,
  onSelect,
  onDelete,
}: Readonly<ChatSessionRowProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <UnstyledButton
      w="100%"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        padding: `${spacing.sm}px ${spacing.md}px`,
        background: isActive
          ? 'var(--mantine-color-blue-0)'
          : hovered
            ? 'var(--mantine-color-gray-0)'
            : 'transparent',
        transition: 'background 150ms ease',
      }}
    >
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={isActive ? 600 : 500} truncate>
          {session.title}
        </Text>
        <Text size="xs" c="dimmed" truncate>
          {session.agentName}
        </Text>
      </Stack>
      <Group gap={0} style={{ flexShrink: 0 }}>
        {(hovered || isActive) && (
          <ActionIcon
            component="span"
            variant="subtle"
            color="red"
            size="sm"
            aria-label={t(
              'screens.assistant.sessions.deleteButton',
              'Delete chat',
            )}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <IconTrash size={14} strokeWidth={1.5} />
          </ActionIcon>
        )}
      </Group>
    </UnstyledButton>
  );
}
