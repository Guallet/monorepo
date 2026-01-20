import { BaseScreen } from '@/components/Screens/BaseScreen';
import {
  Stack,
  Title,
  Text,
  Button,
  Paper,
  Group,
  MultiSelect,
  Modal,
  Alert,
  List,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useState } from 'react';
import { useAccounts, useGualletClient } from '@guallet/api-react';
import { IconCheck, IconMail } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export function DataExportScreen() {
  const { t } = useTranslation();
  const gualletClient = useGualletClient();
  const { accounts } = useAccounts();

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: account.name,
  }));

  const handleExport = async () => {
    try {
      setError(null);
      setIsLoading(true);

      await gualletClient.dataExporter.exportCsv({
        startDate: dateRange[0]?.toISOString(),
        endDate: dateRange[1]?.toISOString(),
        accounts:
          selectedAccountIds.length > 0 ? selectedAccountIds : undefined,
      });

      setIsModalOpened(true);
    } catch (e) {
      console.error(e);
      setError(`${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        opened={isModalOpened}
        onClose={() => setIsModalOpened(false)}
        closeOnClickOutside
        closeOnEscape
        withCloseButton={false}
        centered
        size="md"
      >
        <Stack align="center" gap="lg" py="md">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'var(--mantine-color-green-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconCheck size={48} color="var(--mantine-color-green-6)" />
          </div>

          <Stack align="center" gap="xs">
            <Title order={2}>{t('screens.dataExport.modal.title')}</Title>
            <Text c="dimmed" ta="center">
              {t('screens.dataExport.modal.description')}
            </Text>
          </Stack>

          <Alert icon={<IconMail size={16} />} color="blue" w="100%">
            <Stack gap="xs">
              <Text fw={500} size="sm">
                {t('screens.dataExport.modal.emailTitle')}
              </Text>
              <Text size="sm">
                {t('screens.dataExport.modal.emailDescription')}
              </Text>
            </Stack>
          </Alert>

          <Button fullWidth size="md" onClick={() => setIsModalOpened(false)}>
            {t('screens.dataExport.modal.button')}
          </Button>
        </Stack>
      </Modal>

      <BaseScreen>
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={2}>{t('screens.dataExport.title')}</Title>
            <Text c="dimmed">{t('screens.dataExport.description')}</Text>
          </Stack>

          {error && (
            <Alert
              color="red"
              title={t('screens.dataExport.error.title')}
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Paper shadow="sm" p="lg" withBorder>
            <Stack gap="md">
              <Title order={4}>{t('screens.dataExport.filters.title')}</Title>
              <Text size="sm" c="dimmed">
                {t('screens.dataExport.filters.description')}
              </Text>

              <DatePickerInput
                type="range"
                label={t('screens.dataExport.filters.dateRange.label')}
                placeholder={t(
                  'screens.dataExport.filters.dateRange.placeholder',
                )}
                value={dateRange}
                onChange={(range) => {
                  if (range?.[0] === null || range[1] === null) {
                    // Handle clearing the date range or incomplete selection
                    setDateRange([null, null]);
                  } else {
                    // Both dates are selected, parse them
                    const startDateValue = new Date(range[0]);
                    const endDateValue = new Date(range[1]);
                    setDateRange([startDateValue, endDateValue]);
                  }
                }}
                clearable
              />

              <MultiSelect
                label={t('screens.dataExport.filters.accounts.label')}
                placeholder={t(
                  'screens.dataExport.filters.accounts.placeholder',
                )}
                data={accountOptions}
                value={selectedAccountIds}
                onChange={setSelectedAccountIds}
                clearable
                searchable
              />
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text fw={500} size="sm">
                {t('screens.dataExport.info.title')}
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>{t('screens.dataExport.info.step1')}</List.Item>
                <List.Item>{t('screens.dataExport.info.step2')}</List.Item>
                <List.Item>{t('screens.dataExport.info.step3')}</List.Item>
                <List.Item>{t('screens.dataExport.info.step4')}</List.Item>
              </List>
            </Stack>
          </Paper>

          <Group justify="flex-end">
            <Button size="md" onClick={handleExport} loading={isLoading}>
              {t('screens.dataExport.exportButton')}
            </Button>
          </Group>
        </Stack>
      </BaseScreen>
    </>
  );
}
