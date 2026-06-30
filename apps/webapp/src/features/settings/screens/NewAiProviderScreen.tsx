import { BaseScreen } from '@/components/Screens/BaseScreen';
import { AI_PROVIDERS, AiProvider, ApiError } from '@guallet/api-client';
import { useAiMutations } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Box,
  Button,
  Card,
  Group,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCheck, IconKey } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const providerLabels: Record<AiProvider, string> = {
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
  vercel_ai_gateway: 'Vercel AI Gateway',
};

type ProviderFormValues = {
  provider: AiProvider;
  displayName: string;
  apiToken: string;
};

export function NewAiProviderScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spacing } = useTheme();
  const { createProviderConnectionMutation } = useAiMutations();

  const form = useForm<ProviderFormValues>({
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

  const providerOptions = AI_PROVIDERS.map((provider) => ({
    value: provider,
    label: providerLabels[provider],
  }));

  const save = async (values: ProviderFormValues) => {
    try {
      await createProviderConnectionMutation.mutateAsync({
        provider: values.provider,
        displayName: values.displayName,
        apiToken: values.apiToken,
      });
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

  return (
    <BaseScreen
      title={t('screens.settings.ai.providers.new.title', 'New AI provider')}
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
        <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
          <form onSubmit={form.onSubmit(save)}>
            <Stack gap={spacing.md}>
              <Group gap={spacing.sm}>
                <ThemeIcon variant="light" radius="md" size={40}>
                  <IconKey size={20} strokeWidth={1.5} />
                </ThemeIcon>
                <Box>
                  <Text fw={700}>
                    {t(
                      'screens.settings.ai.providers.configTitle',
                      'Provider configuration',
                    )}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t(
                      'screens.settings.ai.providers.new.description',
                      'Choose a provider and add an API token that can list models.',
                    )}
                  </Text>
                </Box>
              </Group>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing={spacing.md}>
                <Select
                  required
                  label={t(
                    'screens.settings.ai.providers.form.provider.label',
                    'Provider',
                  )}
                  data={providerOptions}
                  allowDeselect={false}
                  {...form.getInputProps('provider')}
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
                  {...form.getInputProps('displayName')}
                />
              </SimpleGrid>

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
                  loading={createProviderConnectionMutation.isPending}
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
