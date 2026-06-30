import { BaseScreen } from '@/components/Screens/BaseScreen';
import { AiProvider, ApiError } from '@guallet/api-client';
import {
  useAiAgents,
  useAiMutations,
  useAiProviderConnections,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
  IconKey,
  IconTrash,
} from '@tabler/icons-react';
import { notFound, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const providerLabels: Record<AiProvider, string> = {
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
  vercel_ai_gateway: 'Vercel AI Gateway',
};

type ProviderFormValues = {
  displayName: string;
  apiToken: string;
};

interface AiProviderDetailsScreenProps {
  connectionId: string;
}

export function AiProviderDetailsScreen({
  connectionId,
}: Readonly<AiProviderDetailsScreenProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { colors, spacing } = useTheme();
  const { connections, isLoading: isLoadingConnections } =
    useAiProviderConnections();
  const { agents } = useAiAgents();
  const { updateProviderConnectionMutation, deleteProviderConnectionMutation } =
    useAiMutations();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const connection = useMemo(
    () =>
      connections.find((candidate) => candidate.id === connectionId) ?? null,
    [connections, connectionId],
  );

  const dependentAgents = useMemo(
    () => agents.filter((agent) => agent.connectionId === connectionId),
    [agents, connectionId],
  );

  const form = useForm<ProviderFormValues>({
    initialValues: {
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
    },
  });

  // The form object is not referentially stable across renders, so guard with
  // the loaded id to avoid re-applying values (and looping) on every render.
  const loadedConnectionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!connection || loadedConnectionIdRef.current === connection.id) return;
    loadedConnectionIdRef.current = connection.id;

    form.setValues({
      displayName: connection.displayName,
      apiToken: '',
    });
    form.resetDirty();
  }, [connection, form]);

  if (!isLoadingConnections && !connection) {
    throw notFound();
  }

  const save = async (values: ProviderFormValues) => {
    try {
      await updateProviderConnectionMutation.mutateAsync({
        id: connectionId,
        request: {
          displayName: values.displayName,
          ...(values.apiToken.trim()
            ? { apiToken: values.apiToken.trim() }
            : {}),
        },
      });
      form.setFieldValue('apiToken', '');
      form.resetDirty();
      notifications.show({
        message: t(
          'screens.settings.ai.providers.form.success',
          'AI provider saved.',
        ),
        color: 'success',
      });
      navigate({ to: '/settings/ai/providers' });
    } catch (error) {
      console.error('Failed to save AI provider:', error);
      const invalidTokenMessage = t(
        'screens.settings.ai.providers.form.apiToken.invalid',
        'API token is not valid',
      );
      const isInvalidTokenError =
        error instanceof ApiError && error.status === 400;

      if (isInvalidTokenError) {
        form.setFieldError('apiToken', invalidTokenMessage);
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

  const deleteProvider = async () => {
    try {
      await deleteProviderConnectionMutation.mutateAsync(connectionId);
      notifications.show({
        message: t(
          'screens.settings.ai.providers.delete.success',
          'AI provider deleted.',
        ),
        color: 'success',
      });
      navigate({ to: '/settings/ai/providers' });
    } catch (error) {
      console.error('Failed to delete AI provider:', error);
      notifications.show({
        title: t('screens.settings.ai.error.title', 'Error'),
        message: t(
          'screens.settings.ai.providers.delete.error',
          'Failed to delete AI provider.',
        ),
        color: 'error',
      });
    }
  };

  return (
    <BaseScreen
      isLoading={isLoadingConnections}
      title={
        connection?.displayName ??
        t('screens.settings.ai.providers.detail.title', 'AI provider')
      }
      actions={
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} strokeWidth={1.5} />}
          onClick={() => navigate({ to: '/settings/ai/providers' })}
        >
          {t('screens.settings.ai.providers.backButton', 'AI providers')}
        </Button>
      }
    >
      <Box maw={800} mx="auto">
        <Stack gap={spacing.md}>
          <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
            <form onSubmit={form.onSubmit(save)}>
              <Stack gap={spacing.md}>
                <Group gap={spacing.sm}>
                  <ThemeIcon variant="light" radius="md" size={40}>
                    <IconKey size={20} strokeWidth={1.5} />
                  </ThemeIcon>
                  <Box style={{ minWidth: 0 }}>
                    <Group gap="xs" wrap="nowrap">
                      <Text fw={700}>
                        {t(
                          'screens.settings.ai.providers.configTitle',
                          'Provider configuration',
                        )}
                      </Text>
                      {connection && (
                        <Badge variant="light" color="primary">
                          {providerLabels[connection.provider]}
                        </Badge>
                      )}
                    </Group>
                    <Text size="sm" c="dimmed">
                      {t(
                        'screens.settings.ai.providers.detail.description',
                        'Rename this AI provider or replace its API token.',
                      )}
                    </Text>
                  </Box>
                </Group>

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
                  {...form.getInputProps('displayName')}
                />

                <PasswordInput
                  label={t(
                    'screens.settings.ai.providers.form.apiToken.replaceLabel',
                    'Replace API token',
                  )}
                  placeholder={t(
                    'screens.settings.ai.providers.form.apiToken.replacePlaceholder',
                    'Leave blank to keep the existing token',
                  )}
                  description={
                    connection?.tokenHint
                      ? t(
                          'screens.settings.ai.providers.form.apiToken.currentHint',
                          'Current token: {{hint}}',
                          { hint: connection.tokenHint },
                        )
                      : undefined
                  }
                  {...form.getInputProps('apiToken')}
                />

                <Group justify="flex-end" gap={spacing.xs}>
                  <Button
                    variant="outline"
                    onClick={() => navigate({ to: '/settings/ai/providers' })}
                  >
                    {t('screens.settings.ai.cancelButton', 'Cancel')}
                  </Button>
                  <Button
                    type="submit"
                    loading={updateProviderConnectionMutation.isPending}
                    leftSection={<IconCheck size={16} strokeWidth={1.5} />}
                  >
                    {t('screens.settings.ai.saveButton', 'Save')}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>

          <Alert
            color="red"
            radius="lg"
            icon={<IconAlertTriangle size={20} strokeWidth={1.5} />}
            styles={{
              root: {
                backgroundColor: `color-mix(in oklab, ${colors.error} 8%, ${colors.white})`,
                border: `1px solid color-mix(in oklab, ${colors.error} 28%, ${colors.white})`,
              },
            }}
          >
            <Stack gap={spacing.sm}>
              <Box>
                <Text fw={700} c="error">
                  {t(
                    'screens.settings.ai.providers.delete.title',
                    'Delete AI provider',
                  )}
                </Text>
                <Text size="sm" c="dimmed">
                  {t(
                    'screens.settings.ai.providers.delete.description',
                    'Deleting this AI provider also deletes {{count}} linked agents.',
                    { count: dependentAgents.length },
                  )}
                </Text>
              </Box>
              {isConfirmingDelete ? (
                <Group justify="flex-end" gap={spacing.xs}>
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmingDelete(false)}
                  >
                    {t('screens.settings.ai.cancelButton', 'Cancel')}
                  </Button>
                  <Button
                    color="red"
                    loading={deleteProviderConnectionMutation.isPending}
                    leftSection={<IconTrash size={16} strokeWidth={1.5} />}
                    onClick={() => {
                      void deleteProvider();
                    }}
                  >
                    {t(
                      'screens.settings.ai.providers.delete.confirmButton',
                      'Delete AI provider',
                    )}
                  </Button>
                </Group>
              ) : (
                <Button
                  color="red"
                  variant="outline"
                  leftSection={<IconTrash size={16} strokeWidth={1.5} />}
                  onClick={() => setIsConfirmingDelete(true)}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {t(
                    'screens.settings.ai.providers.delete.button',
                    'Delete AI provider',
                  )}
                </Button>
              )}
            </Stack>
          </Alert>
        </Stack>
      </Box>
    </BaseScreen>
  );
}
