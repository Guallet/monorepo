import { useTheme } from '@guallet/ui-react';
import { ActionIcon, Group, Textarea } from '@mantine/core';
import { IconPlayerStop, IconSend2 } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MAX_MESSAGE_LENGTH = 4000;

interface ChatComposerProps {
  isStreaming: boolean;
  disabled?: boolean;
  onSend: (content: string) => void;
  onAbort: () => void;
}

export function ChatComposer({
  isStreaming,
  disabled = false,
  onSend,
  onAbort,
}: Readonly<ChatComposerProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const [draft, setDraft] = useState('');

  const send = () => {
    const content = draft.trim();
    if (!content || isStreaming || disabled) return;
    setDraft('');
    onSend(content);
  };

  return (
    <Group gap={spacing.xs} align="flex-end" w="100%">
      <Textarea
        style={{ flex: 1 }}
        autosize
        minRows={1}
        maxRows={6}
        maxLength={MAX_MESSAGE_LENGTH}
        value={draft}
        disabled={disabled}
        placeholder={t(
          'screens.assistant.composer.placeholder',
          'Ask about your finances...',
        )}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            send();
          }
        }}
      />
      {isStreaming ? (
        <ActionIcon
          size="lg"
          variant="outline"
          color="red"
          aria-label={t('screens.assistant.composer.stopButton', 'Stop')}
          onClick={onAbort}
        >
          <IconPlayerStop size={18} strokeWidth={1.5} />
        </ActionIcon>
      ) : (
        <ActionIcon
          size="lg"
          aria-label={t('screens.assistant.composer.sendButton', 'Send')}
          disabled={disabled || draft.trim() === ''}
          onClick={send}
        >
          <IconSend2 size={18} strokeWidth={1.5} />
        </ActionIcon>
      )}
    </Group>
  );
}
