import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@guallet/luna-mobile';
import { Currency } from '@guallet/money';
import {
  buildYearlyBreakdown,
  calculateMortgageScenario,
  type MortgagePaymentRow,
  type MortgageYearlyBreakdownRow,
} from '@guallet/calculators';
import { AppScreen } from '@/components/layout/AppScreen';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import {
  mortgageInputFromParams,
  parseMortgageInput,
  type MortgageField,
} from './mortgageInput';
import {
  formatMortgageMoney,
  MortgageAction,
  MortgageCard,
  MortgageMetric,
} from './MortgageUi';

type ScheduleMode = 'yearly' | 'monthly';

function YearRow({
  row,
  currency,
}: Readonly<{ row: MortgageYearlyBreakdownRow; currency: string }>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const total = row.principal + row.interest + row.extra;
  const money = (value: number) => formatMortgageMoney(value, currency);
  return (
    <MortgageCard title={row.year.replace('Y', 'Year ')}>
      <View
        accessible
        accessibilityLabel={`${row.year}: principal ${money(row.principal)}, interest ${money(row.interest)}, extra ${money(row.extra)}, remaining balance ${money(row.remainingBalance)}`}
      >
        {total > 0 && (
          <View
            style={[
              styles.mixBar,
              {
                borderRadius: borderRadius.md,
                height: spacing.sm + spacing.xs,
                marginBottom: spacing.sm,
              },
            ]}
          >
            <View
              style={{
                backgroundColor: colors.accent.primary,
                flex: row.principal / total,
              }}
            />
            <View
              style={{
                backgroundColor: colors.status.error,
                flex: row.interest / total,
              }}
            />
            {row.extra > 0 && (
              <View
                style={{
                  backgroundColor: colors.support.primary,
                  flex: row.extra / total,
                }}
              />
            )}
          </View>
        )}
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
          }}
        >
          Principal {money(row.principal)} · Interest {money(row.interest)} ·
          Extra {money(row.extra)}
        </Text>
        <MortgageMetric
          label="Balance at year end"
          value={money(row.remainingBalance)}
        />
      </View>
    </MortgageCard>
  );
}

function MonthRow({
  row,
  currency,
}: Readonly<{ row: MortgagePaymentRow; currency: string }>) {
  const { colors, typography } = useTheme();
  const money = (value: number) => formatMortgageMoney(value, currency);
  return (
    <MortgageCard title={`Month ${row.monthNumber}`}>
      <View
        accessible
        accessibilityLabel={`Month ${row.monthNumber}: paid ${money(row.totalPaid)}, interest ${money(row.interestPaid)}, principal ${money(row.principalPaid)}, extra ${money(row.extraPaid)}, balance ${money(row.remainingBalance)}`}
      >
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
          }}
        >
          Paid {money(row.totalPaid)} · Interest {money(row.interestPaid)}
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
          }}
        >
          Principal {money(row.principalPaid)} · Extra {money(row.extraPaid)}
        </Text>
        <MortgageMetric
          label="Remaining balance"
          value={money(row.remainingBalance)}
        />
      </View>
    </MortgageCard>
  );
}

export default function MortgageScheduleScreen() {
  const router = useRouter();
  const params =
    useLocalSearchParams<Partial<Record<MortgageField, string | string[]>>>();
  const [mode, setMode] = useState<ScheduleMode>('yearly');
  const { borderRadius, colors, spacing, typography } = useTheme();
  const { defaultCurrency } = useMobileUserPreferences();
  const parsed = parseMortgageInput(
    mortgageInputFromParams(params),
    defaultCurrency,
  );

  if (!parsed.values) {
    return (
      <AppScreen headerTitle="Repayment schedule">
        <View style={{ gap: spacing.md, padding: spacing.md }}>
          <Text
            accessibilityRole="alert"
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.md,
            }}
          >
            This schedule is unavailable. Check your mortgage details.
          </Text>
          <MortgageAction
            label="Back to calculator"
            onPress={() => router.back()}
          />
        </View>
      </AppScreen>
    );
  }

  const currency = Currency.fromISOCode(defaultCurrency);
  const scenario = calculateMortgageScenario(
    parsed.values,
    undefined,
    currency,
  );
  const yearlyRows = buildYearlyBreakdown(scenario.schedule, currency);
  const data: (MortgageYearlyBreakdownRow | MortgagePaymentRow)[] =
    mode === 'yearly' ? yearlyRows : scenario.schedule;
  const money = (value: number) => formatMortgageMoney(value, defaultCurrency);

  return (
    <AppScreen headerTitle="Repayment schedule">
      <FlatList<MortgageYearlyBreakdownRow | MortgagePaymentRow>
        data={data}
        keyExtractor={(row) =>
          'year' in row ? row.year : String(row.monthNumber)
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: spacing.sm }}>
            {'year' in item && (
              <YearRow row={item} currency={defaultCurrency} />
            )}
            {'monthNumber' in item && (
              <MonthRow row={item} currency={defaultCurrency} />
            )}
          </View>
        )}
        contentContainerStyle={{ padding: spacing.md }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
            <MortgageCard title="Repayment plan">
              <MortgageMetric
                label="Scheduled monthly repayment"
                value={money(scenario.summary.scheduledMonthlyPayment)}
              />
              <MortgageMetric
                label="Total principal"
                value={money(parsed.values.principal)}
              />
              <MortgageMetric
                label="Total interest"
                value={money(scenario.summary.totalInterest)}
              />
              <MortgageMetric
                label="Total paid"
                value={money(scenario.summary.totalPaid)}
              />
            </MortgageCard>
            <View
              accessibilityRole="tablist"
              style={[
                styles.tabs,
                {
                  backgroundColor: colors.surface.background.secondary,
                  borderRadius: borderRadius.md,
                  padding: spacing.xs,
                },
              ]}
            >
              {(['yearly', 'monthly'] as const).map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="tab"
                  accessibilityLabel={
                    option === 'yearly'
                      ? 'Yearly breakdown'
                      : 'Monthly schedule'
                  }
                  accessibilityState={{ selected: mode === option }}
                  onPress={() => setMode(option)}
                  style={[
                    styles.tab,
                    {
                      borderRadius: borderRadius.md,
                      minHeight: spacing.xxl + spacing.xs,
                      padding: spacing.sm,
                    },
                    mode === option && {
                      backgroundColor: colors.surface.background.primary,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        mode === option
                          ? colors.accent.primary
                          : colors.text.secondary,
                      fontSize: typography.sizes.sm,
                      fontWeight: '700',
                    }}
                  >
                    {option === 'yearly'
                      ? 'Yearly breakdown'
                      : 'Monthly schedule'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.xs,
              }}
            >
              Payment mix: blue principal, red interest, green overpayment.
            </Text>
          </View>
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  mixBar: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  tabs: { flexDirection: 'row' },
  tab: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
