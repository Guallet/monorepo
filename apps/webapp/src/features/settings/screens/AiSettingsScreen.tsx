import { BaseScreen } from '@/components/Screens/BaseScreen';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { AiAgentDto, AiProvider } from '@guallet/api-client';
import { useAiAgents } from '@guallet/api-react';
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
  IconChevronRight,
  IconKey,
  IconPlus,
  IconRobot,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const providerLabels: Record<AiProvider, string> = {
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
  vercel_ai_gateway: 'Vercel AI Gateway',
};

function AgentRow({
  agent,
  isLast,
  onClick,
}: Readonly<{ agent: AiAgentDto; isLast: boolean; onClick: () => void }>) {
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
            {agent.name}
          </Text>
          <Badge variant="light" color="primary">
            {providerLabels[agent.provider]}
          </Badge>
        </Group>
        <Group gap={4} wrap="nowrap">
          <Text size="xs" c="dimmed" truncate>
            {agent.modelName ?? agent.modelId}
          </Text>
          <Text size="xs" c="dimmed" aria-hidden>
            ·
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {agent.connectionDisplayName}
          </Text>
        </Group>
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

function AgentsListHeader({ count }: Readonly<{ count: number }>) {
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
        <IconRobot size={24} strokeWidth={1.5} />
        <Stack gap={2}>
          <Text fw={700} size="md" style={{ letterSpacing: '-0.01em' }}>
            {t('screens.settings.ai.agents.savedTitle', 'Saved agents')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('screens.settings.ai.agents.count', {
              count,
              defaultValue_one: '{{count}} agent',
              defaultValue_other: '{{count}} agents',
            })}
          </Text>
        </Stack>
      </Group>
    </Group>
  );
}

export function AiSettingsScreen() {
  const navigate = useNavigate();
  const { agents, isLoading } = useAiAgents();
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((agent) =>
      [agent.name, agent.modelName, agent.modelId, agent.connectionDisplayName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q)),
    );
  }, [agents, searchQuery]);

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.settings.ai.title', 'AI')}
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: t(
          'screens.settings.ai.searchPlaceholder',
          'Search agents...',
        ),
      }}
      actions={
        <Group gap="xs">
          <Button
            variant="outline"
            leftSection={<IconKey size={16} strokeWidth={1.5} />}
            onClick={() => navigate({ to: '/settings/ai/providers' })}
          >
            {t('screens.settings.ai.providers.manageButton', 'AI providers')}
          </Button>
          <Button
            leftSection={<IconPlus size={16} strokeWidth={1.5} />}
            onClick={() => navigate({ to: '/settings/ai/new' })}
          >
            {t('screens.settings.ai.addAgentButton', 'Add agent')}
          </Button>
        </Group>
      }
    >
      <Stack maw={1100} mx="auto" gap={spacing.md} pb={spacing.xl}>
        {!isLoading && agents.length === 0 ? (
          <EmptyState
            illustration={<IconRobot size={48} strokeWidth={1.5} />}
            title={t('screens.settings.ai.agents.empty.title', 'No agents')}
            description={t(
              'screens.settings.ai.agents.empty.description',
              'Create an agent by choosing an AI provider, model, and prompt.',
            )}
            primaryAction={{
              label: t('screens.settings.ai.addAgentButton', 'Add agent'),
              icon: <IconPlus size={16} strokeWidth={1.5} />,
              onClick: () => navigate({ to: '/settings/ai/new' }),
            }}
          />
        ) : !isLoading && filteredAgents.length === 0 ? (
          <EmptyState
            title={t(
              'screens.settings.ai.agents.emptyQuery.title',
              'No matching agents',
            )}
            description={t(
              'screens.settings.ai.agents.emptyQuery.description',
              'Try a different search term or clear the current filter to see all your agents.',
            )}
            primaryAction={{
              label: t(
                'screens.settings.ai.agents.emptyQuery.clearSearch',
                'Clear search',
              ),
              onClick: () => setSearchQuery(''),
            }}
          />
        ) : (
          <Card withBorder shadow="sm" radius="lg" p={0}>
            <AgentsListHeader count={filteredAgents.length} />
            {filteredAgents.map((agent, index) => (
              <AgentRow
                key={agent.id}
                agent={agent}
                isLast={index === filteredAgents.length - 1}
                onClick={() =>
                  navigate({
                    to: '/settings/ai/$id',
                    params: { id: agent.id },
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
