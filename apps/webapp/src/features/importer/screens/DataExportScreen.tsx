import { BaseScreen } from "@/components/Screens/BaseScreen";
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
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useState } from "react";
import { useAccounts, useGualletClient } from "@guallet/api-react";
import { IconCheck, IconMail } from "@tabler/icons-react";

export function DataExportScreen() {
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
        accounts: selectedAccountIds.length > 0 ? selectedAccountIds : undefined,
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
              borderRadius: "50%",
              backgroundColor: "var(--mantine-color-green-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconCheck size={48} color="var(--mantine-color-green-6)" />
          </div>

          <Stack align="center" gap="xs">
            <Title order={2}>Export Started Successfully!</Title>
            <Text c="dimmed" ta="center">
              Your data export is now being processed in the background.
            </Text>
          </Stack>

          <Alert icon={<IconMail size={16} />} color="blue" w="100%">
            <Stack gap="xs">
              <Text fw={500} size="sm">
                You'll receive an email with the CSV file
              </Text>
              <Text size="sm">
                We'll send you an email with the exported data attached as a CSV
                file. You can open it with any spreadsheet application.
              </Text>
            </Stack>
          </Alert>

          <Button fullWidth size="md" onClick={() => setIsModalOpened(false)}>
            Got it
          </Button>
        </Stack>
      </Modal>

      <BaseScreen>
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={2}>Export Transactions</Title>
            <Text c="dimmed">
              Export your transactions to a CSV file. The file will be sent to
              your email.
            </Text>
          </Stack>

          {error && (
            <Alert
              color="red"
              title="Export Error"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Paper shadow="sm" p="lg" withBorder>
            <Stack gap="md">
              <Title order={4}>Filters (Optional)</Title>
              <Text size="sm" c="dimmed">
                By default, all your transactions will be exported. Use the
                filters below to export a specific subset.
              </Text>

              <DatePickerInput
                type="range"
                label="Date Range"
                placeholder="Pick date range"
                value={dateRange}
                onChange={setDateRange}
                clearable
              />

              <MultiSelect
                label="Accounts"
                placeholder="Select accounts (leave empty for all)"
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
                What happens next?
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  Your export request will be processed in the background
                </List.Item>
                <List.Item>
                  The CSV file will include: Date, Description, Amount,
                  Currency, Account, Category, and Notes
                </List.Item>
                <List.Item>
                  You'll receive an email with the CSV file attached
                </List.Item>
                <List.Item>
                  You can continue using the app while the export is processed
                </List.Item>
              </List>
            </Stack>
          </Paper>

          <Group justify="flex-end">
            <Button size="md" onClick={handleExport} loading={isLoading}>
              Export Transactions
            </Button>
          </Group>
        </Stack>
      </BaseScreen>
    </>
  );
}

