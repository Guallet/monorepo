import {
  AI_PROVIDERS,
  AiAgentDto,
  AiProvider,
  AiProviderConnectionDto,
} from '@guallet/api-client';
import {
  useAiAgents,
  useAiModels,
  useAiMutations,
  useAiProviderConnections,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconCheck,
  IconKey,
  IconPlus,
  IconRefresh,
  IconRobot,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseScreen } from '@/components/Screens/BaseScreen';

const providerLabels: Record<AiProvider, string> = {
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
  vercel_ai_gateway: 'Vercel AI Gateway',
};

type ProviderConnectionFormValues = {
  provider: AiProvider;
  displayName: string;
  apiToken: string;
};

type AgentFormValues = {
  connectionId: string;
  name: string;
  modelId: string;
  customPrompt: string;
};

export function AiSettingsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spacing } = useTheme();
  const { connections, isLoading: isLoadingConnections } =
    useAiProviderConnections();
  const { agents, isLoading: isLoadingAgents } = useAiAgents();
  const {
    createProviderConnectionMutation,
    updateProviderConnectionMutation,
    deleteProviderConnectionMutation,
    createAgentMutation,
    updateAgentMutation,
    deleteAgentMutation,
  } = useAiMutations();

  const [editingConnection, setEditingConnection] =
    useState<AiProviderConnectionDto | null>(null);
  const [editingAgent, setEditingAgent] = useState<AiAgentDto | null>(null);
  const [connectionPendingDelete, setConnectionPendingDelete] = useState<
    string | null
  >(null);
  const [agentPendingDelete, setAgentPendingDelete] = useState<string | null>(
    null,
  );

  const providerForm = useForm<ProviderConnectionFormValues>({
    initialValues: {
      provider: 'openai',
      displayName: '',
      apiToken: '',
    },
    validate: {
      displayName: (value) =>
        value.trim() === ''
          ? t(
              'screens.settings.ai.connections.form.displayName.error',
              'Name is required',
            )
          : null,
      apiToken: (value) =>
        !editingConnection && value.trim() === ''
          ? t(
              'screens.settings.ai.connections.form.apiToken.error',
              'API token is required',
            )
          : null,
    },
  });

  const agentForm = useForm<AgentFormValues>({
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
              'screens.settings.ai.agents.form.connection.error',
              'Connection is required',
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

  const selectedConnectionId = agentForm.values.connectionId || undefined;
  const {
    models,
    isFetching: isFetchingModels,
    error: modelsError,
    refetch: refetchModels,
  } = useAiModels(selectedConnectionId);

  const providerOptions = AI_PROVIDERS.map((provider) => ({
    value: provider,
    label: providerLabels[provider],
  }));

  const connectionOptions = connections.map((connection) => ({
    value: connection.id,
    label: `${connection.displayName} (${providerLabels[connection.provider]})`,
  }));

  const modelOptions = models.map((model) => ({
    value: model.id,
    label: model.name === model.id ? model.id : `${model.name} (${model.id})`,
  }));

  const resetProviderForm = () => {
    setEditingConnection(null);
    providerForm.setValues({
      provider: 'openai',
      displayName: '',
      apiToken: '',
    });
    providerForm.resetDirty();
  };

  const resetAgentForm = () => {
    setEditingAgent(null);
    agentForm.setValues({
      connectionId: '',
      name: '',
      modelId: '',
      customPrompt: '',
    });
    agentForm.resetDirty();
  };

  const handleProviderSubmit = async (values: ProviderConnectionFormValues) => {
    try {
      if (editingConnection) {
        await updateProviderConnectionMutation.mutateAsync({
          id: editingConnection.id,
          request: {
            displayName: values.displayName,
            ...(values.apiToken.trim() !== '' && {
              apiToken: values.apiToken,
            }),
          },
        });
      } else {
        await createProviderConnectionMutation.mutateAsync({
          provider: values.provider,
          displayName: values.displayName,
          apiToken: values.apiToken,
        });
      }
      notifications.show({
        message: t(
          'screens.settings.ai.connections.form.success',
          'Provider connection saved.',
        ),
        color: 'green',
      });
      resetProviderForm();
    } catch (error) {
      console.error('Failed to save AI provider connection:', error);
      notifications.show({
        title: t('screens.settings.ai.error.title', 'Error'),
        message: t(
          'screens.settings.ai.connections.form.error',
          'Failed to save provider connection.',
        ),
        color: 'red',
      });
    }
  };

  const handleAgentSubmit = async (values: AgentFormValues) => {
    const selectedModel = models.find((model) => model.id === values.modelId);
    try {
      if (editingAgent) {
        await updateAgentMutation.mutateAsync({
          id: editingAgent.id,
          request: {
            connectionId: values.connectionId,
            name: values.name,
            modelId: values.modelId,
            modelName: selectedModel?.name ?? values.modelId,
            customPrompt: values.customPrompt,
          },
        });
      } else {
        await createAgentMutation.mutateAsync({
          connectionId: values.connectionId,
          name: values.name,
          modelId: values.modelId,
          modelName: selectedModel?.name ?? values.modelId,
          customPrompt: values.customPrompt,
        });
      }
      notifications.show({
        message: t('screens.settings.ai.agents.form.success', 'Agent saved.'),
        color: 'green',
      });
      resetAgentForm();
    } catch (error) {
      console.error('Failed to save AI agent:', error);
      notifications.show({
        title: t('screens.settings.ai.error.title', 'Error'),
        message: t(
          'screens.settings.ai.agents.form.error',
          'Failed to save agent.',
        ),
        color: 'red',
      });
    }
  };

  const editConnection = (connection: AiProviderConnectionDto) => {
    setEditingConnection(connection);
    providerForm.setValues({
      provider: connection.provider,
      displayName: connection.displayName,
      apiToken: '',
    });
    providerForm.resetDirty();
  };

  const editAgent = (agent: AiAgentDto) => {
    setEditingAgent(agent);
    agentForm.setValues({
      connectionId: agent.connectionId,
      name: agent.name,
      modelId: agent.modelId,
      customPrompt: agent.customPrompt ?? '',
    });
    agentForm.resetDirty();
  };

  const deleteConnection = async (connectionId: string) => {
    if (connectionPendingDelete !== connectionId) {
      setConnectionPendingDelete(connectionId);
      return;
    }

    try {
      await deleteProviderConnectionMutation.mutateAsync(connectionId);
      notifications.show({
        message: t(
          'screens.settings.ai.connections.deleted',
          'Provider connection deleted.',
        ),
        color: 'green',
      });
      setConnectionPendingDelete(null);
      if (editingConnection?.id === connectionId) {
        resetProviderForm();
      }
    } catch (error) {
      console.error('Failed to delete AI provider connection:', error);
      notifications.show({
        title: t('screens.settings.ai.error.title', 'Error'),
        message: t(
          'screens.settings.ai.connections.deleteError',
          'Failed to delete provider connection.',
        ),
        color: 'red',
      });
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (agentPendingDelete !== agentId) {
      setAgentPendingDelete(agentId);
      return;
    }

    try {
      await deleteAgentMutation.mutateAsync(agentId);
      notifications.show({
        message: t('screens.settings.ai.agents.deleted', 'Agent deleted.'),
        color: 'green',
      });
      setAgentPendingDelete(null);
      if (editingAgent?.id === agentId) {
        resetAgentForm();
      }
    } catch (error) {
      console.error('Failed to delete AI agent:', error);
      notifications.show({
        title: t('screens.settings.ai.error.title', 'Error'),
        message: t(
          'screens.settings.ai.agents.deleteError',
          'Failed to delete agent.',
        ),
        color: 'red',
      });
    }
  };

  const isSavingProvider =
    createProviderConnectionMutation.isPending ||
    updateProviderConnectionMutation.isPending;
  const isSavingAgent =
    createAgentMutation.isPending || updateAgentMutation.isPending;

  return (
    <BaseScreen
      title={t('screens.settings.ai.title', 'AI')}
      isLoading={isLoadingConnections || isLoadingAgents}
      actions={
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} strokeWidth={1.5} />}
          onClick={() => navigate({ to: '/settings' })}
        >
          {t('screens.settings.ai.backButton', 'Settings')}
        </Button>
      }
    >
      <Stack gap={spacing.md}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={spacing.md}>
          <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
            <form onSubmit={providerForm.onSubmit(handleProviderSubmit)}>
              <Stack gap={spacing.md}>
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <IconKey size={20} strokeWidth={1.5} />
                    <Text fw={700}>
                      {t(
                        'screens.settings.ai.connections.title',
                        'Provider connections',
                      )}
                    </Text>
                  </Group>
                  {editingConnection && (
                    <Badge variant="light">
                      {t('screens.settings.ai.editing', 'Editing')}
                    </Badge>
                  )}
                </Group>

                <Select
                  required
                  label={t(
                    'screens.settings.ai.connections.form.provider.label',
                    'Provider',
                  )}
                  data={providerOptions}
                  disabled={Boolean(editingConnection)}
                  allowDeselect={false}
                  {...providerForm.getInputProps('provider')}
                />
                <TextInput
                  required
                  label={t(
                    'screens.settings.ai.connections.form.displayName.label',
                    'Connection name',
                  )}
                  placeholder={t(
                    'screens.settings.ai.connections.form.displayName.placeholder',
                    'OpenAI personal key',
                  )}
                  {...providerForm.getInputProps('displayName')}
                />
                <PasswordInput
                  required={!editingConnection}
                  label={t(
                    'screens.settings.ai.connections.form.apiToken.label',
                    'API token',
                  )}
                  placeholder={
                    editingConnection?.tokenHint ??
                    t(
                      'screens.settings.ai.connections.form.apiToken.placeholder',
                      'Paste API token',
                    )
                  }
                  {...providerForm.getInputProps('apiToken')}
                />

                <Group justify="flex-end" gap="xs">
                  {editingConnection && (
                    <Button
                      variant="outline"
                      leftSection={<IconX size={16} strokeWidth={1.5} />}
                      onClick={resetProviderForm}
                    >
                      {t('screens.settings.ai.cancelButton', 'Cancel')}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    loading={isSavingProvider}
                    leftSection={
                      editingConnection ? (
                        <IconCheck size={16} strokeWidth={1.5} />
                      ) : (
                        <IconPlus size={16} strokeWidth={1.5} />
                      )
                    }
                  >
                    {editingConnection
                      ? t('screens.settings.ai.saveButton', 'Save')
                      : t(
                          'screens.settings.ai.connections.addButton',
                          'Add connection',
                        )}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>

          <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
            <form onSubmit={agentForm.onSubmit(handleAgentSubmit)}>
              <Stack gap={spacing.md}>
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <IconRobot size={20} strokeWidth={1.5} />
                    <Text fw={700}>
                      {t('screens.settings.ai.agents.title', 'Agents')}
                    </Text>
                  </Group>
                  {editingAgent && (
                    <Badge variant="light">
                      {t('screens.settings.ai.editing', 'Editing')}
                    </Badge>
                  )}
                </Group>

                <Select
                  required
                  label={t(
                    'screens.settings.ai.agents.form.connection.label',
                    'Connection',
                  )}
                  data={connectionOptions}
                  disabled={connections.length === 0}
                  placeholder={t(
                    'screens.settings.ai.agents.form.connection.placeholder',
                    'Select connection',
                  )}
                  allowDeselect={false}
                  {...agentForm.getInputProps('connectionId')}
                  onChange={(value) => {
                    agentForm.setFieldValue('connectionId', value ?? '');
                    agentForm.setFieldValue('modelId', '');
                  }}
                />
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
                  {...agentForm.getInputProps('name')}
                />
                <Select
                  required
                  searchable
                  label={t(
                    'screens.settings.ai.agents.form.model.label',
                    'Model',
                  )}
                  data={modelOptions}
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
                  {...agentForm.getInputProps('modelId')}
                />
                {modelsError && (
                  <Alert color="red" variant="light">
                    {t(
                      'screens.settings.ai.agents.form.model.loadError',
                      'Models could not be loaded for this connection.',
                    )}
                  </Alert>
                )}
                <Textarea
                  label={t(
                    'screens.settings.ai.agents.form.customPrompt.label',
                    'Custom prompt',
                  )}
                  minRows={5}
                  autosize
                  {...agentForm.getInputProps('customPrompt')}
                />

                <Group justify="flex-end" gap="xs">
                  {editingAgent && (
                    <Button
                      variant="outline"
                      leftSection={<IconX size={16} strokeWidth={1.5} />}
                      onClick={resetAgentForm}
                    >
                      {t('screens.settings.ai.cancelButton', 'Cancel')}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    loading={isSavingAgent || isFetchingModels}
                    disabled={connections.length === 0}
                    leftSection={
                      editingAgent ? (
                        <IconCheck size={16} strokeWidth={1.5} />
                      ) : (
                        <IconPlus size={16} strokeWidth={1.5} />
                      )
                    }
                  >
                    {editingAgent
                      ? t('screens.settings.ai.saveButton', 'Save')
                      : t('screens.settings.ai.agents.addButton', 'Add agent')}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </SimpleGrid>

        <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
          <Stack gap={spacing.md}>
            <Text fw={700}>
              {t(
                'screens.settings.ai.connections.savedTitle',
                'Saved connections',
              )}
            </Text>
            {connections.length === 0 ? (
              <Text c="dimmed">
                {t(
                  'screens.settings.ai.connections.empty',
                  'No provider connections yet.',
                )}
              </Text>
            ) : (
              connections.map((connection) => (
                <Stack key={connection.id} gap="xs">
                  <Group justify="space-between" align="center" wrap="wrap">
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Text fw={600}>{connection.displayName}</Text>
                        <Badge variant="light">
                          {providerLabels[connection.provider]}
                        </Badge>
                      </Group>
                      <Text size="sm" c="dimmed">
                        {connection.tokenHint ?? ''}
                      </Text>
                    </Stack>
                    <Group gap="xs">
                      <Button
                        variant="outline"
                        onClick={() => editConnection(connection)}
                      >
                        {t('screens.settings.ai.editButton', 'Edit')}
                      </Button>
                      <Button
                        variant={
                          connectionPendingDelete === connection.id
                            ? 'filled'
                            : 'outline'
                        }
                        color="red"
                        leftSection={<IconTrash size={16} strokeWidth={1.5} />}
                        loading={
                          deleteProviderConnectionMutation.isPending &&
                          connectionPendingDelete === connection.id
                        }
                        onClick={() => void deleteConnection(connection.id)}
                      >
                        {connectionPendingDelete === connection.id
                          ? t(
                              'screens.settings.ai.confirmDeleteButton',
                              'Confirm delete',
                            )
                          : t('screens.settings.ai.deleteButton', 'Delete')}
                      </Button>
                    </Group>
                  </Group>
                  <Divider />
                </Stack>
              ))
            )}
          </Stack>
        </Card>

        <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
          <Stack gap={spacing.md}>
            <Text fw={700}>
              {t('screens.settings.ai.agents.savedTitle', 'Saved agents')}
            </Text>
            {agents.length === 0 ? (
              <Text c="dimmed">
                {t('screens.settings.ai.agents.empty', 'No agents yet.')}
              </Text>
            ) : (
              agents.map((agent) => (
                <Stack key={agent.id} gap="xs">
                  <Group justify="space-between" align="center" wrap="wrap">
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Text fw={600}>{agent.name}</Text>
                        <Badge variant="light">
                          {providerLabels[agent.provider]}
                        </Badge>
                      </Group>
                      <Text size="sm" c="dimmed">
                        {agent.modelName ?? agent.modelId}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {agent.connectionDisplayName}
                      </Text>
                    </Stack>
                    <Group gap="xs">
                      <Button
                        variant="outline"
                        onClick={() => editAgent(agent)}
                      >
                        {t('screens.settings.ai.editButton', 'Edit')}
                      </Button>
                      <Button
                        variant={
                          agentPendingDelete === agent.id ? 'filled' : 'outline'
                        }
                        color="red"
                        leftSection={<IconTrash size={16} strokeWidth={1.5} />}
                        loading={
                          deleteAgentMutation.isPending &&
                          agentPendingDelete === agent.id
                        }
                        onClick={() => void deleteAgent(agent.id)}
                      >
                        {agentPendingDelete === agent.id
                          ? t(
                              'screens.settings.ai.confirmDeleteButton',
                              'Confirm delete',
                            )
                          : t('screens.settings.ai.deleteButton', 'Delete')}
                      </Button>
                    </Group>
                  </Group>
                  <Divider />
                </Stack>
              ))
            )}
          </Stack>
        </Card>
      </Stack>
    </BaseScreen>
  );
}
