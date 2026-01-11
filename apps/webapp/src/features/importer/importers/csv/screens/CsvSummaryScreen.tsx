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
          //TODO: Reset all the data from the journey atoms
          navigate({
            to: "/dashboard",
          });
        }}
        closeOnClickOutside
        closeOnEscape
        withCloseButton={false}
        centered
      >
        <Stack>
          <Title>Import Started</Title>
          <Text>
            Your CSV import has been started. You will receive an email when the
            import is complete with details about the number of transactions
            processed.
          </Text>
          <Button
            onClick={() => {
              // After all is imported, navigate to success page
              navigate({
                to: "/",
              });
            }}
          >
            Go back to the dashboard
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
      <Stack>
        <p>Import summary</p>

        {error && (
          <Stack>
            <Text c="red">Error while importing data</Text>
            <Text>{error}</Text>
          </Stack>
        )}

        <Divider label="Review the data before importing" />
        <Accordion>
          <Accordion.Item value="Transactions">
            <Accordion.Control>
              Transactions <Badge>{csvData.data.length}</Badge>
            </Accordion.Control>
            <Accordion.Panel>
              <TransactionsContent />
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
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Source Account</Table.Th>
            <Table.Th>Destination Account</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Source account</Table.Td>
            <Table.Td>{destinationAccount?.name ?? "New account"}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    );
  }

  return (
    <Stack>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Source Account</Table.Th>
            <Table.Th>Destination Account</Table.Th>
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
                <Table.Td>{destinationAccount?.name ?? "New account"}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Stack>
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

  // Account data
  const { categories: remoteCategories } = useCategories();
  const categoriesMappings = useAtomValue(categoriesMappingsAtom);

  const sampleTransactions = transactions
    // const shuffle the array to get random items, not necessary the first N items
    .toSorted(() => 0.5 - Math.random())
    // Get just a few elements to show as "example" to the user
    .slice(0, SAMPLE_ARRAY_SIZE);

  return (
    <Stack>
      <Text>{transactions.length} transactions to be imported</Text>
      <Text>Sample data to be imported</Text>
      <Table>
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
                <Table.Td>{destinationServerAccountName}</Table.Td>
                <Table.Td>{formatDate(entry.date)}</Table.Td>
                <Table.Td>{entry.amount}</Table.Td>
                <Table.Td>{entry.description}</Table.Td>
                <Table.Td>{entry.notes}</Table.Td>
                <Table.Td>{destinationServerCategoryName}</Table.Td>
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
