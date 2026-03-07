import {
  AccountDto,
  AccountMapping,
  CategoryDto,
  CategoryMapping,
  CsvRowData,
} from '@guallet/api-client';
import {
  useAccounts,
  useCategories,
  useGualletClient,
} from '@guallet/api-react';
import { Button } from '@/components/ui/button';
import { formatDate, parseDate } from '@/utils/dateUtils';
import { parseNumber } from '@/utils/numberUtils';
import { ResponsiveModal } from '@guallet/ui-react';
import { IconCheck, IconMail } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { FieldMappings } from '../models';
import {
  useAccountMappings,
  useCategoriesMappings,
  useCsvAccounts,
  useCsvActions,
  useCsvCategories,
  useCsvInfo,
  useCsvMappings,
} from '../state/csvState';
import { CsvStepper } from '../components/CsvStepper';
import { DEFAULT_ACCOUNT_NAME } from './CsvAccountsScreen';

export function CsvSummaryScreen() {
  const navigate = useNavigate();
  const gualletClient = useGualletClient();
  const { reset } = useCsvActions();

  const accounts = useCsvAccounts();
  const categories = useCsvCategories();
  const csvData = useCsvInfo();
  const transactions = csvData.data;
  const fieldMappings = useCsvMappings();

  const accountMappings = useAccountMappings();
  const categoriesMappings = useCategoriesMappings();

  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isModalOpened, setIsModalOpened] = useState(false);

  const importData = async () => {
    try {
      setError(null);
      setIsBusy(true);

      const apiAccountMappings: Record<string, AccountMapping> = {};
      for (const [key, account] of Object.entries(accountMappings)) {
        if (account) {
          apiAccountMappings[key] = {
            id: account.id,
            name: account.name || key,
            shouldCreate: !account.id,
          };
        } else {
          apiAccountMappings[key] = {
            name: key,
            shouldCreate: true,
          };
        }
      }

      const apiCategoryMappings: Record<string, CategoryMapping> = {};
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

      await gualletClient.dataImporter.importData({
        format: 'csv',
        csvData: csvData.data as CsvRowData[],
        fieldMappings,
        accountMappings: apiAccountMappings,
        categoryMappings: apiCategoryMappings,
      });

      reset();
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
      <ResponsiveModal
        opened={isModalOpened}
        onClose={() => {
          setIsModalOpened(false);
          navigate({
            to: '/dashboard',
          });
        }}
        title="Import Started Successfully!"
        size="md"
      >
        <div className="space-y-6 py-2">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <IconCheck className="h-12 w-12 text-emerald-600" />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">Import Started Successfully!</h2>
            <p className="text-sm text-muted-foreground">
              Your CSV import is now being processed in the background.
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <IconMail className="mt-0.5 h-4 w-4 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900">
                  You&apos;ll receive an email notification
                </p>
                <p className="text-sm text-blue-800">
                  We&apos;ll send you an email with the import results, including
                  the number of transactions successfully processed.
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              navigate({
                to: '/',
              });
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      </ResponsiveModal>

      {isBusy ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="rounded-lg border bg-card px-5 py-3 text-sm font-medium shadow-lg">
            Submitting your import request...
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Review &amp; Import</h1>
          <p className="text-sm text-muted-foreground">
            Review your data before importing. All {transactions.length}{' '}
            transactions will be processed on the server.
          </p>
        </div>

        <CsvStepper
          activeStep={4}
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
              case 2:
                navigate({
                  to: '/importer/csv/accounts',
                });
                break;
              case 3:
                navigate({
                  to: '/importer/csv/categories',
                });
                break;
              default:
                break;
            }
          }}
        />

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">Import Error</p>
              <button
                type="button"
                className="text-xs underline"
                onClick={() => {
                  setError(null);
                }}
              >
                Close
              </button>
            </div>
            <p className="text-sm">{error}</p>
          </div>
        ) : null}

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-semibold">Import Summary</p>
            <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {transactions.length} transactions
            </span>
          </div>

          <div className="space-y-3">
            <details open className="rounded-lg border">
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3">
                <span className="font-semibold">Transactions</span>
                <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                  {csvData.data.length}
                </span>
              </summary>
              <div className="border-t p-4">
                <TransactionsContent />
              </div>
            </details>

            <details className="rounded-lg border">
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3">
                <span className="font-semibold">Accounts</span>
                <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                  {accounts.length || 1}
                </span>
              </summary>
              <div className="border-t p-4">
                <AccountsImportedContent />
              </div>
            </details>

            <details className="rounded-lg border">
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3">
                <span className="font-semibold">Categories</span>
                <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                  {categories.length}
                </span>
              </summary>
              <div className="border-t p-4">
                {categories.length > 0 ? (
                  <p className="text-sm">{categories.length} categories will be mapped</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No categories to be imported
                  </p>
                )}
              </div>
            </details>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">What happens next?</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Your data will be processed asynchronously on the server</li>
            <li>Accounts and categories will be created as needed</li>
            <li>You&apos;ll receive an email when the import is complete</li>
            <li>You can continue using the app while processing happens</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              navigate({
                to: '/importer/csv/categories',
              });
            }}
          >
            Back
          </Button>
          <Button
            size="lg"
            onClick={async () => {
              await importData();
            }}
          >
            Start Import
          </Button>
        </div>
      </div>
    </>
  );
}

function AccountsImportedContent() {
  const accounts = useCsvAccounts();
  const { accounts: remoteAccounts } = useAccounts();
  const accountMappings = useAccountMappings();

  if (accounts.length === 0) {
    const destinationAccount = remoteAccounts.find(
      (account) => account.id == accountMappings[DEFAULT_ACCOUNT_NAME]?.id,
    );

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="border px-3 py-2 text-left font-semibold">CSV Account</th>
              <th className="border px-3 py-2 text-left font-semibold">Maps to</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-3 py-2">Default Account</td>
              <td className="border px-3 py-2">
                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {destinationAccount?.name ?? 'New account'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/40">
            <th className="border px-3 py-2 text-left font-semibold">CSV Account</th>
            <th className="border px-3 py-2 text-left font-semibold">Maps to</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((accountName) => {
            const destinationAccount = remoteAccounts.find(
              (account) => account.id == accountMappings[accountName]?.id,
            );

            return (
              <tr key={accountName}>
                <td className="border px-3 py-2">{accountName}</td>
                <td className="border px-3 py-2">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    {destinationAccount?.name ?? 'New account'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TransactionsContent() {
  const csvData = useCsvInfo();
  const fieldMappings = useCsvMappings();

  const transactions = csvData.data as CsvRowData[];
  const sampleArraySize = 10;

  const { accounts: remoteAccounts } = useAccounts();
  const accountMappings = useAccountMappings();

  const { categories: remoteCategories } = useCategories();
  const categoriesMappings = useCategoriesMappings();

  const sampleTransactions = useMemo(() => {
    const shuffledTransactions = [...transactions];
    for (let index = shuffledTransactions.length - 1; index > 0; index--) {
      const randomIndex = Math.floor((index + 1) * 0.5);
      [shuffledTransactions[index], shuffledTransactions[randomIndex]] = [
        shuffledTransactions[randomIndex],
        shuffledTransactions[index],
      ];
    }

    return shuffledTransactions.slice(0, sampleArraySize);
  }, [transactions]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Sample Preview</p>
        <p className="text-xs text-muted-foreground">
          Showing {Math.min(sampleArraySize, transactions.length)} of{' '}
          {transactions.length} transactions
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="border px-3 py-2 text-left font-semibold">Account</th>
              <th className="border px-3 py-2 text-left font-semibold">Date</th>
              <th className="border px-3 py-2 text-left font-semibold">Amount</th>
              <th className="border px-3 py-2 text-left font-semibold">Description</th>
              <th className="border px-3 py-2 text-left font-semibold">Notes</th>
              <th className="border px-3 py-2 text-left font-semibold">Category</th>
            </tr>
          </thead>
          <tbody>
            {sampleTransactions.map((transaction: CsvRowData, index) => {
              const entry = mapTransaction(
                transaction,
                fieldMappings,
                accountMappings,
                categoriesMappings,
              );

              const destinationServerAccountName =
                remoteAccounts.find(
                  (account) => account.id == entry.destinationAccountId,
                )?.name ?? 'New account';

              const destinationServerCategoryName =
                remoteCategories.find(
                  (category) => category.id == entry.destinationCategoryId,
                )?.name ?? 'Untagged';

              return (
                <tr
                  key={`${entry.sourceAccount}-${entry.date}-${entry.amount}-${index}`}
                >
                  <td className="border px-3 py-2">
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                      {destinationServerAccountName}
                    </span>
                  </td>
                  <td className="border px-3 py-2">{formatDate(entry.date)}</td>
                  <td className="border px-3 py-2 font-semibold">{entry.amount}</td>
                  <td className="border px-3 py-2">{entry.description}</td>
                  <td className="border px-3 py-2 text-muted-foreground">
                    {entry.notes || '-'}
                  </td>
                  <td className="border px-3 py-2">
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                      {destinationServerCategoryName}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface CSVTransaction {
  date: Date;
  amount: number;
  description: string;
  notes: string | null;

  sourceAccount: string;
  destinationAccountId: string | null;
  sourceCategory: string | null;
  destinationCategoryId: string | null;
}

function mapTransaction(
  row: CsvRowData,
  mappings: FieldMappings,
  accountMappings: Record<string, AccountDto | null | undefined>,
  categoryMappings: Record<string, CategoryDto | null | undefined>,
): CSVTransaction {
  const accountValue = row[mappings.account];
  const dateValue = row[mappings.date];
  const amountValue = row[mappings.amount];
  const descriptionValue = row[mappings.description];
  const notesValue = row[mappings.notes];
  const categoryValue = row[mappings.category];

  const accountKey =
    accountValue == null ? DEFAULT_ACCOUNT_NAME : String(accountValue);
  const categoryKey = categoryValue == null ? '' : String(categoryValue);

  const destinationAccount =
    accountMappings[accountKey] ?? accountMappings[DEFAULT_ACCOUNT_NAME];
  const destinationCategory = categoryMappings[categoryKey];

  return {
    date:
      parseDate(String(dateValue ?? new Date().toISOString())) ?? new Date(),
    amount: parseNumber(amountValue) || 0,
    description: String(descriptionValue ?? ''),
    notes: notesValue == null ? null : String(notesValue),

    sourceAccount: String(accountValue ?? DEFAULT_ACCOUNT_NAME),
    destinationAccountId: destinationAccount?.id ?? null,
    sourceCategory: categoryValue == null ? null : String(categoryValue),
    destinationCategoryId: destinationCategory?.id ?? null,
  };
}
