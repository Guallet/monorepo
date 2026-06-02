import { BaseScreen } from '@/components/Screens/BaseScreen';
import { AiProvider } from '@guallet/api-client';
import {
  useAiAgents,
  useAiModels,
  useAiMutations,
  useAiProviderConnections,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconCheck,
  IconRefresh,
  IconRobot,
} from '@tabler/icons-react';
import { notFound, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const providerLabels: Record<AiProvider, string> = {
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
  vercel_ai_gateway: 'Vercel AI Gateway',
};

type AgentFormValues = {
  connectionId: string;
  name: string;
  modelId: string;
  customPrompt: string;
};

interface AiAgentDetailsScreenProps {
  agentId: string;
}

export function AiAgentDetailsScreen({
  agentId,
}: Readonly<AiAgentDetailsScreenProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spacing } = useTheme();
  const { agents, isLoading: isLoadingAgents } = useAiAgents();
  const { connections, isLoading: isLoadingConnections } =
    useAiProviderConnections();
  const { updateAgentMutation } = useAiMutations();
  const [selectedConnectionId, setSelectedConnectionId] = useState('');

  const agent = useMemo(
    () => agents.find((candidate) => candidate.id === agentId) ?? null,
    [agents, agentId],
  );

  const form = useForm<AgentFormValues>({
    initialValues: {
      connectionId: '',
      name: '',
      modelId: '',
      customPrompt: '',
    },
    validate: {
      connectionId: (value) =>
        value.trim() === ''
          ? t(
              'screens.settings.ai.agents.form.provider.error',
              'AI provider is required',
            )
          : null,
      name: (value) =>
        value.trim() === ''
          ? t('screens.settings.ai.agents.form.name.error', 'Name is required')
          : null,
      modelId: (value) =>
        value.trim() === ''
          ? t(
              'screens.settings.ai.agents.form.model.error',
              'Model is required',
            )
          : null,
    },
  });

  const {
    models,
    isFetching: isFetchingModels,
    refetch: refetchModels,
  } = useAiModels(selectedConnectionId || undefined);

  useEffect(() => {
    if (!agent) return;

    setSelectedConnectionId(agent.connectionId);
    form.setValues({
      connectionId: agent.connectionId,
      name: agent.name,
      modelId: agent.modelId,
      customPrompt: agent.customPrompt ?? '',
    });
    form.resetDirty();
  }, [agent?.id]);

  if (!isLoadingAgents && !agent) {
    throw notFound();
  }

  const connectionOptions = connections.map((connection) => ({
    value: connection.id,
    label: `${connection.displayName} (${providerLabels[connection.provider]})`,
  }));

  const modelOptions = models.map((model) => ({
    value: model.id,
    label: model.name === model.id ? model.id : `${model.name} (${model.id})`,
  }));

  const currentModelOption =
    agent && !modelOptions.some((option) => option.value === agent.modelId)
      ? [
          {
            value: agent.modelId,
            label: agent.modelName ?? agent.modelId,
          },
        ]
      : [];

  const save = async (values: AgentFormValues) => {
    const selectedModel = models.find((model) => model.id === values.modelId);

    try {
      await updateAgentMutation.mutateAsync({
        id: agentId,
        request: {
          connectionId: values.connectionId,
          name: values.name,
          modelId: values.modelId,
          modelName: selectedModel?.name ?? values.modelId,
          customPrompt: values.customPrompt,
        },
      });
      notifications.show({
        message: t('screens.settings.ai.agents.form.success', 'Agent saved.'),
        color: 'success',
      });
      navigate({ to: '/settings/ai' });
    } catch (error) {
      console.error('Failed to save AI agent:', error);
      notifications.show({
        title: t('screens.settings.ai.error.title', 'Error'),
        message: t(
          'screens.settings.ai.agents.form.error',
          'Failed to save agent.',
        ),
        color: 'error',
      });
    }
  };

  return (
    <BaseScreen
      isLoading={isLoadingAgents || isLoadingConnections}
      title={agent?.name ?? t('screens.settings.ai.agent.title', 'Agent')}
      actions={
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} strokeWidth={1.5} />}
          onClick={() => navigate({ to: '/settings/ai' })}
        >
          {t('screens.settings.ai.backButton', 'AI')}
        </Button>
      }
    >
      <Box maw={800} mx="auto">
        <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
          <form onSubmit={form.onSubmit(save)}>
            <Stack gap={spacing.md}>
              <Group gap={spacing.sm}>
                <ThemeIcon variant="light" radius="md" size={40}>
                  <IconRobot size={20} strokeWidth={1.5} />
                </ThemeIcon>
                <Box style={{ minWidth: 0 }}>
                  <Group gap="xs" wrap="nowrap">
                    <Text fw={700}>
                      {t(
                        'screens.settings.ai.agent.configTitle',
                        'Agent configuration',
                      )}
                    </Text>
                    {agent && (
                      <Badge variant="light" color="primary">
                        {providerLabels[agent.provider]}
                      </Badge>
                    )}
                  </Group>
                  <Text size="sm" c="dimmed">
                    {t(
                      'screens.settings.ai.agent.configDescription',
                      'Edit the provider, model, name, and prompt for this agent.',
                    )}
                  </Text>
                </Box>
              </Group>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing={spacing.md}>
                <TextInput
                  required
                  label={t(
                    'screens.settings.ai.agents.form.name.label',
                    'Agent name',
                  )}
                  placeholder={t(
                    'screens.settings.ai.agents.form.name.placeholder',
                    'Transaction helper',
                  )}
                  {...form.getInputProps('name')}
                />
                <Select
                  required
                  label={t(
                    'screens.settings.ai.agents.form.provider.label',
                    'AI provider',
                  )}
                  data={connectionOptions}
                  allowDeselect={false}
                  {...form.getInputProps('connectionId')}
                  onChange={(value) => {
                    setSelectedConnectionId(value ?? '');
                    form.setFieldValue('connectionId', value ?? '');
                    form.setFieldValue('modelId', '');
                  }}
                />
                <Select
                  required
                  searchable
                  label={t(
                    'screens.settings.ai.agents.form.model.label',
                    'Model',
                  )}
                  data={[...currentModelOption, ...modelOptions]}
                  disabled={!selectedConnectionId}
                  placeholder={t(
                    'screens.settings.ai.agents.form.model.placeholder',
                    'Select model',
                  )}
                  rightSection={
                    selectedConnectionId ? (
                      <IconRefresh size={16} strokeWidth={1.5} />
                    ) : undefined
                  }
                  onDropdownOpen={() => {
                    if (selectedConnectionId) {
                      void refetchModels();
                    }
                  }}
                  {...form.getInputProps('modelId')}
                />
              </SimpleGrid>

              <Textarea
                label={t(
                  'screens.settings.ai.agents.form.customPrompt.label',
                  'Custom prompt',
                )}
                minRows={5}
                autosize
                {...form.getInputProps('customPrompt')}
              />

              <Group justify="flex-end" gap={spacing.xs}>
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/settings/ai' })}
                >
                  {t('screens.settings.ai.cancelButton', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={updateAgentMutation.isPending || isFetchingModels}
                  leftSection={<IconCheck size={16} strokeWidth={1.5} />}
                >
                  {t('screens.settings.ai.saveButton', 'Save')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Box>
    </BaseScreen>
  );
}
