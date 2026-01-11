import { AccountDto, CategoryDto } from "@guallet/api-client";
import { FieldMappings } from "../models";
import { DEFAULT_ACCOUNT_NAME } from "./CsvAccountsScreen";
import { formatDate } from "@/utils/dateUtils";
import {
  Modal,
  Stack,
  Title,
  Button,
  LoadingOverlay,
  Divider,
  Accordion,
  Badge,
  Table,
  Text,
  Container,
  Paper,
  Group,
  Stepper,
  Alert,
  List,
} from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useState } from "react";
import {
  csvAccountsAtom,
  csvCategoriesAtom,
  csvInfoAtom,
  csvMappingsAtom,
  accountMappingsAtom,
  categoriesMappingsAtom,
} from "../state/csvState";
import { useAccounts, useCategories } from "@guallet/api-react";
import { useGualletClient } from "@guallet/api-react";
import { IconCheck, IconMail } from "@tabler/icons-react";

export function CsvSummaryScreen() {
  const navigate = useNavigate();
  const gualletClient = useGualletClient();

  const accounts = useAtomValue(csvAccountsAtom);
  const categories = useAtomValue(csvCategoriesAtom);
  const csvData = useAtomValue(csvInfoAtom);
  const transactions = csvData.data;
  const fieldMappings = useAtomValue(csvMappingsAtom);

  // Data
  const accountMappings = useAtomValue(accountMappingsAtom);
  const categoriesMappings = useAtomValue(categoriesMappingsAtom);

  // MAP DATA
  const mappedTransactions = transactions.map((row) => {
    const entry = mapTransaction(
      row,
      fieldMappings,
      accountMappings,
      categoriesMappings
    );

    return entry;
  });
  // END MAP DATA

  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isModalOpened, setIsModalOpened] = useState(false);

  const importData = async () => {
    try {
      setError(null);
      setIsBusy(true);

      // Prepare account mappings for API
      const apiAccountMappings: Record<string, any> = {};
      for (const [key, account] of Object.entries(accountMappings)) {
        if (account) {
          apiAccountMappings[key] = {
            id: account.id,
            name: account.name || key,
            shouldCreate: !account.id, // If no ID, we need to create it
          };
        } else {
          apiAccountMappings[key] = {
            name: key,
            shouldCreate: true,
          };
        }
      }

      // Prepare category mappings for API
      const apiCategoryMappings: Record<string, any> = {};
      for (const [key, category] of Object.entries(categoriesMappings)) {
        if (category) {
          apiCategoryMappings[key] = {
            id: category.id,
            name: category.name || key,
            shouldCreate: !category.id,
          };
        } else if (key) {
          apiCategoryMappings[key] = {
            name: key,
            shouldCreate: true,
          };
        }
      }

      // Call the new bulk import API
      await gualletClient.dataImporter.importCsv({
        csvData: csvData.data,
        fieldMappings,
        accountMappings: apiAccountMappings,
        categoryMappings: apiCategoryMappings,
      });

      setIsBusy(false);
      setIsModalOpened(true);
    } catch (e) {
      console.error(e);
      setError(`${e}`);
      setIsModalOpened(false);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <Modal
        opened={isModalOpened}
        onClose={() => {
          setIsModalOpened(false);
          navigate({
            to: "/dashboard",
          });
        }}
        closeOnClickOutside
        closeOnEscape
        withCloseButton={false}
        centered
        size="md"
      >
        <Stack align="center" gap="lg" py="md">
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            backgroundColor: 'var(--mantine-color-green-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconCheck size={48} color="var(--mantine-color-green-6)" />
          </div>
          
          <Stack align="center" gap="xs">
            <Title order={2}>Import Started Successfully!</Title>
            <Text c="dimmed" ta="center">
              Your CSV import is now being processed in the background.
            </Text>
          </Stack>

          <Alert icon={<IconMail size={16} />} color="blue" w="100%">
            <Stack gap="xs">
              <Text fw={500} size="sm">You'll receive an email notification</Text>
              <Text size="sm">
                We'll send you an email with the import results, including the number
                of transactions successfully processed.
              </Text>
            </Stack>
          </Alert>

          <Button
            fullWidth
            size="md"
            onClick={() => {
              navigate({
                to: "/",
              });
            }}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Modal>

      <LoadingOverlay
        visible={isBusy}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{
          children: `Submitting your import request...`,
        }}
      />

      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={2}>Review & Import</Title>
            <Text c="dimmed" size="sm">
              Review your data before importing. All {transactions.length} transactions
              will be processed on the server.
            </Text>
          </Stack>

          <Stepper active={4} size="sm">
            <Stepper.Step label="Upload" description="CSV file" />
            <Stepper.Step label="Map fields" description="Column mapping" />
            <Stepper.Step label="Accounts" description="Account mapping" />
            <Stepper.Step label="Categories" description="Category mapping" />
            <Stepper.Step label="Review" description="Final review" />
          </Stepper>

          {error && (
            <Alert color="red" title="Import Error" withCloseButton onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Paper shadow="sm" p="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={500}>Import Summary</Text>
                <Badge size="lg" color="blue">
                  {transactions.length} transactions
                </Badge>
              </Group>

              <Accordion defaultValue="Transactions" variant="separated">
                <Accordion.Item value="Transactions">
                  <Accordion.Control>
                    <Group>
                      <Text fw={500}>Transactions</Text>
                      <Badge>{csvData.data.length}</Badge>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <TransactionsContent />
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="Accounts">
                  <Accordion.Control>
                    <Group>
                      <Text fw={500}>Accounts</Text>
                      <Badge>{accounts.length || 1}</Badge>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <AccountsImportedContent />
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="Categories">
                  <Accordion.Control>
                    <Group>
                      <Text fw={500}>Categories</Text>
                      <Badge>{categories.length}</Badge>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    {categories.length > 0 ? (
                      <Text size="sm">
                        {categories.length} categories will be mapped
                      </Text>
                    ) : (
                      <Text size="sm" c="dimmed">
                        No categories to be imported
                      </Text>
                    )}
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text fw={500} size="sm">What happens next?</Text>
              <List size="sm" spacing="xs">
                <List.Item>Your data will be processed asynchronously on the server</List.Item>
                <List.Item>Accounts and categories will be created as needed</List.Item>
                <List.Item>You'll receive an email when the import is complete</List.Item>
                <List.Item>You can continue using the app while processing happens</List.Item>
              </List>
            </Stack>
          </Paper>

          <Group justify="space-between">
            <Button
              variant="subtle"
              onClick={() => {
                navigate({
                  to: "/importer/csv/categories",
                });
              }}
            >
              Back
            </Button>
            <Button
              size="md"
              onClick={async () => {
                await importData();
              }}
            >
              Start Import
            </Button>
          </Group>
        </Stack>
      </Container>
    </>
  );
}
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="Accounts">
            <Accordion.Control>
              Accounts <Badge>{accounts.length}</Badge>
            </Accordion.Control>
            <Accordion.Panel>
              <AccountsImportedContent />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="Categories">
            <Accordion.Control>
              Categories <Badge>{categories.length}</Badge>
            </Accordion.Control>
            <Accordion.Panel>
              {categories.length > 0
                ? "Imported categories"
                : "No categories to be imported"}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Button
          onClick={async () => {
            await importData();
          }}
        >
          Finish importing
        </Button>
      </Stack>
    </>
  );
}

function AccountsImportedContent() {
  const accounts = useAtomValue(csvAccountsAtom);
  const { accounts: remoteAccounts } = useAccounts();
  const accountMappings = useAtomValue(accountMappingsAtom);

  if (accounts.length === 0) {
    const destinationAccount = remoteAccounts.find(
      (x) => x.id == accountMappings[DEFAULT_ACCOUNT_NAME]?.id
    );

    return (
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>CSV Account</Table.Th>
            <Table.Th>Maps to</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Default Account</Table.Td>
            <Table.Td>
              <Badge color="teal" variant="light">
                {destinationAccount?.name ?? "New account"}
              </Badge>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>CSV Account</Table.Th>
          <Table.Th>Maps to</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {accounts.map((account, index) => {
          const destinationAccount = remoteAccounts.find(
            (x) => x.id == accountMappings[account]?.id
          );
          return (
            <Table.Tr key={index}>
              <Table.Td>{account}</Table.Td>
              <Table.Td>
                <Badge color="teal" variant="light">
                  {destinationAccount?.name ?? "New account"}
                </Badge>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

function TransactionsContent() {
  const csvData = useAtomValue(csvInfoAtom);
  const fieldMappings = useAtomValue(csvMappingsAtom);

  const transactions = csvData.data;
  const SAMPLE_ARRAY_SIZE = 10;

  // Account data
  const { accounts: remoteAccounts } = useAccounts();
  const accountMappings = useAtomValue(accountMappingsAtom);

  // Category data
  const { categories: remoteCategories } = useCategories();
  const categoriesMappings = useAtomValue(categoriesMappingsAtom);

  const sampleTransactions = transactions
    .toSorted(() => 0.5 - Math.random())
    .slice(0, SAMPLE_ARRAY_SIZE);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Sample Preview
        </Text>
        <Text size="xs" c="dimmed">
          Showing {Math.min(SAMPLE_ARRAY_SIZE, transactions.length)} of{" "}
          {transactions.length} transactions
        </Text>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Account</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Notes</Table.Th>
            <Table.Th>Category</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sampleTransactions.map((transaction: any, index) => {
            const entry = mapTransaction(
              transaction,
              fieldMappings,
              accountMappings,
              categoriesMappings
            );

            const destinationServerAccountName =
              remoteAccounts.find((x) => x.id == entry.destinationAccountId)
                ?.name ?? "New account";

            const destinationServerCategoryName =
              remoteCategories.find((x) => x.id == entry.destinationCategoryId)
                ?.name ?? "Untagged";

            return (
              <Table.Tr key={index}>
                <Table.Td>
                  <Badge size="sm" variant="light">
                    {destinationServerAccountName}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(entry.date)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {entry.amount}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{entry.description}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {entry.notes || "-"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge size="sm" color="gray" variant="light">
                    {destinationServerCategoryName}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

export interface CSVTransaction {
  date: string;
  amount: number;
  description: string;
  notes: string | null;

  sourceAccount: string;
  destinationAccountId: string | null;
  sourceCategory: string | null;
  destinationCategoryId: string | null;
}

function mapTransaction(
  row: any,
  mappings: FieldMappings,
  accountMappings: Record<string, AccountDto | null | undefined>,
  categoryMappings: Record<string, CategoryDto | null | undefined>
): CSVTransaction {
  const accountValue = row[mappings.account];
  const dateValue = row[mappings.date];
  const amountValue = row[mappings.amount];
  const descriptionValue = row[mappings.description];
  const notesValue = row[mappings.notes];
  const categoryValue = row[mappings.category];

  const destinationAccount =
    accountMappings[accountValue] ?? accountMappings[DEFAULT_ACCOUNT_NAME];
  const destinationCategory = categoryMappings[categoryValue];

  return {
    date: dateValue,
    amount: amountValue,
    description: descriptionValue,
    notes: notesValue,

    sourceAccount: accountValue,
    destinationAccountId: destinationAccount?.id,
    sourceCategory: categoryValue,
    destinationCategoryId: destinationCategory?.id,
  } as CSVTransaction;
}
