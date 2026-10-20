import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type PersonalProviderAccount = {
  key: string;
  name: string;
  institutionName: string | null;
  institutionLogo?: string | null;
  details?: Array<string | null>;
  linkedAccountId: string | null;
};

type PersonalProviderImportLabels = {
  title: string;
  subtitle: string;
  configureMessage: string;
  configureButton: string;
  listError: string;
  empty: string;
  importSuccess: string;
  importErrorTitle: string;
  importErrorMessage: string;
  unlinkSuccess: string;
  unlinkErrorTitle: string;
  unlinkErrorMessage: string;
  unlinkButton: string;
  importButton: string;
};

type PersonalProvider = 'bankSync' | 'lunchFlow';

const providerImportDefaults: Record<
  PersonalProvider,
  PersonalProviderImportLabels
> = {
  bankSync: {
    title: 'Import from BankSync',
    subtitle:
      'Select the connected bank accounts to import. Guallet imports available transaction history and then syncs daily.',
    configureMessage:
      'Add your BankSync API key in Settings before importing. Create a key with banks:read scope; API key access requires a Standard or higher BankSync plan.',
    configureButton: 'Open settings',
    listError:
      'Could not load BankSync accounts. Check your API key, REST API plan, and banks:read scope.',
    empty: 'No connected bank accounts are available in BankSync.',
    importSuccess: 'Selected accounts imported from BankSync.',
    importErrorTitle: 'Could not import accounts',
    importErrorMessage: 'Refresh the account list and try again.',
    unlinkSuccess:
      'Account unlinked from BankSync sync. Its Guallet data remains.',
    unlinkErrorTitle: 'Could not unlink account',
    unlinkErrorMessage: 'Please try again.',
    unlinkButton: 'Unlink',
    importButton: 'Import selected accounts',
  },
  lunchFlow: {
    title: 'Import from Lunch Flow',
    subtitle: 'Choose the accounts enabled in your Lunch Flow API destination.',
    configureMessage:
      'Add your Lunch Flow API key in Settings before importing accounts. Connect your banks and enable them for the API destination in Lunch Flow first.',
    configureButton: 'Open settings',
    listError:
      'Could not load Lunch Flow accounts. Check your key and account access settings.',
    empty:
      'No accounts are available. Connect a bank in Lunch Flow and enable it in your API destination.',
    importSuccess: 'Selected accounts imported from Lunch Flow.',
    importErrorTitle: 'Could not import accounts',
    importErrorMessage: 'Refresh the account list and try again.',
    unlinkSuccess:
      'Account unlinked from Lunch Flow sync. Its Guallet data remains.',
    unlinkErrorTitle: 'Could not unlink account',
    unlinkErrorMessage: 'Please try again.',
    unlinkButton: 'Unlink',
    importButton: 'Import selected',
  },
};

type PersonalProviderImportStepProps = {
  provider: PersonalProvider;
  isCredentialLoading: boolean;
  configured: boolean;
  accounts: PersonalProviderAccount[];
  isLoading: boolean;
  isError: boolean;
  isImporting: boolean;
  isUnlinking: boolean;
  onRefresh: () => void;
  onImport: (selectedKeys: string[]) => Promise<unknown>;
  onUnlink: (key: string) => Promise<unknown>;
  onBack: () => void;
  onDone: () => void;
  onConfigure: () => void;
};

export function PersonalProviderImportStep({
  provider,
  isCredentialLoading,
  configured,
  accounts,
  isLoading,
  isError,
  isImporting,
  isUnlinking,
  onRefresh,
  onImport,
  onUnlink,
  onBack,
  onDone,
  onConfigure,
}: Readonly<PersonalProviderImportStepProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const prefix = `feature.accounts.add.${provider}`;
  const defaults = providerImportDefaults[provider];
  const labels = Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [
      key,
      t(`${prefix}.${key}`, value),
    ]),
  ) as PersonalProviderImportLabels;
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  async function importSelected() {
    try {
      await onImport(selectedKeys);
      notifications.show({ message: labels.importSuccess, color: 'green' });
      onDone();
    } catch {
      notifications.show({
        title: labels.importErrorTitle,
        message: labels.importErrorMessage,
        color: 'red',
      });
    }
  }

  async function unlink(key: string) {
    try {
      await onUnlink(key);
      setSelectedKeys((current) => current.filter((id) => id !== key));
      notifications.show({ message: labels.unlinkSuccess, color: 'green' });
    } catch {
      notifications.show({
        title: labels.unlinkErrorTitle,
        message: labels.unlinkErrorMessage,
        color: 'red',
      });
    }
  }

  if (isCredentialLoading)
    return <Text>{t('common.loading', 'Loading…')}</Text>;
  if (!configured) {
    return (
      <Stack gap={spacing.md}>
        <Title order={3}>{labels.title}</Title>
        <Alert icon={<IconInfoCircle size={18} />}>
          {labels.configureMessage}
        </Alert>
        <Group justify="space-between">
          <Button variant="outline" onClick={onBack}>
            {t('common.back', 'Back')}
          </Button>
          <Button onClick={onConfigure}>{labels.configureButton}</Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap={spacing.md}>
      <Title order={3}>{labels.title}</Title>
      <Text size="sm" c="dimmed">
        {labels.subtitle}
      </Text>
      {isError && (
        <Alert color="red" icon={<IconInfoCircle size={18} />}>
          {labels.listError}{' '}
          <Button variant="subtle" onClick={onRefresh}>
            {t('common.retry', 'Retry')}
          </Button>
        </Alert>
      )}
      {!isError && isLoading && <Text>{t('common.loading', 'Loading…')}</Text>}
      {!isError && !isLoading && accounts.length === 0 && (
        <Alert icon={<IconInfoCircle size={18} />}>{labels.empty}</Alert>
      )}
      {!isError && !isLoading && accounts.length > 0 && (
        <Checkbox.Group value={selectedKeys} onChange={setSelectedKeys}>
          <Stack gap={spacing.xs}>
            {accounts.map((account) => (
              <Card key={account.key} withBorder p={spacing.sm} radius="md">
                <Group wrap="nowrap" align="center">
                  <Checkbox
                    value={account.key}
                    disabled={Boolean(account.linkedAccountId)}
                    aria-label={account.name}
                  />
                  <Avatar
                    src={account.institutionLogo}
                    radius="sm"
                    color="blue"
                  >
                    {account.institutionName?.slice(0, 2).toUpperCase() ?? 'BK'}
                  </Avatar>
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text fw={500}>{account.name}</Text>
                    <Text size="sm" c="dimmed">
                      {[account.institutionName, ...(account.details ?? [])]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </Stack>
                  {account.linkedAccountId && (
                    <Button
                      variant="subtle"
                      color="red"
                      onClick={() => void unlink(account.key)}
                      loading={isUnlinking}
                    >
                      {labels.unlinkButton}
                    </Button>
                  )}
                </Group>
              </Card>
            ))}
          </Stack>
        </Checkbox.Group>
      )}
      <Group justify="space-between">
        <Button variant="outline" onClick={onBack}>
          {t('common.back', 'Back')}
        </Button>
        <Group>
          <Button variant="subtle" onClick={onRefresh} loading={isLoading}>
            {t('common.refresh', 'Refresh')}
          </Button>
          <Button
            onClick={() => void importSelected()}
            loading={isImporting}
            disabled={selectedKeys.length === 0}
          >
            {labels.importButton}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
