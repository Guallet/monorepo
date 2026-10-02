import { useAccounts, useDataExportMutation } from '@guallet/api-react';
import {
  AccountInput,
  Button,
  DateRangePicker,
  type DateRange,
  useTheme,
} from '@guallet/luna-mobile';
import {
  AlertTriangleIcon,
  CheckIcon,
  MailIcon,
} from '@guallet/luna-mobile/icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppScreen } from '@/components/layout/AppScreen';
import {
  submitExportRequest,
  snapshotExportSelection,
  type ExportFormat,
  type ExportSelection,
} from './exportRequest';

const formatLabels: Record<ExportFormat, string> = {
  csv: 'CSV',
  json: 'JSON',
  ofe: 'OFX',
};

const formats: { value: ExportFormat; description: string }[] = [
  { value: 'csv', description: 'Spreadsheet' },
  { value: 'json', description: 'Full data' },
  { value: 'ofe', description: 'Finance software' },
];

type Phase = 'form' | 'accepted' | 'failed';

export default function DataExportScreen() {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const router = useRouter();
  const {
    accounts,
    isLoading: accountsLoading,
    isError,
    refetch,
  } = useAccounts();
  const exportMutation = useDataExportMutation();
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [phase, setPhase] = useState<Phase>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedSelection, setSubmittedSelection] =
    useState<ExportSelection | null>(null);
  const submittingRef = useRef(false);

  const displayedSelection =
    phase === 'form' || !submittedSelection
      ? { accountIds, dateRange, format }
      : submittedSelection;

  const accountSummary = displayedSelection.accountIds.length
    ? accounts
        .filter((account) => displayedSelection.accountIds.includes(account.id))
        .map((account) => account.name)
        .join(', ') || `${displayedSelection.accountIds.length} accounts`
    : 'All accounts';
  const dateSummary = displayedSelection.dateRange
    ? `${formatDate(displayedSelection.dateRange.startDate)} – ${formatDate(displayedSelection.dateRange.endDate)}`
    : 'All dates';

  async function submit(selection?: ExportSelection) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const requestSelection = snapshotExportSelection(
      selection ?? { accountIds, dateRange, format },
    );
    setSubmittedSelection(requestSelection);
    setErrorMessage('');
    const result = await submitExportRequest(
      exportMutation.mutateAsync,
      requestSelection,
    );
    if (result.status === 'accepted') {
      setPhase('accepted');
      AccessibilityInfo.announceForAccessibility(
        'Export started. We will email your file when it is ready.',
      );
      return;
    }
    submittingRef.current = false;
    setPhase('failed');
    const message =
      result.error instanceof Error &&
      result.error.message === 'Choose an end date on or after the start date.'
        ? result.error.message
        : 'Check your connection and try again. Your choices are saved.';
    setErrorMessage(message);
    AccessibilityInfo.announceForAccessibility(
      `Couldn’t start export. ${message}`,
    );
  }

  function editSelection() {
    if (submittedSelection) {
      setAccountIds([...submittedSelection.accountIds]);
      setDateRange(submittedSelection.dateRange);
      setFormat(submittedSelection.format);
    }
    exportMutation.reset();
    setPhase('form');
  }

  const cardStyle = {
    backgroundColor: colors.surface.background.primary,
    borderColor: colors.surface.border.primary,
    borderRadius: borderRadius.lg,
  };
  const labelStyle = {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    marginBottom: spacing.sm,
  };

  if (phase === 'accepted' || phase === 'failed') {
    const accepted = phase === 'accepted';
    return (
      <AppScreen headerTitle="Export data">
        <SafeAreaView edges={['bottom']} style={styles.screen}>
          <ScrollView
            contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}
          >
            <View
              accessibilityLiveRegion="polite"
              style={[styles.statusCard, cardStyle, { padding: spacing.lg }]}
            >
              <View
                style={[
                  styles.statusIcon,
                  {
                    backgroundColor: accepted
                      ? colors.surface.background.input
                      : colors.surface.background.error,
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                {accepted ? (
                  <CheckIcon size={30} color={colors.status.success} />
                ) : (
                  <AlertTriangleIcon size={30} color={colors.status.error} />
                )}
              </View>
              <Text
                accessibilityRole="header"
                style={[
                  styles.statusTitle,
                  {
                    color: colors.text.primary,
                    fontSize: typography.sizes.lg,
                    marginTop: spacing.md,
                  },
                ]}
              >
                {accepted ? 'Export started' : 'Couldn’t start export'}
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                  marginTop: spacing.sm,
                  textAlign: 'center',
                }}
              >
                {accepted
                  ? 'Your export is being processed in the background.'
                  : errorMessage}
              </Text>
            </View>

            {accepted && (
              <View>
                <Text style={[styles.sectionLabel, labelStyle]}>DELIVERY</Text>
                <View
                  style={[
                    styles.deliveryCard,
                    cardStyle,
                    { padding: spacing.md, gap: spacing.md },
                  ]}
                >
                  <MailIcon size={24} color={colors.accent.primary} />
                  <View style={styles.flex}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: typography.sizes.md,
                        fontWeight: '600',
                      }}
                    >
                      We’ll email your file
                    </Text>
                    <Text
                      style={{
                        color: colors.text.secondary,
                        fontSize: typography.sizes.sm,
                        marginTop: spacing.xs,
                      }}
                    >
                      Sent to the email on your account when ready
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View>
              <Text style={[styles.sectionLabel, labelStyle]}>
                YOUR REQUEST
              </Text>
              <View style={[styles.card, cardStyle]}>
                <SummaryRow label="Accounts" value={accountSummary} />
                <SummaryRow label="Date range" value={dateSummary} />
                <SummaryRow
                  label="Format"
                  value={formatLabels[displayedSelection.format]}
                  last
                />
              </View>
            </View>
            {accepted && (
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                }}
              >
                You can continue using Guallet while the export runs.
              </Text>
            )}
          </ScrollView>
          <View
            style={[
              styles.footer,
              {
                backgroundColor: colors.surface.background.primary,
                borderTopColor: colors.surface.border.primary,
                padding: spacing.md,
                gap: spacing.sm,
              },
            ]}
          >
            {accepted ? (
              <Button onClick={() => router.back()}>Got it</Button>
            ) : (
              <>
                <Button
                  disabled={exportMutation.isPending}
                  onClick={() => void submit(submittedSelection ?? undefined)}
                >
                  {exportMutation.isPending
                    ? 'Submitting export…'
                    : 'Try again'}
                </Button>
                <Button
                  disabled={exportMutation.isPending}
                  onClick={editSelection}
                  variant="outline"
                >
                  Edit selection
                </Button>
              </>
            )}
          </View>
        </SafeAreaView>
      </AppScreen>
    );
  }

  return (
    <AppScreen headerTitle="Export data">
      <SafeAreaView edges={['bottom']} style={styles.screen}>
        <ScrollView
          contentContainerStyle={{
            padding: spacing.md,
            paddingBottom: spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
          pointerEvents={exportMutation.isPending ? 'none' : 'auto'}
        >
          <Text
            accessibilityRole="header"
            style={[
              styles.pageTitle,
              { color: colors.text.primary, fontSize: typography.sizes.xxl },
            ]}
          >
            Export data
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              marginTop: spacing.xs,
            }}
          >
            Choose what to include. We’ll email the file to you when it’s ready.
          </Text>

          <View style={{ marginTop: spacing.lg }}>
            <Text style={[styles.sectionLabel, labelStyle]}>ACCOUNTS</Text>
            {accountsLoading && (
              <View style={styles.inlineStatus}>
                <ActivityIndicator color={colors.accent.primary} />
                <Text
                  style={{
                    color: colors.text.secondary,
                    marginLeft: spacing.sm,
                  }}
                >
                  Loading accounts…
                </Text>
              </View>
            )}
            {isError && (
              <View style={[styles.card, cardStyle, { padding: spacing.md }]}>
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                  }}
                >
                  Couldn’t load your accounts. You can still export all
                  accounts.
                </Text>
                <Button onClick={() => void refetch()} variant="outline">
                  Try loading accounts again
                </Button>
              </View>
            )}
            {!accountsLoading && !isError && (
              <AccountInput
                accounts={accounts}
                onConfirm={setAccountIds}
                placeholder="All accounts"
                selectionMode="multiple"
                style={cardStyle}
                value={accountIds}
              />
            )}
            {accountIds.length > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setAccountIds([])}
                style={{ paddingVertical: spacing.sm }}
              >
                <Text
                  style={{
                    color: colors.accent.primary,
                    fontSize: typography.sizes.sm,
                  }}
                >
                  Use all accounts
                </Text>
              </Pressable>
            )}
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Text style={[styles.sectionLabel, labelStyle]}>DATE RANGE</Text>
            {!dateRange && (
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                  marginBottom: spacing.sm,
                }}
              >
                All dates
              </Text>
            )}
            <DateRangePicker
              onApply={setDateRange}
              value={dateRange}
              style={cardStyle}
            />
            {dateRange && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setDateRange(null)}
                style={{ paddingVertical: spacing.sm }}
              >
                <Text
                  style={{
                    color: colors.accent.primary,
                    fontSize: typography.sizes.sm,
                  }}
                >
                  Use all dates
                </Text>
              </Pressable>
            )}
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Text style={[styles.sectionLabel, labelStyle]}>FILE FORMAT</Text>
            <View style={[styles.card, cardStyle]}>
              {formats.map((option, index) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityLabel={`${formatLabels[option.value]}, ${option.description}`}
                  accessibilityState={{ selected: format === option.value }}
                  onPress={() => setFormat(option.value)}
                  style={[
                    styles.formatRow,
                    {
                      borderBottomColor: colors.surface.border.primary,
                      borderBottomWidth:
                        index === formats.length - 1
                          ? 0
                          : StyleSheet.hairlineWidth,
                      paddingHorizontal: spacing.md,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.sizes.md,
                      fontWeight: '600',
                    }}
                  >
                    {formatLabels[option.value]}
                  </Text>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.sizes.sm,
                      marginLeft: spacing.sm,
                    }}
                  >
                    {option.description}
                  </Text>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor:
                          format === option.value
                            ? colors.accent.primary
                            : colors.surface.border.input,
                        borderWidth: format === option.value ? 5 : 1,
                      },
                    ]}
                  />
                </Pressable>
              ))}
            </View>
          </View>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.xs,
              marginTop: spacing.md,
            }}
          >
            Leave accounts and dates as All to export every transaction.
          </Text>
        </ScrollView>
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface.background.primary,
              borderTopColor: colors.surface.border.primary,
              padding: spacing.md,
            },
          ]}
        >
          <Button
            disabled={exportMutation.isPending}
            onClick={() => void submit()}
          >
            {exportMutation.isPending ? 'Submitting export…' : 'Create export'}
          </Button>
        </View>
      </SafeAreaView>
    </AppScreen>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function SummaryRow({
  label,
  value,
  last = false,
}: Readonly<{ label: string; value: string; last?: boolean }>) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={[
        styles.summaryRow,
        {
          borderBottomColor: colors.surface.border.primary,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          padding: spacing.md,
          gap: spacing.md,
        },
      ]}
    >
      <Text
        style={{ color: colors.text.primary, fontSize: typography.sizes.sm }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={2}
        style={[
          styles.summaryValue,
          { color: colors.text.secondary, fontSize: typography.sizes.sm },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  pageTitle: { fontWeight: '700' },
  sectionLabel: { fontWeight: '700', letterSpacing: 0.5 },
  card: { borderWidth: 1, overflow: 'hidden' },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
  flex: { flex: 1 },
  inlineStatus: { alignItems: 'center', flexDirection: 'row', minHeight: 56 },
  formatRow: { alignItems: 'center', flexDirection: 'row', minHeight: 58 },
  radio: { width: 22, height: 22, borderRadius: 11, marginLeft: 'auto' },
  statusCard: { alignItems: 'center', borderWidth: 1 },
  statusIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    width: 56,
  },
  statusTitle: { fontWeight: '700', textAlign: 'center' },
  deliveryCard: { alignItems: 'center', borderWidth: 1, flexDirection: 'row' },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  summaryValue: { flex: 1, textAlign: 'right' },
});
