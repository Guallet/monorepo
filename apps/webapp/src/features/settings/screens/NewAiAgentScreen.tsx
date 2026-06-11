import { BaseScreen } from '@/components/Screens/BaseScreen';
import {
  AI_PROVIDERS,
  ApiError,
  AiProvider,
  AiProviderConnectionDto,
} from '@guallet/api-client';
import {
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
  Modal,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconCheck,
  IconKey,
  IconPlus,
  IconRefresh,
  IconRobot,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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

function ProviderConnectionRow({
  connection,
  selected,
  onSelect,
  tokenLabel,
}: Readonly<{
  connection: AiProviderConnectionDto;
  selected: boolean;
  onSelect: () => void;
  tokenLabel: string;
}>) {
  return (
    <UnstyledButton
      w="100%"
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        border: selected
          ? '1px solid var(--mantine-primary-color-filled)'
          : '1px solid var(--mantine-color-gray-2)',
        borderRadius: 'var(--mantine-radius-lg)',
        background: selected ? 'var(--mantine-color-blue-0)' : 'transparent',
        transition: 'background 150ms ease, border-color 150ms ease',
      }}
    >
      <ThemeIcon variant="light" radius="md" size={40}>
        <IconKey size={20} strokeWidth={1.5} />
      </ThemeIcon>
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Group gap="xs" wrap="nowrap">
          <Text size="sm" fw={600} truncate>
            {connection.displayName}
          </Text>
          <Badge variant="light" color="primary">
            {providerLabels[connection.provider]}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          {connection.tokenHint ?? tokenLabel}
        </Text>
      </Stack>
      {selected && <IconCheck size={18} strokeWidth={1.5} />}
    </UnstyledButton>
  );
}

export function NewAiAgentScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spacing } = useTheme();
  const { connections, isLoading: isLoadingConnections } =
    useAiProviderConnections();
  const { createProviderConnectionMutation, createAgentMutation } =
    useAiMutations();
  const [isProviderModalOpen, providerModal] = useDisclosure(false);

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
              'screens.settings.ai.providers.form.displayName.error',
              'Name is required',
            )
          : null,
      apiToken: (value) =>
        value.trim() === ''
          ? t(
              'screens.settings.ai.providers.form.apiToken.error',
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

  const selectedConnectionId = agentForm.values.connectionId;

  const {
    models,
    isFetching: isFetchingModels,
    refetch: refetchModels,
  } = useAiModels(selectedConnectionId || undefined);

  useEffect(() => {
    if (!isLoadingConnections && connections.length === 0) {
      providerModal.open();
    }
  }, [connections.length, isLoadingConnections, providerModal]);

  useEffect(() => {
    if (!selectedConnectionId && connections.length > 0) {
      const firstConnection = connections[0];
      agentForm.setFieldValue('connectionId', firstConnection.id);
    }
  }, [agentForm, connections, selectedConnectionId]);

  const providerOptions = AI_PROVIDERS.map((provider) => ({
    value: provider,
    label: providerLabels[provider],
  }));

  const modelOptions = models.map((model) => ({
    value: model.id,
    label: model.name === model.id ? model.id : `${model.name} (${model.id})`,
  }));

  const handleProviderSubmit = async (values: ProviderConnectionFormValues) => {
    try {
      const connection = await createProviderConnectionMutation.mutateAsync({
        provider: values.provider,
        displayName: values.displayName,
        apiToken: values.apiToken,
      });
      agentForm.setFieldValue('connectionId', connection.id);
      providerForm.reset();
      providerModal.close();
      notifications.show({
        message: t(
          'screens.settings.ai.providers.form.success',
          'AI provider saved.',
        ),
        color: 'success',
      });
    } catch (error) {
      console.error('Failed to save AI provider:', error);
      const invalidTokenMessage = t(
        'screens.settings.ai.providers.form.apiToken.invalid',
        'API token is not valid',
      );
      const isInvalidTokenError =
        error instanceof ApiError && error.status === 400;

      if (isInvalidTokenError) {
        providerForm.setFieldError('apiToken', invalidTokenMessage);
      }

      notifications.show({
        title: t('screens.settings.ai.error.title', 'Error'),
        message: isInvalidTokenError
          ? invalidTokenMessage
          : t(
              'screens.settings.ai.providers.form.error',
              'Failed to save AI provider.',
            ),
        color: 'error',
      });
    }
  };

  const handleAgentSubmit = async (values: AgentFormValues) => {
    const selectedModel = models.find((model) => model.id === values.modelId);
    try {
      await createAgentMutation.mutateAsync({
        connectionId: values.connectionId,
        name: values.name,
        modelId: values.modelId,
        modelName: selectedModel?.name ?? values.modelId,
        customPrompt: values.customPrompt,
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

  const selectConnection = (connectionId: string) => {
    agentForm.setFieldValue('connectionId', connectionId);
    agentForm.setFieldValue('modelId', '');
  };

  return (
    <>
      <BaseScreen
        isLoading={isLoadingConnections}
        title={t('screens.settings.ai.new.title', 'New agent')}
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
        <Stack maw={1100} mx="auto" gap={spacing.md} pb={spacing.xl}>
          <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
            <Stack gap={spacing.md}>
              <Group justify="space-between" align="center">
                <Box>
                  <Text fw={700}>
                    {t(
                      'screens.settings.ai.new.providers.title',
                      'Choose provider',
                    )}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t(
                      'screens.settings.ai.new.providers.description',
                      'Select the AI provider this agent will use.',
                    )}
                  </Text>
                </Box>
                <Button
                  variant="outline"
                  leftSection={<IconPlus size={16} strokeWidth={1.5} />}
                  onClick={providerModal.open}
                >
                  {t('screens.settings.ai.providers.addButton', 'Add provider')}
                </Button>
              </Group>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing={spacing.md}>
                {connections.map((connection) => (
                  <ProviderConnectionRow
                    key={connection.id}
                    connection={connection}
                    selected={selectedConnectionId === connection.id}
                    onSelect={() => selectConnection(connection.id)}
                    tokenLabel={t(
                      'screens.settings.ai.providers.tokenConfigured',
                      'Token configured',
                    )}
                  />
                ))}
              </SimpleGrid>
            </Stack>
          </Card>

          <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
            <form onSubmit={agentForm.onSubmit(handleAgentSubmit)}>
              <Stack gap={spacing.md}>
                <Group gap={spacing.sm}>
                  <ThemeIcon variant="light" radius="md" size={40}>
                    <IconRobot size={20} strokeWidth={1.5} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700}>
                      {t(
                        'screens.settings.ai.new.details.title',
                        'Agent details',
                      )}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {t(
                        'screens.settings.ai.new.details.description',
                        'Choose a model and write the prompt this agent should follow.',
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
                </SimpleGrid>

                <Textarea
                  label={t(
                    'screens.settings.ai.agents.form.customPrompt.label',
                    'Custom prompt',
                  )}
                  minRows={5}
                  autosize
                  {...agentForm.getInputProps('customPrompt')}
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
                    loading={createAgentMutation.isPending || isFetchingModels}
                    disabled={connections.length === 0}
                    leftSection={<IconPlus size={16} strokeWidth={1.5} />}
                  >
                    {t('screens.settings.ai.agents.addButton', 'Add agent')}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </Stack>
      </BaseScreen>

      <Modal
        opened={isProviderModalOpen}
        onClose={
          connections.length === 0
            ? () => navigate({ to: '/settings/ai' })
            : providerModal.close
        }
        closeOnClickOutside={connections.length > 0}
        closeOnEscape={connections.length > 0}
        withCloseButton={connections.length > 0}
        title={t(
          'screens.settings.ai.providers.modal.title',
          'Add AI provider',
        )}
        centered
      >
        <form onSubmit={providerForm.onSubmit(handleProviderSubmit)}>
          <Stack gap={spacing.md}>
            <Select
              required
              label={t(
                'screens.settings.ai.providers.form.provider.label',
                'Provider',
              )}
              data={providerOptions}
              allowDeselect={false}
              {...providerForm.getInputProps('provider')}
            />
            <TextInput
              required
              label={t(
                'screens.settings.ai.providers.form.displayName.label',
                'Provider name',
              )}
              placeholder={t(
                'screens.settings.ai.providers.form.displayName.placeholder',
                'OpenAI personal key',
              )}
              {...providerForm.getInputProps('displayName')}
            />
            <PasswordInput
              required
              label={t(
                'screens.settings.ai.providers.form.apiToken.label',
                'API token',
              )}
              placeholder={t(
                'screens.settings.ai.providers.form.apiToken.placeholder',
                'Paste API token',
              )}
              {...providerForm.getInputProps('apiToken')}
            />
            <Group justify="flex-end" gap={spacing.xs}>
              {connections.length > 0 && (
                <Button variant="outline" onClick={providerModal.close}>
                  {t('screens.settings.ai.cancelButton', 'Cancel')}
                </Button>
              )}
              <Button
                type="submit"
                loading={createProviderConnectionMutation.isPending}
                leftSection={<IconPlus size={16} strokeWidth={1.5} />}
              >
                {t('screens.settings.ai.providers.addButton', 'Add provider')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
