import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import {
  useAccounts,
  useCategories,
  useGualletClient,
  useQueryClient,
} from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { useAuth } from '@guallet/auth';
import type {
  AccountMapping,
  CategoryMapping,
  DataImportStatus,
  FieldMappings,
} from '@guallet/api-client';
import { useImportDraft } from './ImportDraftProvider';
import { watchImportJob } from './ImportJobMonitor';
import { isPermanentImportStatusError } from './importStatusError';
import { getImportResultCopy } from './resultState';
import {
  accountKeys,
  buildImportRequest,
  distinctValues,
  parseCsv,
  rowErrors,
  validateImportRequestSize,
  validateFields,
} from './csv';
import { ChoiceField, type Choice } from './components/ChoiceField';
import { FlowScreen, ImportCard, Notice } from './components/FlowScreen';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function TextLine({
  children,
  strong = false,
}: Readonly<{ children: string; strong?: boolean }>) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Text
      style={{
        color: strong ? colors.text.primary : colors.text.secondary,
        fontSize: typography.sizes.sm,
        fontWeight: strong ? '700' : '400',
        marginBottom: spacing.xs,
      }}
    >
      {children}
    </Text>
  );
}

function PreviewAmount({ value }: Readonly<{ value: string }>) {
  const { colors, typography } = useTheme();
  const number = Number(value.replace(',', '.'));
  let color = colors.text.primary;
  if (number < 0) color = colors.status.error;
  if (number > 0) color = colors.status.success;
  return (
    <Text
      style={{
        color,
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
      }}
    >
      {value}
    </Text>
  );
}

function ErrorText({ message }: Readonly<{ message: string | null }>) {
  const { colors, spacing } = useTheme();
  if (!message) return null;
  return (
    <Text
      accessibilityRole="alert"
      style={{ color: colors.status.error, marginBottom: spacing.md }}
    >
      {message}
    </Text>
  );
}

export function SelectFileScreen() {
  const router = useRouter();
  const { colors, spacing, borderRadius } = useTheme();
  const { draft, setDraft } = useImportDraft();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pickFile() {
    try {
      setBusy(true);
      setError(null);
      const picked = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'text/comma-separated-values',
          'application/vnd.ms-excel',
          'application/octet-stream',
        ],
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return;
      setDraft(null);
      const asset = picked.assets[0];
      if (!asset.name.toLowerCase().endsWith('.csv'))
        throw new Error('Choose a .csv file.');
      if (asset.size && asset.size > MAX_FILE_SIZE)
        throw new Error('CSV files must be 5 MB or smaller.');
      const content = await FileSystem.readAsStringAsync(asset.uri);
      if (content.length > MAX_FILE_SIZE)
        throw new Error('CSV files must be 5 MB or smaller.');
      setDraft(parseCsv(content, asset.name));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not read this file.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <FlowScreen
      step={1}
      navigationTitle="Import transactions"
      title="Bring your transactions in"
      description="Choose a CSV file from your device. You can check everything before importing."
      action="Continue to columns"
      onAction={() => router.push('/importer/csv/properties')}
      onBack={() => router.back()}
      disabled={!draft}
      busy={busy}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose a CSV file"
        onPress={() => void pickFile()}
        style={[
          styles.filePicker,
          {
            borderColor: colors.accent.primary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
          },
        ]}
      >
        <Text
          style={{
            color: colors.accent.primary,
            fontWeight: '700',
            fontSize: 16,
          }}
        >
          Choose a CSV file
        </Text>
        <Text style={{ color: colors.text.secondary, marginTop: spacing.xs }}>
          Browse files on your device
        </Text>
      </Pressable>
      {draft && (
        <ImportCard>
          <TextLine strong>{draft.fileName}</TextLine>
          <TextLine>{`${draft.rows.length} rows · ${draft.columns.length} columns · Ready to map`}</TextLine>
        </ImportCard>
      )}
      <ErrorText message={error} />
      <ImportCard>
        <TextLine strong>Before you start</TextLine>
        <TextLine>First row contains column names</TextLine>
        <TextLine>Includes date, amount and description</TextLine>
        <TextLine>CSV file, up to 5 MB</TextLine>
      </ImportCard>
    </FlowScreen>
  );
}

const FIELD_LABELS: { key: keyof FieldMappings; label: string }[] = [
  { key: 'date', label: 'Date · required' },
  { key: 'amount', label: 'Amount · required' },
  { key: 'description', label: 'Description · required' },
  { key: 'account', label: 'Account · optional' },
  { key: 'category', label: 'Category · optional' },
  { key: 'notes', label: 'Notes · optional' },
];

export function MapColumnsScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useImportDraft();
  const [error, setError] = useState<string | null>(null);
  if (!draft) return <MissingDraft />;
  const options: Choice[] = [
    { value: '', label: 'Don’t map' },
    ...draft.columns.map((column) => ({ value: column, label: column })),
  ];
  function continueFlow() {
    const problem = validateFields(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    router.push('/importer/csv/accounts');
  }
  return (
    <FlowScreen
      step={2}
      navigationTitle="Map columns"
      title="Match your columns"
      description="Tell Guallet what each column means. Examples from your file are shown below."
      action="Continue to accounts"
      onAction={continueFlow}
      onBack={() => router.back()}
    >
      <Notice>{`We found ${draft.rows.length} rows and ${draft.columns.length} columns. Date, amount and description are required.`}</Notice>
      <ErrorText message={error} />
      <ImportCard>
        {FIELD_LABELS.map(({ key, label }) => (
          <ChoiceField
            key={key}
            label={label}
            value={draft.fields[key]}
            options={options}
            sample={
              draft.fields[key]
                ? String(draft.rows[0]?.[draft.fields[key]] ?? '')
                : undefined
            }
            onChange={(value) =>
              updateDraft((current) => ({
                ...current,
                fields: { ...current.fields, [key]: value },
                accounts: Object.create(null),
                categories: Object.create(null),
              }))
            }
          />
        ))}
      </ImportCard>
    </FlowScreen>
  );
}

export function MapAccountsScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useImportDraft();
  const { accounts, isLoading, isError } = useAccounts();
  const [error, setError] = useState<string | null>(null);
  const rows = draft?.rows;
  const accountColumn = draft?.fields.account;
  const counts = useMemo(() => {
    const result = Object.create(null) as Record<string, number>;
    if (!rows) return result;
    for (const row of rows) {
      const key = String(row[accountColumn ?? ''] ?? '').trim() || 'default';
      result[key] = (result[key] ?? 0) + 1;
    }
    return result;
  }, [rows, accountColumn]);
  if (!draft) return <MissingDraft />;
  const keys = accountKeys(draft);
  const options: Choice[] = [
    ...accounts.map((account) => ({ value: account.id, label: account.name })),
    { value: 'create', label: 'Create new account' },
  ];
  function next() {
    const missing = keys.find((key) => !Object.hasOwn(draft.accounts, key));
    if (missing) {
      setError(`Choose an account for “${missing}”.`);
      return;
    }
    setError(null);
    if (distinctValues(draft, 'category').length === 0) {
      router.push('/importer/csv/preview');
      return;
    }
    router.push('/importer/csv/categories');
  }
  return (
    <FlowScreen
      step={3}
      navigationTitle="Map accounts"
      title="Where should these go?"
      description="Match each account name in your CSV to one in Guallet."
      action={
        distinctValues(draft, 'category').length
          ? 'Continue to categories'
          : 'Review import'
      }
      onAction={next}
      onBack={() => router.back()}
      disabled={isLoading || isError}
    >
      <Notice>
        Every transaction needs a destination account. You can create a new
        account during import.
      </Notice>
      {isLoading && <ActivityIndicator accessibilityLabel="Loading accounts" />}
      {isError && (
        <ErrorText message="Could not load accounts. Go back and try again." />
      )}
      <ErrorText message={error} />
      {keys.map((key) => {
        const mapping = Object.hasOwn(draft.accounts, key)
          ? draft.accounts[key]
          : undefined;
        const value = mapping?.shouldCreate ? 'create' : (mapping?.id ?? '');
        const isDefault =
          key === 'default' &&
          (!draft.fields.account ||
            draft.rows.some(
              (row) => !String(row[draft.fields.account] ?? '').trim(),
            ));
        let label = key;
        if (isDefault) {
          label = draft.fields.account
            ? 'Rows without an account'
            : 'All transactions';
        }
        return (
          <ImportCard key={key}>
            <TextLine strong>{label}</TextLine>
            <TextLine>{`${counts[key] ?? 0} rows from CSV`}</TextLine>
            <ChoiceField
              label="Map to account"
              value={value}
              options={options}
              onChange={(selected) => {
                const account = accounts.find((item) => item.id === selected);
                let mapped: AccountMapping | undefined;
                if (selected === 'create') {
                  mapped = {
                    name: isDefault ? 'Imported account' : key,
                    shouldCreate: true,
                  };
                } else if (account) {
                  mapped = {
                    id: account.id,
                    name: account.name,
                    shouldCreate: false,
                  };
                }
                updateDraft((current) => {
                  const nextAccounts = Object.assign(
                    Object.create(null) as Record<string, AccountMapping>,
                    current.accounts,
                  );
                  if (mapped) nextAccounts[key] = mapped;
                  else delete nextAccounts[key];
                  return { ...current, accounts: nextAccounts };
                });
              }}
            />
          </ImportCard>
        );
      })}
    </FlowScreen>
  );
}

export function MapCategoriesScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useImportDraft();
  const { categories, isLoading, isError } = useCategories();
  const rows = draft?.rows;
  const categoryColumn = draft?.fields.category;
  const counts = useMemo(() => {
    const result = Object.create(null) as Record<string, number>;
    if (!rows || !categoryColumn) return result;
    for (const row of rows) {
      const key = String(row[categoryColumn] ?? '').trim();
      if (key) result[key] = (result[key] ?? 0) + 1;
    }
    return result;
  }, [rows, categoryColumn]);
  if (!draft) return <MissingDraft />;
  const keys = distinctValues(draft, 'category');
  const options: Choice[] = [
    { value: '', label: 'Leave uncategorised' },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
    { value: 'create', label: 'Create new category' },
  ];
  return (
    <FlowScreen
      step={4}
      navigationTitle="Map categories"
      title="Organise your spending"
      description="Choose where the categories from your file belong. You can leave rows uncategorised."
      action="Review import"
      onAction={() => router.push('/importer/csv/preview')}
      onBack={() => router.back()}
      disabled={isLoading || isError}
    >
      {isLoading && (
        <ActivityIndicator accessibilityLabel="Loading categories" />
      )}
      {isError && (
        <ErrorText message="Could not load categories. Go back and try again." />
      )}
      {keys.map((key) => {
        const mapping = draft.categories[key];
        const value = mapping?.shouldCreate ? 'create' : (mapping?.id ?? '');
        return (
          <ImportCard key={key}>
            <TextLine strong>{key}</TextLine>
            <TextLine>{`${counts[key] ?? 0} rows from CSV`}</TextLine>
            <ChoiceField
              label="Map to category"
              value={value}
              options={options}
              onChange={(selected) => {
                const category = categories.find(
                  (item) => item.id === selected,
                );
                let mapped: CategoryMapping | null = null;
                if (selected === 'create') {
                  mapped = { name: key, shouldCreate: true };
                } else if (category) {
                  mapped = {
                    id: category.id,
                    name: category.name,
                    shouldCreate: false,
                  };
                }
                updateDraft((current) => {
                  const nextCategories = Object.assign(
                    Object.create(null) as Record<
                      string,
                      CategoryMapping | null
                    >,
                    current.categories,
                  );
                  nextCategories[key] = mapped;
                  return { ...current, categories: nextCategories };
                });
              }}
            />
          </ImportCard>
        );
      })}
      <Notice>
        Rows without a category will stay uncategorised. You can edit them
        later.
      </Notice>
    </FlowScreen>
  );
}

export function PreviewImportScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { draft, setDraft } = useImportDraft();
  const client = useGualletClient();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const rows = useMemo(
    () =>
      draft?.rows.map((row, index) => ({
        row,
        rowNumber: index + 2,
        errors: rowErrors(draft, row),
      })) ?? [],
    [draft],
  );
  const prepared = useMemo(() => {
    if (!draft) return { request: null, error: null };
    try {
      const request = buildImportRequest(draft);
      validateImportRequestSize(request);
      return { request, error: null };
    } catch (cause) {
      return {
        request: null,
        error:
          cause instanceof Error ? cause.message : 'Could not review import.',
      };
    }
  }, [draft]);
  if (!draft) return <MissingDraft />;
  const valid = rows.filter((entry) => entry.errors.length === 0);
  const invalid = rows.length - valid.length;
  async function submit() {
    if (!prepared.request) return;
    try {
      setBusy(true);
      setError(null);
      const response = await client.dataImporter.importData(prepared.request);
      watchImportJob(response.jobId, userId);
      await queryClient.invalidateQueries();
      setDraft(null);
      router.dismissAll();
      router.replace({
        pathname: '/importer/csv/results/[jobId]',
        params: {
          jobId: response.jobId,
          fileName: draft!.fileName,
          submitted: String(valid.length),
          skipped: String(invalid),
        },
      });
    } catch (cause) {
      await queryClient.invalidateQueries();
      setError(
        cause instanceof Error ? cause.message : 'Could not start the import.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <FlowScreen
      step={5}
      navigationTitle="Review import"
      title="Check before importing"
      description="Here’s how your transactions will appear. Nothing has been imported yet."
      action={`Import ${valid.length} valid rows`}
      onAction={() => void submit()}
      onBack={() => router.back()}
      disabled={!prepared.request}
      busy={busy}
    >
      <ImportCard>
        <TextLine
          strong
        >{`${rows.length} rows found · ${valid.length} ready · ${invalid} need attention`}</TextLine>
      </ImportCard>
      {invalid > 0 && (
        <Notice
          warning
        >{`${invalid} rows have invalid data. Fix the CSV or import the valid rows.`}</Notice>
      )}
      {invalid > 0 && (
        <ImportCard>
          <TextLine strong>Rows needing attention</TextLine>
          {rows
            .filter((entry) => entry.errors.length > 0)
            .slice(0, 20)
            .map((entry) => (
              <TextLine
                key={entry.rowNumber}
              >{`CSV row ${entry.rowNumber}: ${entry.errors.join(', ')}`}</TextLine>
            ))}
          {invalid > 20 && (
            <TextLine>{`Showing 20 of ${invalid} affected rows`}</TextLine>
          )}
        </ImportCard>
      )}
      <ErrorText message={prepared.error ?? error} />
      <ImportCard>
        <TextLine strong>Sample transactions</TextLine>
        {rows.slice(0, 10).map(({ row, rowNumber, errors }) => {
          const description = String(
            row[draft.fields.description] ?? 'Unnamed transaction',
          );
          const amount = String(row[draft.fields.amount] ?? '');
          const date = String(row[draft.fields.date] ?? '');
          return (
            <View key={rowNumber} style={styles.previewRow}>
              <View style={styles.previewDescription}>
                <TextLine strong>{description}</TextLine>
                <TextLine>{errors.length ? errors.join(', ') : date}</TextLine>
              </View>
              <PreviewAmount value={amount} />
            </View>
          );
        })}
        <TextLine>{`Showing ${Math.min(10, rows.length)} of ${rows.length} rows`}</TextLine>
      </ImportCard>
      <ImportCard>
        <TextLine strong>Destination accounts</TextLine>
        {Object.entries(draft.accounts).map(([key, mapping]) => {
          const target = mapping.shouldCreate
            ? `Create ${mapping.name}`
            : mapping.name;
          return <TextLine key={key}>{`${key}: ${target}`}</TextLine>;
        })}
      </ImportCard>
    </FlowScreen>
  );
}

export function ImportResultsScreen({
  jobId,
  fileName,
  submitted,
  skipped,
}: Readonly<{
  jobId: string;
  fileName?: string;
  submitted?: string;
  skipped?: string;
}>) {
  const router = useRouter();
  const { userId } = useAuth();
  const client = useGualletClient();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<DataImportStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStatusUnavailable, setIsStatusUnavailable] = useState(false);
  useEffect(() => {
    watchImportJob(jobId, userId);
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let invalidatedAfterError = false;
    async function refresh() {
      try {
        const result = await client.dataImporter.getStatus(jobId);
        if (!live) return;
        invalidatedAfterError = false;
        setIsStatusUnavailable(false);
        setStatus(result);
        setError(null);
        if (result.status === 'completed' || result.status === 'failed') {
          await queryClient.invalidateQueries();
        } else {
          timer = setTimeout(() => void refresh(), 2000);
        }
      } catch (cause) {
        if (!live) return;
        if (isPermanentImportStatusError(cause)) {
          setIsStatusUnavailable(true);
          setError(
            'This import status is no longer available. Check your transactions.',
          );
          await queryClient.invalidateQueries();
          return;
        }
        setError('Could not check this import. Retrying…');
        timer = setTimeout(() => void refresh(), 2000);
        if (!invalidatedAfterError) {
          invalidatedAfterError = true;
          await queryClient.invalidateQueries();
        }
      }
    }
    void refresh();
    return () => {
      live = false;
      if (timer) clearTimeout(timer);
    };
  }, [client, jobId, queryClient, userId]);
  const { title, description } = getImportResultCopy(
    status,
    isStatusUnavailable,
  );
  return (
    <FlowScreen
      navigationTitle="Import status"
      title={title}
      description={description}
      action="Go to transactions"
      onAction={() => router.replace('/(tabs)/transactions')}
      onBack={() => router.replace('/(tabs)/settings')}
    >
      <ErrorText message={error} />
      {!isStatusUnavailable &&
        (status?.status === 'queued' ||
          status?.status === 'running' ||
          !status) && (
          <ImportCard>
            <TextLine strong>Processing transactions</TextLine>
            <TextLine>
              {status?.status === 'queued'
                ? 'Waiting to start'
                : `${status?.progress ?? 0}% complete`}
            </TextLine>
            <ActivityIndicator accessibilityLabel="Import in progress" />
          </ImportCard>
        )}
      <ImportCard>
        <TextLine strong>{fileName ?? 'CSV import'}</TextLine>
        <TextLine>{`${submitted ?? '—'} valid rows submitted · ${skipped ?? '0'} skipped during validation`}</TextLine>
        {status?.status === 'completed' && (
          <TextLine>{`${status.processedCount} imported · ${status.failedCount} failed`}</TextLine>
        )}
      </ImportCard>
      {!isStatusUnavailable &&
        status?.status !== 'completed' &&
        status?.status !== 'failed' && (
          <Notice>We’ll send you an email when processing finishes.</Notice>
        )}
    </FlowScreen>
  );
}

function MissingDraft() {
  const router = useRouter();
  return (
    <FlowScreen
      navigationTitle="Import transactions"
      title="Start a new import"
      description="Choose a CSV file to continue."
      action="Choose a file"
      onAction={() => router.replace('/importer/csv')}
      onBack={() => router.back()}
    >
      <Notice>Your previous import draft is no longer available.</Notice>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  filePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    minHeight: 135,
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  previewDescription: { flex: 1 },
});
