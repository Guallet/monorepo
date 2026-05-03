import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useUserMutations } from '@guallet/api-react';
import { UserSettingsCard } from '../components/UserSettingsCard';
import { LanguageRow } from '../components/LanguageRow';
import { DefaultCurrencyRow } from '../components/DefaultCurrencyRow';
import { PreferredCurrenciesRow } from '../components/PreferredCurrenciesRow';
import { DateFormatRow } from '../components/DateFormatRow';
import { CloseAccountModal } from '../components/CloseAccountModal';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { TextRow, useTheme } from '@guallet/ui-react';
import {
  IconAlertTriangle,
  IconBuildingBank,
  IconDatabaseExport,
  IconDownload,
  IconLanguage,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingsSection({
  title,
  description,
  icon,
  children,
}: Readonly<SettingsSectionProps>) {
  const { spacing } = useTheme();

  return (
    <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
      <Stack gap={spacing.md}>
        <Group gap={spacing.md} align="flex-start" wrap="nowrap">
          <ThemeIcon size={40} radius="md" variant="light" color="blue">
            {icon}
          </ThemeIcon>
          <Box>
            <Text fw={600}>{title}</Text>
            <Text size="sm" c="dimmed" mt={spacing.xs}>
              {description}
            </Text>
          </Box>
        </Group>

        <Box mx={-spacing.lg}>{children}</Box>
      </Stack>
    </Card>
  );
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { colors, spacing } = useTheme();
  const [isCloseAccountModalOpen, closeAccountModal] = useDisclosure(false);
  const { deleteUserAccountMutation } = useUserMutations();

  async function handleCloseAccount() {
    try {
      await deleteUserAccountMutation.mutateAsync();
      closeAccountModal.close();
      await navigate({ to: '/userdeleted' });
    } catch {
      notifications.show({
        title: t(
          'screens.settings.closeAccountModal.error.title',
          'Account could not be closed',
        ),
        message: t(
          'screens.settings.closeAccountModal.error.message',
          'Please try again in a moment.',
        ),
        color: 'red',
      });
    }
  }

  return (
    <>
      <BaseScreen title={t('screens.settings.title', 'Settings')}>
        <Stack gap={spacing.md}>
          <UserSettingsCard />

          <SettingsSection
            title={t('screens.settings.preferences.title', 'User preferences')}
            description={t(
              'screens.settings.preferences.description',
              'Set regional preferences for currencies, language, and dates.',
            )}
            icon={<IconLanguage size={24} strokeWidth={1.5} />}
          >
            <LanguageRow />
            <DefaultCurrencyRow />
            <PreferredCurrenciesRow />
            <DateFormatRow />
          </SettingsSection>

          <SettingsSection
            title={t('screens.settings.institutions.title', 'Institutions')}
            description={t(
              'screens.settings.institutions.description',
              'Manage banks and institutions used to organise your accounts.',
            )}
            icon={<IconBuildingBank size={24} strokeWidth={1.5} />}
          >
            <TextRow
              label={t(
                'screens.settings.institutions.manageRow.label',
                'Manage institutions',
              )}
              onClick={() => {
                navigate({ to: '/institutions' });
              }}
            />
          </SettingsSection>

          <SettingsSection
            title={t('screens.settings.data.title', 'Import and export data')}
            description={t(
              'screens.settings.data.description',
              'Move your financial data in or out of Guallet.',
            )}
            icon={<IconDatabaseExport size={24} strokeWidth={1.5} />}
          >
            <TextRow
              label={t('screens.settings.data.exportRow.label', 'Export data')}
              leftSection={<IconDownload size={20} strokeWidth={1.5} />}
              onClick={() => {
                navigate({ to: '/settings/export' });
              }}
            />
            <TextRow
              label={t('screens.settings.data.importRow.label', 'Import data')}
              leftSection={<IconUpload size={20} strokeWidth={1.5} />}
              onClick={() => {
                navigate({ to: '/importer' });
              }}
            />
          </SettingsSection>

          <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
            <Stack gap={spacing.md}>
              <Group gap={spacing.md} align="flex-start" wrap="nowrap">
                <ThemeIcon size={40} radius="md" variant="light" color="red">
                  <IconAlertTriangle size={24} strokeWidth={1.5} />
                </ThemeIcon>
                <Box>
                  <Text fw={600}>
                    {t('screens.settings.danger.title', 'Danger zone')}
                  </Text>
                  <Text size="sm" c="dimmed" mt={spacing.xs}>
                    {t(
                      'screens.settings.danger.description',
                      'Permanent account actions live here.',
                    )}
                  </Text>
                </Box>
              </Group>
              <Button
                variant="outline"
                color="red"
                leftSection={<IconTrash size={16} strokeWidth={1.5} />}
                onClick={closeAccountModal.open}
                style={{
                  borderColor: colors.error,
                  color: colors.error,
                  alignSelf: 'flex-start',
                }}
              >
                {t(
                  'screens.settings.danger.closeAccountButton.label',
                  'Close account',
                )}
              </Button>
            </Stack>
          </Card>
        </Stack>
      </BaseScreen>

      <CloseAccountModal
        opened={isCloseAccountModalOpen}
        isLoading={deleteUserAccountMutation.isPending}
        onClose={closeAccountModal.close}
        onConfirm={() => {
          void handleCloseAccount();
        }}
      />
    </>
  );
}
