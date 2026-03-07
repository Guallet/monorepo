import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ResponsiveModal } from '@guallet/ui-react';
import { useState } from 'react';
import { useAccounts, useGualletClient } from '@guallet/api-react';
import { IconCheck, IconMail } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export function DataExportScreen() {
  const { t } = useTranslation();
  const gualletClient = useGualletClient();
  const { accounts } = useAccounts();

  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'ofe' | 'json'>(
    'csv',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: account.name,
  }));

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccountIds((currentSelection) => {
      if (currentSelection.includes(accountId)) {
        return currentSelection.filter(
          (selectedId) => selectedId !== accountId,
        );
      }

      return [...currentSelection, accountId];
    });
  };

  const selectAllAccounts = () => {
    setSelectedAccountIds(accountOptions.map((account) => account.value));
  };

  const clearAllAccounts = () => {
    setSelectedAccountIds([]);
  };

  const handleExport = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const exportPayload = {
        startDate: dateRange[0]
          ? new Date(dateRange[0]).toISOString()
          : undefined,
        endDate: dateRange[1]
          ? new Date(dateRange[1]).toISOString()
          : undefined,
        accounts:
          selectedAccountIds.length > 0 ? selectedAccountIds : undefined,
        format: exportFormat,
      };

      await gualletClient.dataExporter.exportData(exportPayload);

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
      <ResponsiveModal
        opened={isModalOpened}
        onClose={() => {
          setIsModalOpened(false);
        }}
        title={t('screens.dataExport.modal.title')}
        size="md"
      >
        <div className="space-y-6 py-2">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <IconCheck className="h-12 w-12 text-emerald-600" />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">
              {t('screens.dataExport.modal.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('screens.dataExport.modal.description')}
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <IconMail className="mt-0.5 h-4 w-4 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900">
                  {t('screens.dataExport.modal.emailTitle')}
                </p>
                <p className="text-sm text-blue-800">
                  {t('screens.dataExport.modal.emailDescription')}
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              setIsModalOpened(false);
            }}
          >
            {t('screens.dataExport.modal.button')}
          </Button>
        </div>
      </ResponsiveModal>

      <BaseScreen>
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('screens.dataExport.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('screens.dataExport.description')}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">
                    {t('screens.dataExport.error.title')}
                  </p>
                  <p className="text-sm">{error}</p>
                </div>
                <button
                  type="button"
                  className="text-xs text-red-700 underline"
                  onClick={() => {
                    setError(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('screens.dataExport.filters.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('screens.dataExport.filters.description')}
              </p>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="data-export-start-date">
                    {t('screens.dataExport.filters.dateRange.label')} (start)
                  </Label>
                  <Input
                    id="data-export-start-date"
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={dateRange[0] ?? ''}
                    onChange={(event) => {
                      const nextStart = event.currentTarget.value || null;
                      setDateRange([nextStart, dateRange[1]]);
                    }}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="data-export-end-date">
                    {t('screens.dataExport.filters.dateRange.label')} (end)
                  </Label>
                  <Input
                    id="data-export-end-date"
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={dateRange[1] ?? ''}
                    onChange={(event) => {
                      const nextEnd = event.currentTarget.value || null;
                      setDateRange([dateRange[0], nextEnd]);
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{t('screens.dataExport.filters.accounts.label')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('screens.dataExport.filters.accounts.placeholder')}
                </p>

                <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                  {accountOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No accounts available
                    </p>
                  ) : (
                    accountOptions.map((account) => {
                      const isSelected = selectedAccountIds.includes(
                        account.value,
                      );

                      return (
                        <label
                          key={account.value}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              toggleAccountSelection(account.value);
                            }}
                            className="h-4 w-4"
                          />
                          <span>{account.label}</span>
                        </label>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllAccounts}
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllAccounts}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="data-export-format">
                  {t('screens.dataExport.filters.format.label')}
                </Label>
                <select
                  id="data-export-format"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={exportFormat}
                  onChange={(event) => {
                    const value = event.currentTarget.value;

                    if (
                      value === 'csv' ||
                      value === 'ofe' ||
                      value === 'json'
                    ) {
                      setExportFormat(value);
                    }
                  }}
                >
                  <option value="csv">
                    {t('screens.dataExport.filters.format.csv')}
                  </option>
                  <option value="ofe">
                    {t('screens.dataExport.filters.format.ofe')}
                  </option>
                  <option value="json">
                    {t('screens.dataExport.filters.format.json')}
                  </option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t('screens.dataExport.info.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>{t('screens.dataExport.info.step1')}</li>
                <li>{t('screens.dataExport.info.step2')}</li>
                <li>{t('screens.dataExport.info.step3')}</li>
                <li>{t('screens.dataExport.info.step4')}</li>
              </ul>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end">
            <Button size="lg" onClick={handleExport} disabled={isLoading}>
              {isLoading
                ? 'Exporting...'
                : t('screens.dataExport.exportButton')}
            </Button>
          </div>
        </div>
      </BaseScreen>
    </>
  );
}
