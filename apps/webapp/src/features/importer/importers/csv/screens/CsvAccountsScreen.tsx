import {
  Stack,
  Table,
  Select,
  Button,
  Container,
  Title,
  Text,
  Paper,
  Group,
  Badge,
  Alert,
} from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useCsvStore, useCsvAccounts } from '../state/csvState';
import { useAccounts } from '@guallet/api-react';
import { IconInfoCircle } from '@tabler/icons-react';
import { CsvStepper } from '../components/CsvStepper';

export const DEFAULT_ACCOUNT_NAME = 'account';

export function CsvAccountsScreen() {
  const navigate = useNavigate();

  const { accounts: remoteAccounts } = useAccounts();
  const availableAccounts = [null, ...remoteAccounts];
  const csvAccounts = useCsvAccounts();
  const mappings = useCsvStore((state) => state.accountMappings);
  const setAccountMappings = useCsvStore((state) => state.setAccountMappings);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={2}>Map Accounts</Title>
          <Text c="dimmed" size="sm">
            Map your CSV accounts to existing accounts or create new ones.
          </Text>
        </Stack>

        <CsvStepper
          activeStep={2}
          onStepClick={(stepIndex) => {
            switch (stepIndex) {
              case 0:
                navigate({
                  to: '/importer/csv',
                });
                break;
              case 1:
                navigate({
                  to: '/importer/csv/properties',
                });
                break;
            }
          }}
        />

        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Account Mapping"
          color="blue"
        >
          <Text size="sm">
            Select an existing account or choose "Map to a new account" to
            create a new one. All transactions will be imported to the mapped
            accounts.
          </Text>
        </Alert>

        <Paper shadow="sm" p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Account Mappings</Text>
              <Badge color="blue">
                {csvAccounts.length === 0 ? '1' : csvAccounts.length}{' '}
                {csvAccounts.length === 1 ? 'account' : 'accounts'}
              </Badge>
            </Group>

            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>CSV Account</Table.Th>
                  <Table.Th>Map to Account</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {csvAccounts.length === 0 ? (
                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>Default Account</Text>
                      <Text size="xs" c="dimmed">
                        All transactions
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Select
                        searchable
                        placeholder="Select or create an account"
                        data={availableAccounts.map((x) => ({
                          value: x?.id ?? '',
                          label: x?.name ?? 'Create new account',
                        }))}
                        onChange={(value) => {
                          const updatedMappings = { ...mappings };
                          updatedMappings[DEFAULT_ACCOUNT_NAME] =
                            remoteAccounts.find((x) => x.id === value);
                          setAccountMappings(updatedMappings);
                        }}
                      />
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  csvAccounts.map((x) => {
                    return (
                      <Table.Tr key={x ?? 'source'}>
                        <Table.Td>
                          <Text fw={500}>{x ?? 'Unspecified'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Select
                            searchable
                            placeholder="Select or create an account"
                            data={availableAccounts.map((acc) => ({
                              value: acc?.id ?? '',
                              label: acc?.name ?? 'Create new account',
                            }))}
                            onChange={(value) => {
                              const updatedMappings = { ...mappings };
                              updatedMappings[x] = remoteAccounts.find(
                                (acc) => acc.id === value,
                              );
                              setAccountMappings(updatedMappings);
                            }}
                          />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>

        <Group justify="space-between">
          <Button
            variant="subtle"
            onClick={() => {
              navigate({
                to: '/importer/csv/properties',
              });
            }}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              navigate({
                to: '/importer/csv/categories',
              });
            }}
          >
            Continue to Categories
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
