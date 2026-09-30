import { useEffect, useState } from 'react';
import {
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { TextInput, useTheme } from '@guallet/luna-mobile';
import { ChevronLeftIcon } from '@guallet/luna-mobile/icons';
import {
  calculateLoanSchedule,
  type LoanPaymentRow,
  type LoanScenarioResult,
} from '@guallet/money';
import {
  DEFAULT_LOAN_A,
  DEFAULT_LOAN_B,
  parseLoanInput,
  type LoanField,
  type LoanInput,
} from './loanInput';

type Mode = 'calculator' | 'compare' | 'schedule';
type Side = 'a' | 'b';

function money(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function Card({ children }: Readonly<{ children: React.ReactNode }>) {
  const { colors, spacing, borderRadius } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          marginBottom: spacing.md,
        },
      ]}
    >
      {children}
    </View>
  );
}

function SectionTitle({ children }: Readonly<{ children: React.ReactNode }>) {
  const { colors, typography, spacing } = useTheme();
  return (
    <Text
      style={{
        color: colors.text.primary,
        fontSize: typography.sizes.md,
        fontWeight: '700',
        marginBottom: spacing.sm,
      }}
    >
      {children}
    </Text>
  );
}

function MetricRow({
  label,
  value,
  emphasized = false,
}: Readonly<{ label: string; value: string; emphasized?: boolean }>) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View
      style={[
        styles.metricRow,
        {
          borderBottomColor: colors.surface.border.primary,
          paddingVertical: spacing.sm,
        },
      ]}
    >
      <Text
        style={{ color: colors.text.secondary, fontSize: typography.sizes.sm }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: emphasized ? colors.support.dark : colors.text.primary,
          fontSize: typography.sizes.sm,
          fontVariant: ['tabular-nums'],
          fontWeight: '700',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Segment({
  options,
  value,
  onChange,
}: Readonly<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}>) {
  const { colors, spacing, borderRadius, typography } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.segment,
        {
          backgroundColor: colors.surface.background.secondary,
          borderRadius: borderRadius.md,
          padding: spacing.xs,
          marginBottom: spacing.md,
        },
      ]}
    >
      {options.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="tab"
          accessibilityLabel={option.label}
          accessibilityState={{ selected: value === option.value }}
          onPress={() => onChange(option.value)}
          style={[
            styles.segmentButton,
            { borderRadius: borderRadius.md, paddingVertical: spacing.sm },
            value === option.value && {
              backgroundColor: colors.surface.background.primary,
            },
          ]}
        >
          <Text
            style={{
              color:
                value === option.value
                  ? colors.accent.primary
                  : colors.text.secondary,
              fontSize: typography.sizes.sm,
              fontWeight: '600',
            }}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function LoanFields({
  input,
  onChange,
  title,
  currency,
}: Readonly<{
  input: LoanInput;
  onChange: (field: LoanField, text: string) => void;
  title: string;
  currency: string;
}>) {
  const { colors, typography } = useTheme();
  const { errors } = parseLoanInput(input);
  const fields: {
    key: LoanField;
    label: string;
    suffix: string;
    description?: string;
  }[] = [
    { key: 'amount', label: 'Loan amount', suffix: currency },
    { key: 'annualInterestRate', label: 'Annual interest rate', suffix: '%' },
    { key: 'termMonths', label: 'Term (months)', suffix: '' },
    {
      key: 'arrangementFee',
      label: 'Arrangement fee',
      suffix: currency,
      description: 'One-off fee paid upfront',
    },
  ];
  return (
    <Card>
      <SectionTitle>{title}</SectionTitle>
      {fields.map(({ key, label, suffix, description }) => (
        <TextInput
          key={key}
          accessibilityLabel={label}
          accessibilityHint={errors[key] ?? description}
          keyboardType={key === 'termMonths' ? 'number-pad' : 'decimal-pad'}
          label={label}
          description={description}
          error={errors[key]}
          value={input[key]}
          onChangeText={(text) => onChange(key, text)}
          rightSection={
            suffix ? (
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                }}
              >
                {suffix}
              </Text>
            ) : undefined
          }
        />
      ))}
    </Card>
  );
}

function ScheduleRow({
  row,
  currency,
}: Readonly<{ row: LoanPaymentRow; currency: string }>) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={[
        styles.scheduleRow,
        {
          borderBottomColor: colors.surface.border.primary,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <View style={styles.metricRow}>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            fontWeight: '700',
          }}
        >
          Month {row.monthNumber}
        </Text>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
          }}
        >
          {money(row.payment, currency)}
        </Text>
      </View>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.sizes.sm,
          marginTop: spacing.xs,
        }}
      >
        Principal {money(row.principalPaid, currency)} · Interest{' '}
        {money(row.interestPaid, currency)}
      </Text>
      <View style={[styles.metricRow, { marginTop: spacing.xs }]}>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
          }}
        >
          Balance after payment
        </Text>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.sm,
            fontVariant: ['tabular-nums'],
          }}
        >
          {money(row.remainingBalance, currency)}
        </Text>
      </View>
    </View>
  );
}

function Comparison({
  a,
  b,
  currency,
}: Readonly<{
  a: LoanScenarioResult;
  b: LoanScenarioResult;
  currency: string;
}>) {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const difference = Math.abs(a.summary.totalCost - b.summary.totalCost);
  let verdict = 'Both loans cost the same overall';
  if (a.summary.totalCost < b.summary.totalCost)
    verdict = `Loan A costs ${money(difference, currency)} less overall`;
  if (b.summary.totalCost < a.summary.totalCost)
    verdict = `Loan B costs ${money(difference, currency)} less overall`;
  const metrics = [
    ['Monthly payment', a.summary.monthlyPayment, b.summary.monthlyPayment],
    ['Total interest', a.summary.totalInterest, b.summary.totalInterest],
    ['Total repayable', a.summary.totalPaid, b.summary.totalPaid],
    ['Total cost incl. fee', a.summary.totalCost, b.summary.totalCost],
  ] as const;
  return (
    <>
      <View
        style={[
          styles.verdict,
          {
            backgroundColor: colors.surface.background.input,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
          },
        ]}
      >
        <Text
          style={{
            color: colors.support.dark,
            fontSize: typography.sizes.md,
            fontWeight: '700',
          }}
        >
          {verdict}
        </Text>
      </View>
      <Card>
        <SectionTitle>Compare results</SectionTitle>
        <View style={styles.comparisonRow}>
          <Text style={styles.compareValue}>Loan A</Text>
          <Text style={styles.compareLabel}>Metric</Text>
          <Text style={[styles.compareValue, styles.alignRight]}>Loan B</Text>
        </View>
        {metrics.map(([label, valueA, valueB]) => (
          <View
            key={label}
            style={[
              styles.comparisonRow,
              {
                borderTopColor: colors.surface.border.primary,
                borderTopWidth: 1,
                paddingVertical: spacing.md,
              },
            ]}
          >
            <Text
              style={[
                styles.compareValue,
                {
                  color:
                    valueA < valueB ? colors.support.dark : colors.text.primary,
                  fontVariant: ['tabular-nums'],
                },
              ]}
            >
              {money(valueA, currency)}
            </Text>
            <Text
              style={[styles.compareLabel, { color: colors.text.secondary }]}
            >
              {label}
            </Text>
            <Text
              style={[
                styles.compareValue,
                styles.alignRight,
                {
                  color:
                    valueB < valueA ? colors.support.dark : colors.text.primary,
                  fontVariant: ['tabular-nums'],
                },
              ]}
            >
              {money(valueB, currency)}
            </Text>
          </View>
        ))}
        <View
          style={[
            styles.comparisonRow,
            {
              borderTopColor: colors.surface.border.primary,
              borderTopWidth: 1,
              paddingTop: spacing.md,
            },
          ]}
        >
          <Text style={[styles.compareValue, { color: colors.text.primary }]}>
            {a.summary.payoffMonths} mo
          </Text>
          <Text style={[styles.compareLabel, { color: colors.text.secondary }]}>
            Term
          </Text>
          <Text
            style={[
              styles.compareValue,
              styles.alignRight,
              { color: colors.text.primary },
            ]}
          >
            {b.summary.payoffMonths} mo
          </Text>
        </View>
      </Card>
    </>
  );
}

export default function LoanCalculatorScreen() {
  const { colors, spacing, typography } = useTheme();
  const { defaultCurrency } = useMobileUserPreferences();
  const [loanA, setLoanA] = useState<LoanInput>(DEFAULT_LOAN_A);
  const [loanB, setLoanB] = useState<LoanInput>(DEFAULT_LOAN_B);
  const [mode, setMode] = useState<Mode>('calculator');
  const [returnMode, setReturnMode] = useState<'calculator' | 'compare'>(
    'calculator',
  );
  const [editing, setEditing] = useState<Side>('a');
  const [scheduleSide, setScheduleSide] = useState<Side>('a');
  const parsedA = parseLoanInput(loanA);
  const parsedB = parseLoanInput(loanB);
  let resultA: LoanScenarioResult | null = null;
  let resultB: LoanScenarioResult | null = null;
  if (parsedA.values) resultA = calculateLoanSchedule(parsedA.values);
  if (parsedB.values) resultB = calculateLoanSchedule(parsedB.values);
  let scheduleResult = resultA;
  if (scheduleSide === 'b') scheduleResult = resultB;
  const currency = defaultCurrency || 'GBP';
  let keyboardBehavior: 'padding' | undefined;
  if (Platform.OS === 'ios') keyboardBehavior = 'padding';

  useEffect(() => {
    if (mode !== 'schedule') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      setMode(returnMode);
      return true;
    });
    return () => listener.remove();
  }, [mode, returnMode]);

  function openSchedule(side: Side) {
    setScheduleSide(side);
    if (mode === 'compare') setReturnMode('compare');
    else setReturnMode('calculator');
    setMode('schedule');
  }

  function changeA(field: LoanField, text: string) {
    setLoanA((current) => ({ ...current, [field]: text }));
  }
  function changeB(field: LoanField, text: string) {
    setLoanB((current) => ({ ...current, [field]: text }));
  }

  if (mode === 'schedule') {
    return (
      <AppScreen
        headerTitle="Monthly schedule"
        headerOptions={{
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to loan calculator"
              hitSlop={12}
              onPress={() => setMode(returnMode)}
            >
              <ChevronLeftIcon size={24} color={colors.text.primary} />
            </Pressable>
          ),
        }}
      >
        <FlatList
          data={scheduleResult?.schedule ?? []}
          keyExtractor={(row) => String(row.monthNumber)}
          contentContainerStyle={{ padding: spacing.md }}
          ListHeaderComponent={
            <>
              <Segment
                options={[
                  { value: 'a', label: 'Loan A' },
                  { value: 'b', label: 'Loan B' },
                ]}
                value={scheduleSide}
                onChange={(value) => setScheduleSide(value as Side)}
              />
              {scheduleResult && (
                <Card>
                  <SectionTitle>Repayment totals</SectionTitle>
                  <MetricRow
                    label="Monthly payment"
                    value={money(
                      scheduleResult.summary.monthlyPayment,
                      currency,
                    )}
                  />
                  <MetricRow
                    label="Total interest"
                    value={money(
                      scheduleResult.summary.totalInterest,
                      currency,
                    )}
                  />
                  <MetricRow
                    label="Total repayable"
                    value={money(scheduleResult.summary.totalPaid, currency)}
                  />
                  <MetricRow
                    label="Total cost incl. fee"
                    value={money(scheduleResult.summary.totalCost, currency)}
                    emphasized
                  />
                </Card>
              )}
              <SectionTitle>Monthly payments</SectionTitle>
            </>
          }
          ListEmptyComponent={
            <Text
              accessibilityRole="alert"
              style={{ color: colors.text.secondary }}
            >
              Enter valid loan details to see the schedule.
            </Text>
          }
          renderItem={({ item }) => (
            <ScheduleRow row={item} currency={currency} />
          )}
        />
      </AppScreen>
    );
  }

  let activeInput = loanA;
  let activeChange = changeA;
  let activeTitle = 'Loan A';
  if (editing === 'b') {
    activeInput = loanB;
    activeChange = changeB;
    activeTitle = 'Loan B';
  }

  return (
    <AppScreen headerTitle="Loan calculator">
      <KeyboardAvoidingView behavior={keyboardBehavior} style={styles.flex}>
        <ScrollView
          contentContainerStyle={{ padding: spacing.md }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Segment
            options={[
              { value: 'calculator', label: 'Calculator' },
              { value: 'compare', label: 'Compare' },
            ]}
            value={mode}
            onChange={(value) => setMode(value as Mode)}
          />
          {mode === 'calculator' && (
            <>
              {resultA && (
                <Card>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.sizes.sm,
                    }}
                  >
                    ESTIMATED MONTHLY PAYMENT
                  </Text>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.sizes.xxl,
                      fontWeight: '700',
                      fontVariant: ['tabular-nums'],
                      marginTop: spacing.xs,
                    }}
                  >
                    {money(resultA.summary.monthlyPayment, currency)}
                  </Text>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.sizes.sm,
                    }}
                  >
                    Based on {resultA.summary.payoffMonths} monthly payments
                  </Text>
                </Card>
              )}
              <LoanFields
                input={loanA}
                onChange={changeA}
                title="Your loan"
                currency={currency}
              />
              {resultA && (
                <Card>
                  <SectionTitle>Repayment totals</SectionTitle>
                  <MetricRow
                    label="Total interest"
                    value={money(resultA.summary.totalInterest, currency)}
                  />
                  <MetricRow
                    label="Total repayable"
                    value={money(resultA.summary.totalPaid, currency)}
                  />
                  <MetricRow
                    label="Total cost incl. fee"
                    value={money(resultA.summary.totalCost, currency)}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="View monthly schedule"
                    onPress={() => {
                      openSchedule('a');
                    }}
                    style={{ paddingVertical: spacing.md }}
                  >
                    <Text
                      style={{
                        color: colors.accent.primary,
                        fontSize: typography.sizes.sm,
                        fontWeight: '700',
                      }}
                    >
                      View monthly schedule →
                    </Text>
                  </Pressable>
                </Card>
              )}
              {!resultA && (
                <Text
                  accessibilityRole="alert"
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                  }}
                >
                  Results will appear when every field has a valid value.
                </Text>
              )}
            </>
          )}
          {mode === 'compare' && (
            <>
              {resultA && resultB && (
                <Comparison a={resultA} b={resultB} currency={currency} />
              )}
              {(!resultA || !resultB) && (
                <Text
                  accessibilityRole="alert"
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                    marginBottom: spacing.md,
                  }}
                >
                  Enter valid details for both loans to compare them.
                </Text>
              )}
              <Segment
                options={[
                  { value: 'a', label: 'Edit Loan A' },
                  { value: 'b', label: 'Edit Loan B' },
                ]}
                value={editing}
                onChange={(value) => setEditing(value as Side)}
              />
              <LoanFields
                input={activeInput}
                onChange={activeChange}
                title={activeTitle}
                currency={currency}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View ${activeTitle} monthly schedule`}
                onPress={() => {
                  openSchedule(editing);
                }}
                style={{ padding: spacing.md }}
              >
                <Text
                  style={{
                    color: colors.accent.primary,
                    fontSize: typography.sizes.sm,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  View {activeTitle} monthly schedule →
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderWidth: 1, elevation: 1 },
  metricRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  segment: { flexDirection: 'row' },
  segmentButton: {
    alignItems: 'center',
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  verdict: {},
  comparisonRow: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  compareValue: { flex: 1, fontSize: 12, fontWeight: '700' },
  compareLabel: { flex: 1, fontSize: 11, textAlign: 'center' },
  alignRight: { textAlign: 'right' },
  scheduleRow: { borderBottomWidth: 1 },
});
