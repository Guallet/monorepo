import { BankProvider } from '@guallet/api-client';
import { useBankConnections, useBankProviders } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronRight, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { BankConnectionProgress } from '@/features/openbanking/components/BankConnectionProgress';

interface StepChooseMethodProps {
  onChoose: (method: BankProvider | 'manual') => void;
}

export function StepChooseMethod({
  onChoose,
}: Readonly<StepChooseMethodProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const providers = useBankProviders();
  const connections = useBankConnections();
  const loading = providers.isLoading || connections.isLoading;
  const failed = providers.isError || connections.isError;
  return (
    <Stack gap={spacing.lg}>
      <Title order={2}>
        {t('feature.accounts.add.chooseMethod.title', 'Add an account')}
      </Title>
      <BankConnectionProgress active={0} />
      <Text size="sm" c="dimmed">
        {t(
          'openbanking.choose.help',
          'Use a saved provider or set up a new one.',
        )}
      </Text>
      {loading && <Skeleton height={spacing.xxl} />}
      {failed && (
        <Alert color="red" role="alert">
          {t('openbanking.loadError', 'Could not load bank connections.')}
          <Button
            variant="subtle"
            onClick={() => {
              void providers.refetch();
              void connections.refetch();
            }}
          >
            {t('common.retry', 'Retry')}
          </Button>
        </Alert>
      )}
      {!loading && !failed && (
        <Card withBorder radius="lg" shadow="sm" p={spacing.none}>
          {!providers.data?.length && (
            <Text p={spacing.md}>
              {t(
                'openbanking.connections.empty',
                'No bank providers are available right now.',
              )}
            </Text>
          )}
          {providers.data?.map((provider, index) => (
            <Stack key={provider.id} gap={spacing.none}>
              {index > 0 && <Divider />}
              <UnstyledButton
                p={spacing.md}
                onClick={() => onChoose(provider.id)}
              >
                <Group wrap="nowrap">
                  <Avatar radius="md" color="gray">
                    {provider.name.charAt(0)}
                  </Avatar>
                  <Stack gap={spacing.xs} style={{ flex: 1 }}>
                    <Text fw={600}>{provider.name}</Text>
                    <Text size="sm" c="dimmed">
                      {connections.data?.some(
                        (connection) => connection.providerId === provider.id,
                      )
                        ? t(
                            'openbanking.connections.saved',
                            'Credentials saved',
                          )
                        : provider.credentialFields.some(
                              (field) => field.name === 'secretId',
                            )
                          ? t(
                              'openbanking.choose.secret',
                              'Set up with a secret ID and key',
                            )
                          : t(
                              'openbanking.choose.apiKey',
                              'Set up with an API key',
                            )}
                    </Text>
                  </Stack>
                  <IconChevronRight strokeWidth={1.5} />
                </Group>
              </UnstyledButton>
            </Stack>
          ))}
        </Card>
      )}
      <Card withBorder radius="lg" shadow="sm" p={spacing.none}>
        <UnstyledButton p={spacing.md} onClick={() => onChoose('manual')}>
          <Group wrap="nowrap">
            <IconPlus strokeWidth={1.5} />
            <Stack gap={spacing.xs} style={{ flex: 1 }}>
              <Text fw={600}>
                {t(
                  'feature.accounts.add.chooseMethod.manual.title',
                  'Add manually',
                )}
              </Text>
              <Text size="sm" c="dimmed">
                {t(
                  'openbanking.choose.manualHelp',
                  'For cash and accounts you track yourself.',
                )}
              </Text>
            </Stack>
            <IconChevronRight strokeWidth={1.5} />
          </Group>
        </UnstyledButton>
      </Card>
    </Stack>
  );
}
