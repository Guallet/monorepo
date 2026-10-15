import { BaseScreen } from '@/components/Screens/BaseScreen';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { AiProvider, AiProviderConnectionDto } from '@guallet/api-client';
import { useAiProviderConnections } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconChevronRight,
  IconKey,
  IconPlus,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const providerLabels: Record<AiProvider, string> = {
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
  vercel_ai_gateway: 'Vercel AI Gateway',
};

function ProviderRow({
  connection,
  isLast,
  onClick,
}: Readonly<{
  connection: AiProviderConnectionDto;
  isLast: boolean;
  onClick: () => void;
}>) {
  const [hovered, setHovered] = useState(false);

  return (
    <UnstyledButton
      w="100%"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--mantine-color-gray-2)',
        background: hovered ? 'var(--mantine-color-gray-0)' : 'transparent',
        transition: 'background 150ms ease',
      }}
    >
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Group gap="xs" wrap="nowrap">
          <Text size="sm" fw={600} truncate>
            {connection.displayName}
          </Text>
          <Badge variant="light" color="primary">
            {providerLabels[connection.provider]}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" truncate>
          {connection.tokenHint ?? 'Token configured'}
        </Text>
      </Stack>
      <IconChevronRight
        size={16}
        strokeWidth={1.5}
        style={{
          color: 'var(--mantine-color-dimmed)',
          flexShrink: 0,
          opacity: hovered ? 1 : 0.4,
          transition: 'opacity 150ms',
        }}
      />
    </UnstyledButton>
  );
}

function ProvidersListHeader({ count }: Readonly<{ count: number }>) {
  const { t } = useTranslation();

  return (
    <Group
      justify="space-between"
      align="center"
      gap={14}
      px="md"
      py="sm"
      style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
    >
      <Group gap={12} align="center" style={{ flex: 1, minWidth: 0 }}>
        <IconKey size={24} strokeWidth={1.5} />
        <Stack gap={2}>
          <Text fw={700} size="md" style={{ letterSpacing: '-0.01em' }}>
            {t('screens.settings.ai.providers.savedTitle', 'Saved providers')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('screens.settings.ai.providers.count', {
              count,
              defaultValue_one: '{{count}} AI provider',
              defaultValue_other: '{{count}} AI providers',
            })}
          </Text>
        </Stack>
      </Group>
    </Group>
  );
}

export function AiProvidersScreen() {
  const navigate = useNavigate();
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { connections, isLoading } = useAiProviderConnections();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConnections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return connections;

    return connections.filter((connection) =>
      [
        connection.displayName,
        providerLabels[connection.provider],
        connection.tokenHint,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q)),
    );
  }, [connections, searchQuery]);

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.settings.ai.providers.title', 'AI providers')}
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: t(
          'screens.settings.ai.providers.searchPlaceholder',
          'Search AI providers...',
        ),
      }}
      actions={
        <Group gap="xs">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} strokeWidth={1.5} />}
            onClick={() => navigate({ to: '/settings/ai' })}
          >
            {t('screens.settings.ai.backButton', 'AI')}
          </Button>
          <Button
            leftSection={<IconPlus size={16} strokeWidth={1.5} />}
            onClick={() => navigate({ to: '/settings/ai/providers/new' })}
          >
            {t('screens.settings.ai.providers.addButton', 'Add provider')}
          </Button>
        </Group>
      }
    >
      <Stack maw={1100} mx="auto" gap={spacing.md} pb={spacing.xl}>
        {!isLoading && connections.length === 0 ? (
          <EmptyState
            illustration={<IconKey size={48} strokeWidth={1.5} />}
            title={t(
              'screens.settings.ai.providers.empty.title',
              'No AI providers',
            )}
            description={t(
              'screens.settings.ai.providers.empty.description',
              'Create an AI provider before adding agents.',
            )}
            primaryAction={{
              label: t(
                'screens.settings.ai.providers.addButton',
                'Add provider',
              ),
              icon: <IconPlus size={16} strokeWidth={1.5} />,
              onClick: () => navigate({ to: '/settings/ai/providers/new' }),
            }}
          />
        ) : !isLoading && filteredConnections.length === 0 ? (
          <EmptyState
            title={t(
              'screens.settings.ai.providers.emptyQuery.title',
              'No matching AI providers',
            )}
            description={t(
              'screens.settings.ai.providers.emptyQuery.description',
              'Try a different search term or clear the current filter to see all your AI providers.',
            )}
            primaryAction={{
              label: t(
                'screens.settings.ai.providers.emptyQuery.clearSearch',
                'Clear search',
              ),
              onClick: () => setSearchQuery(''),
            }}
          />
        ) : (
          <Card withBorder shadow="sm" radius="lg" p={0}>
            <ProvidersListHeader count={filteredConnections.length} />
            {filteredConnections.map((connection, index) => (
              <ProviderRow
                key={connection.id}
                connection={connection}
                isLast={index === filteredConnections.length - 1}
                onClick={() =>
                  navigate({
                    to: '/settings/ai/providers/$id',
                    params: { id: connection.id },
                  })
                }
              />
            ))}
          </Card>
        )}
      </Stack>
    </BaseScreen>
  );
}
