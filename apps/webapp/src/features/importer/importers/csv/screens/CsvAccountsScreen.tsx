import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import {
  useAccountMappings,
  useCsvAccounts,
  useCsvActions,
} from '../state/csvState';
import { useAccounts } from '@guallet/api-react';
import { IconInfoCircle } from '@tabler/icons-react';
import { CsvStepper } from '../components/CsvStepper';

export const DEFAULT_ACCOUNT_NAME = 'account';

export function CsvAccountsScreen() {
  const navigate = useNavigate();

  const { accounts: remoteAccounts } = useAccounts();
  const availableAccounts = [null, ...remoteAccounts];
  const csvAccounts = useCsvAccounts();
  const mappings = useAccountMappings();
  const { setAccountMappings } = useCsvActions();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Map Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Map your CSV accounts to existing accounts or create new ones.
        </p>
      </div>

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

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-900">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
          <IconInfoCircle className="h-4 w-4" />
          Account Mapping
        </div>
        <p className="text-sm text-blue-800">
          Select an existing account or choose "Map to a new account" to create
          a new one. All transactions will be imported to the mapped accounts.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-semibold">Account Mappings</p>
          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {csvAccounts.length === 0 ? '1' : csvAccounts.length}{' '}
            {csvAccounts.length === 1 ? 'account' : 'accounts'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/40">
                <th className="border px-3 py-2 text-left font-semibold">
                  CSV Account
                </th>
                <th className="border px-3 py-2 text-left font-semibold">
                  Map to Account
                </th>
              </tr>
            </thead>
            <tbody>
              {csvAccounts.length === 0 ? (
                <tr>
                  <td className="border px-3 py-2">
                    <p className="font-semibold">Default Account</p>
                    <p className="text-xs text-muted-foreground">
                      All transactions
                    </p>
                  </td>
                  <td className="border px-3 py-2">
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      defaultValue=""
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        const updatedMappings = { ...mappings };
                        updatedMappings[DEFAULT_ACCOUNT_NAME] =
                          remoteAccounts.find(
                            (account) => account.id === value,
                          );
                        setAccountMappings(updatedMappings);
                      }}
                    >
                      <option value="">Select or create an account</option>
                      {availableAccounts.map((account) => (
                        <option
                          key={account?.id ?? 'new-account'}
                          value={account?.id ?? ''}
                        >
                          {account?.name ?? 'Create new account'}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ) : (
                csvAccounts.map((accountName) => {
                  const mappedAccountId = mappings[accountName]?.id ?? '';

                  return (
                    <tr key={accountName ?? 'source'}>
                      <td className="border px-3 py-2">
                        <p className="font-semibold">
                          {accountName ?? 'Unspecified'}
                        </p>
                      </td>
                      <td className="border px-3 py-2">
                        <select
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={mappedAccountId}
                          onChange={(event) => {
                            const value = event.currentTarget.value;
                            const updatedMappings = { ...mappings };
                            updatedMappings[accountName] = remoteAccounts.find(
                              (account) => account.id === value,
                            );
                            setAccountMappings(updatedMappings);
                          }}
                        >
                          <option value="">Select or create an account</option>
                          {availableAccounts.map((account) => (
                            <option
                              key={account?.id ?? `new-account-${accountName}`}
                              value={account?.id ?? ''}
                            >
                              {account?.name ?? 'Create new account'}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="ghost"
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
      </div>
    </div>
  );
}
