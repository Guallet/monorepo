import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, useTheme } from '@guallet/luna-mobile';
import { calculateMortgageScenario } from '@guallet/calculators';
import { AppScreen } from '@/components/layout/AppScreen';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import {
  DEFAULT_MORTGAGE_INPUT,
  parseMortgageInput,
  type MortgageField,
  type MortgageInput,
} from './mortgageInput';
import {
  formatMortgageDuration,
  formatMortgageMoney,
  MortgageAction,
  MortgageCard,
} from './MortgageUi';

const FIELDS: {
  field: MortgageField;
  label: string;
  description?: string;
  type: 'money' | 'rate' | 'years' | 'month';
}[] = [
  {
    field: 'propertyValue',
    label: 'Property value',
    description: 'Optional. Used to estimate equity and loan-to-value.',
    type: 'money',
  },
  { field: 'principal', label: 'Remaining balance', type: 'money' },
  { field: 'annualInterestRate', label: 'Annual interest rate', type: 'rate' },
  { field: 'termYears', label: 'Remaining term', type: 'years' },
  {
    field: 'monthlyOverpayment',
    label: 'Extra each month',
    type: 'money',
  },
  { field: 'oneOffOverpayment', label: 'One-off payment', type: 'money' },
  {
    field: 'oneOffOverpaymentMonth',
    label: 'One-off payment month',
    type: 'month',
  },
];

export default function MortgageCalculatorScreen() {
  const router = useRouter();
  const { borderRadius, colors, spacing, typography } = useTheme();
  const { defaultCurrency } = useMobileUserPreferences();
  const [input, setInput] = useState<MortgageInput>(DEFAULT_MORTGAGE_INPUT);
  const parsed = useMemo(() => parseMortgageInput(input), [input]);
  const scenarios = useMemo(() => {
    if (!parsed.values) return null;
    return {
      baseline: calculateMortgageScenario(parsed.values, {
        monthlyOverpayment: 0,
        oneOffOverpayment: 0,
        oneOffOverpaymentMonth: null,
      }),
      plan: calculateMortgageScenario(parsed.values),
    };
  }, [parsed.values]);
  const hasOverpayment =
    parsed.values !== null &&
    (parsed.values.monthlyOverpayment > 0 ||
      parsed.values.oneOffOverpayment > 0);
  const interestSaved = scenarios
    ? Math.max(
        0,
        scenarios.baseline.summary.totalInterest -
          scenarios.plan.summary.totalInterest,
      )
    : 0;
  const monthsSaved = scenarios
    ? Math.max(
        0,
        scenarios.baseline.summary.payoffMonths -
          scenarios.plan.summary.payoffMonths,
      )
    : 0;

  function updateInput(field: MortgageField, text: string) {
    setInput((current) => ({ ...current, [field]: text }));
  }

  function openResults() {
    if (!parsed.values) return;
    router.push({ pathname: '/tools/mortgage/results', params: input });
  }

  function renderField(field: (typeof FIELDS)[number]) {
    if (
      field.field === 'oneOffOverpaymentMonth' &&
      Number(input.oneOffOverpayment.replaceAll(',', '')) === 0
    ) {
      return null;
    }
    let suffix = defaultCurrency;
    if (field.type === 'rate') suffix = '%';
    if (field.type === 'years') suffix = 'years';
    if (field.type === 'month') suffix = '';
    return (
      <TextInput
        key={field.field}
        accessibilityLabel={field.label}
        accessibilityHint={parsed.errors[field.field] ?? field.description}
        label={field.label}
        description={field.description}
        error={parsed.errors[field.field]}
        keyboardType={
          field.type === 'years' || field.type === 'month'
            ? 'number-pad'
            : 'decimal-pad'
        }
        value={input[field.field]}
        onChangeText={(text) => updateInput(field.field, text)}
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
    );
  }

  return (
    <AppScreen headerTitle="Mortgage calculator">
      <ScrollView
        contentContainerStyle={{ gap: spacing.md, padding: spacing.md }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          accessible
          accessibilityLabel={
            scenarios
              ? `Scheduled monthly repayment ${formatMortgageMoney(scenarios.baseline.summary.scheduledMonthlyPayment, defaultCurrency)}`
              : 'Enter valid mortgage details to see an estimate'
          }
          style={{
            backgroundColor: colors.surface.background.secondary,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
          }}
        >
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
            }}
          >
            Scheduled monthly repayment
          </Text>
          <Text
            style={{
              color: colors.accent.primary,
              fontSize: typography.sizes.xxl,
              fontVariant: ['tabular-nums'],
              fontWeight: '700',
            }}
          >
            {scenarios
              ? formatMortgageMoney(
                  scenarios.baseline.summary.scheduledMonthlyPayment,
                  defaultCurrency,
                )
              : '—'}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.xs,
            }}
          >
            Based on your balance, interest rate and remaining term.
          </Text>
        </View>

        <MortgageCard title="Mortgage details">
          {FIELDS.slice(0, 4).map(renderField)}
        </MortgageCard>
        <MortgageCard title="Try an overpayment">
          {FIELDS.slice(4).map(renderField)}
        </MortgageCard>

        {hasOverpayment && scenarios && (
          <View
            accessible
            accessibilityLabel={`Potential savings ${formatMortgageMoney(interestSaved, defaultCurrency)}, paid off ${formatMortgageDuration(monthsSaved)} earlier`}
            style={[
              styles.savings,
              {
                backgroundColor: colors.surface.background.secondary,
                borderRadius: borderRadius.md,
                padding: spacing.md,
              },
            ]}
          >
            <Text
              style={{
                color: colors.support.dark,
                fontSize: typography.sizes.sm,
                fontWeight: '700',
              }}
            >
              Save {formatMortgageMoney(interestSaved, defaultCurrency)} in
              interest · {formatMortgageDuration(monthsSaved)} earlier
            </Text>
          </View>
        )}
        {!parsed.values && (
          <Text
            accessibilityRole="alert"
            style={{
              color: colors.status.error,
              fontSize: typography.sizes.sm,
            }}
          >
            Check the highlighted fields to calculate your mortgage.
          </Text>
        )}
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
          }}
        >
          Illustrative estimate. Assumes the same interest rate throughout the
          remaining term and excludes fees or early repayment charges.
        </Text>
        <MortgageAction
          disabled={!parsed.values}
          label="See repayment comparison"
          onPress={openResults}
        />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  savings: { alignItems: 'flex-start' },
});
