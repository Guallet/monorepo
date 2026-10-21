import { BankProviderId } from '@guallet/api-client';
import { useBankProviders } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Alert, Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCloudDownload, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { MethodCard } from './MethodCard';
interface StepChooseMethodProps {
  onChoose: (method: BankProviderId | 'manual') => void;
}
export function StepChooseMethod({
  onChoose,
}: Readonly<StepChooseMethodProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const providers = useBankProviders();
  return (
    <Stack gap={spacing.md}>
      <Title order={3}>
        {t('feature.accounts.add.chooseMethod.title', 'Add an account')}
      </Title>
      <Text size="sm" c="dimmed">
        {t(
          'feature.accounts.add.chooseMethod.subtitle',
          "Choose how you'd like to connect your account",
        )}
      </Text>
      {providers.isLoading && <Text>{t('common.loading', 'Loading…')}</Text>}
      {providers.isError && (
        <Alert color="red">
          {t('openbanking.providers.error', 'Could not load bank providers.')}
          <Button variant="subtle" onClick={() => void providers.refetch()}>
            {t('common.retry', 'Retry')}
          </Button>
        </Alert>
      )}
      {providers.data?.map((provider) => (
        <MethodCard
          key={provider.id}
          title={t('openbanking.import.title', 'Import from {{provider}}', {
            provider: provider.name,
          })}
          description={t(
            'openbanking.import.providerDescription',
            'Connect bank accounts using your own {{provider}} credentials.',
            { provider: provider.name },
          )}
          onClick={() => onChoose(provider.id)}
          icon={
            <ThemeIcon variant="light">
              <IconCloudDownload />
            </ThemeIcon>
          }
        />
      ))}
      <MethodCard
        title={t(
          'feature.accounts.add.chooseMethod.manual.title',
          'Add manually',
        )}
        description={t(
          'feature.accounts.add.chooseMethod.manual.desc',
          'Enter your account details by hand. Perfect for cash wallets, crypto, foreign accounts or any bank not yet supported.',
        )}
        onClick={() => onChoose('manual')}
        icon={
          <ThemeIcon variant="light">
            <IconPlus />
          </ThemeIcon>
        }
      />
    </Stack>
  );
}
