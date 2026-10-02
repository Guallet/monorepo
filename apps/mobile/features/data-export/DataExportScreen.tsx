import { useAccounts, useDataExportMutation } from '@guallet/api-react';
import {
  Button,
  DateRangePicker,
  type DateRange,
  useTheme,
} from '@guallet/luna-mobile';
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronRightIcon,
  MailIcon,
} from '@guallet/luna-mobile/icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { ExportAccountsSheet } from './ExportAccountsSheet';
import { submitExportRequest, type ExportFormat } from './exportRequest';
import { useTranslation } from 'react-i18next';
import { getCurrentAppLocale } from '@/i18n/i18n';

const formats: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'csv', label: 'CSV', description: 'Spreadsheet' },
  { value: 'json', label: 'JSON', description: 'Full data' },
  { value: 'ofe', label: 'OFE', description: 'Finance software' },
];

type Phase = 'form' | 'accepted' | 'failed';

export default function DataExportScreen() {
  const { t } = useTranslation();
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
  const [accountsVisible, setAccountsVisible] = useState(false);

  const accountSummary = accountIds.length
    ? accounts
        .filter((account) => accountIds.includes(account.id))
        .map((account) => account.name)
        .join(', ') || `${accountIds.length} accounts`
    : 'All accounts';
  const dateSummary = dateRange
    ? `${formatDate(dateRange.startDate)} – ${formatDate(dateRange.endDate)}`
    : 'All dates';

  async function submit() {
    if (exportMutation.isPending) return;
    setErrorMessage('');
    const result = await submitExportRequest(exportMutation.mutateAsync, {
      accountIds,
      dateRange,
      format,
    });
    if (result.status === 'accepted') {
      setPhase('accepted');
      AccessibilityInfo.announceForAccessibility(
        'Export started. We will email your file when it is ready.',
      );
      return;
    }
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
      <AppScreen headerTitle={t('copy_z2z7tl')}>
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
                <Text style={[styles.sectionLabel, labelStyle]}>
                  {t('copy_140ft79')}
                </Text>
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
                      {t('copy_4a4qjr')}
                    </Text>
                    <Text
                      style={{
                        color: colors.text.secondary,
                        fontSize: typography.sizes.sm,
                        marginTop: spacing.xs,
                      }}
                    >
                      {t('copy_1nx49pr')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View>
              <Text style={[styles.sectionLabel, labelStyle]}>
                {t('copy_lps637')}
              </Text>
              <View style={[styles.card, cardStyle]}>
                <SummaryRow label={t('copy_dpi1wd')} value={accountSummary} />
                <SummaryRow label={t('copy_a96p5c')} value={dateSummary} />
                <SummaryRow
                  label={t('copy_1yy1302')}
                  value={format.toUpperCase()}
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
                {t('copy_1ddiq1j')}
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
              <Button onClick={() => router.back()}>{t('copy_l8hqi2')}</Button>
            ) : (
              <>
                <Button
                  disabled={exportMutation.isPending}
                  onClick={() => void submit()}
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
                  {t('copy_11x3x6v')}
                </Button>
              </>
            )}
          </View>
        </SafeAreaView>
      </AppScreen>
    );
  }

  return (
    <AppScreen headerTitle={t('copy_z2z7tl')}>
      <SafeAreaView edges={['bottom']} style={styles.screen}>
        <ScrollView
          contentContainerStyle={{
            padding: spacing.md,
            paddingBottom: spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            accessibilityRole="header"
            style={[
              styles.pageTitle,
              { color: colors.text.primary, fontSize: typography.sizes.xxl },
            ]}
          >
            {t('copy_z2z7tl')}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              marginTop: spacing.xs,
            }}
          >
            {t('copy_1bwiqtd')}
          </Text>

          <View style={{ marginTop: spacing.lg }}>
            <Text style={[styles.sectionLabel, labelStyle]}>
              {t('copy_ps5id9')}
            </Text>
            {accountsLoading && (
              <View style={styles.inlineStatus}>
                <ActivityIndicator color={colors.accent.primary} />
                <Text
                  style={{
                    color: colors.text.secondary,
                    marginLeft: spacing.sm,
                  }}
                >
                  {t('copy_9excwh')}
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
                  {t('copy_1xl8ts6')}
                </Text>
                <Button onClick={() => void refetch()} variant="outline">
                  {t('copy_cy7hny')}
                </Button>
              </View>
            )}
            {!accountsLoading && !isError && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Accounts, {{summary}}', {
                  summary: accountSummary,
                })}
                accessibilityHint={t('copy_k7jbu3')}
                onPress={() => setAccountsVisible(true)}
                style={[
                  styles.accountTrigger,
                  cardStyle,
                  { paddingHorizontal: spacing.md },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.flex,
                    {
                      color: colors.text.primary,
                      fontSize: typography.sizes.md,
                    },
                  ]}
                >
                  {accountSummary}
                </Text>
                <ChevronRightIcon size={20} color={colors.text.secondary} />
              </Pressable>
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
                  {t('copy_1xo4af1')}
                </Text>
              </Pressable>
            )}
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Text style={[styles.sectionLabel, labelStyle]}>
              {t('copy_f5jcuo')}
            </Text>
            {!dateRange && (
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                  marginBottom: spacing.sm,
                }}
              >
                {t('copy_ry0hlt')}
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
                  {t('copy_2hw7vi')}
                </Text>
              </Pressable>
            )}
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Text style={[styles.sectionLabel, labelStyle]}>
              {t('copy_sktuye')}
            </Text>
            <View style={[styles.card, cardStyle]}>
              {formats.map((option, index) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityLabel={t('{{label}}, {{description}}', {
                    label: option.label,
                    description: option.description,
                  })}
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
                    {option.label}
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
            {t('copy_92qgk9')}
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
        <ExportAccountsSheet
          accounts={accounts}
          onApply={(ids) => {
            setAccountIds(ids);
            setAccountsVisible(false);
          }}
          onDismiss={() => setAccountsVisible(false)}
          selectedIds={accountIds}
          visible={accountsVisible}
        />
      </SafeAreaView>
    </AppScreen>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(getCurrentAppLocale(), {
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
  accountTrigger: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
  },
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
