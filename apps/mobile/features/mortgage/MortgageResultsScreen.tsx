import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Line, Polyline } from 'react-native-svg';
import { useTheme } from '@guallet/luna-mobile';
import {
  buildBalanceComparison,
  calculateMortgageScenario,
  type MortgageBalanceComparisonRow,
} from '@guallet/calculators';
import { AppScreen } from '@/components/layout/AppScreen';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import {
  mortgageInputFromParams,
  parseMortgageInput,
  type MortgageField,
} from './mortgageInput';
import {
  formatMortgageDuration,
  formatMortgageMoney,
  MortgageAction,
  MortgageCard,
  MortgageMetric,
} from './MortgageUi';

function BalanceChart({
  rows,
  principal,
  monthsSaved,
}: Readonly<{
  rows: MortgageBalanceComparisonRow[];
  principal: number;
  monthsSaved: number;
}>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const width = 300;
  const height = 145;
  const left = 8;
  const right = 292;
  const top = 8;
  const bottom = 124;
  const x = (index: number) =>
    left + (index / (rows.length - 1)) * (right - left);
  const y = (balance: number) =>
    bottom - (balance / principal) * (bottom - top);
  const points = (field: 'baseline' | 'repayment') =>
    rows.map((row, index) => `${x(index)},${y(row[field])}`).join(' ');
  return (
    <MortgageCard title="Balance over time">
      <View
        accessible
        accessibilityLabel={`Mortgage balance comparison: the overpayment plan pays off ${formatMortgageDuration(monthsSaved)} earlier than the baseline`}
      >
        <Svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          <Line
            x1={left}
            y1={bottom}
            x2={right}
            y2={bottom}
            stroke={colors.surface.border.primary}
          />
          <Polyline
            points={points('baseline')}
            fill="none"
            stroke={colors.accent.primary}
            strokeWidth={3}
          />
          <Polyline
            points={points('repayment')}
            fill="none"
            stroke={colors.support.primary}
            strokeWidth={3}
          />
        </Svg>
        <View style={[styles.chartLabels, { marginTop: spacing.xs }]}>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.xs,
            }}
          >
            Today
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.xs,
            }}
          >
            {rows.at(-1)?.period}
          </Text>
        </View>
        <View
          style={[styles.legend, { gap: spacing.md, marginTop: spacing.sm }]}
        >
          <View style={[styles.legendItem, { gap: spacing.xs }]}>
            <View
              style={{
                backgroundColor: colors.accent.primary,
                borderRadius: borderRadius.sm,
                height: spacing.sm,
                width: spacing.sm,
              }}
            />
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.xs,
              }}
            >
              Baseline
            </Text>
          </View>
          <View style={[styles.legendItem, { gap: spacing.xs }]}>
            <View
              style={{
                backgroundColor: colors.support.primary,
                borderRadius: borderRadius.sm,
                height: spacing.sm,
                width: spacing.sm,
              }}
            />
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.xs,
              }}
            >
              With overpayments
            </Text>
          </View>
        </View>
      </View>
    </MortgageCard>
  );
}

export default function MortgageResultsScreen() {
  const router = useRouter();
  const params =
    useLocalSearchParams<Partial<Record<MortgageField, string | string[]>>>();
  const input = mortgageInputFromParams(params);
  const parsed = parseMortgageInput(input);
  const { borderRadius, colors, spacing, typography } = useTheme();
  const { defaultCurrency } = useMobileUserPreferences();

  if (!parsed.values) {
    return (
      <AppScreen headerTitle="Repayment comparison">
        <View style={{ gap: spacing.md, padding: spacing.md }}>
          <Text
            accessibilityRole="alert"
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.md,
            }}
          >
            This comparison is unavailable. Check your mortgage details.
          </Text>
          <MortgageAction
            label="Back to calculator"
            onPress={() => router.back()}
          />
        </View>
      </AppScreen>
    );
  }

  const values = parsed.values;
  const baseline = calculateMortgageScenario(values, {
    monthlyOverpayment: 0,
    oneOffOverpayment: 0,
    oneOffOverpaymentMonth: null,
  });
  const plan = calculateMortgageScenario(values);
  const money = (value: number) => formatMortgageMoney(value, defaultCurrency);
  const monthsSaved = Math.max(
    0,
    baseline.summary.payoffMonths - plan.summary.payoffMonths,
  );
  const interestSaved = Math.max(
    0,
    baseline.summary.totalInterest - plan.summary.totalInterest,
  );
  const hasOverpayment =
    values.monthlyOverpayment > 0 || values.oneOffOverpayment > 0;
  const balanceRows = buildBalanceComparison(baseline, plan, values.principal);
  const loanToValue =
    values.propertyValue === null
      ? null
      : (values.principal / values.propertyValue) * 100;

  return (
    <AppScreen headerTitle="Repayment comparison">
      <ScrollView
        contentContainerStyle={{ gap: spacing.md, padding: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <View
          accessible
          accessibilityLabel={`Estimated interest saved ${money(interestSaved)}. Mortgage paid off ${formatMortgageDuration(monthsSaved)} earlier.`}
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
            Estimated interest saved
          </Text>
          <Text
            style={{
              color: colors.support.dark,
              fontSize: typography.sizes.xxl,
              fontVariant: ['tabular-nums'],
              fontWeight: '700',
            }}
          >
            {money(interestSaved)}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
            }}
          >
            Mortgage paid off {formatMortgageDuration(monthsSaved)} earlier
          </Text>
        </View>
        {!hasOverpayment && (
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
            }}
          >
            Add an overpayment to the calculator to compare savings.
          </Text>
        )}
        <MortgageCard title="Baseline vs overpayments">
          <MortgageMetric
            label="Scheduled monthly repayment"
            value={money(baseline.summary.scheduledMonthlyPayment)}
          />
          <MortgageMetric
            label="Extra each month"
            value={money(values.monthlyOverpayment)}
          />
          <MortgageMetric
            label="Time to repay"
            value={`${formatMortgageDuration(baseline.summary.payoffMonths)} → ${formatMortgageDuration(plan.summary.payoffMonths)}`}
          />
          <MortgageMetric
            label="Total interest"
            value={`${money(baseline.summary.totalInterest)} → ${money(plan.summary.totalInterest)}`}
          />
          <MortgageMetric
            label="Total paid"
            value={`${money(baseline.summary.totalPaid)} → ${money(plan.summary.totalPaid)}`}
          />
          <MortgageMetric label="Principal" value={money(values.principal)} />
          {values.propertyValue !== null && (
            <>
              <MortgageMetric
                label="Estimated equity"
                value={money(values.propertyValue - values.principal)}
                negative={values.propertyValue < values.principal}
              />
              <MortgageMetric
                label="Loan-to-value"
                value={`${loanToValue?.toFixed(1)}%`}
              />
            </>
          )}
        </MortgageCard>
        <BalanceChart
          rows={balanceRows}
          principal={values.principal}
          monthsSaved={monthsSaved}
        />
        <MortgageAction
          label="Annual breakdown and monthly schedule"
          onPress={() =>
            router.push({ pathname: '/tools/mortgage/schedule', params: input })
          }
          subtle
        />
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
          }}
        >
          Illustrative estimate. Assumes a constant rate and excludes fees and
          early repayment charges.
        </Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  legend: { flexDirection: 'row', flexWrap: 'wrap' },
  legendItem: { alignItems: 'center', flexDirection: 'row' },
});
