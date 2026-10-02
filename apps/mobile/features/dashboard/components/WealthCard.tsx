import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAccounts, useAccountCharts } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { useDashboardDateRange } from '../hooks/useDashboardDateRange';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { getCurrentAppLocale } from '@/i18n/i18n';
import {
  groupBalancesByCurrency,
  type CurrencyAmount,
} from '../utils/currencyTotals';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(getCurrentAppLocale(), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface WealthCardProps {
  monthDeltas: CurrencyAmount[] | null;
}

export function WealthCard({ monthDeltas }: Readonly<WealthCardProps>) {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { defaultCurrency } = useMobileUserPreferences();
  const { accounts, isLoading } = useAccounts();

  const firstAccountId = accounts[0]?.id ?? '';
  const { startDate: chartStartDate, endDate: chartEndDate } =
    useDashboardDateRange({ yearsAgo: 1 });

  const { data: chartData } = useAccountCharts(
    firstAccountId,
    chartStartDate,
    chartEndDate,
  );

  const balances = useMemo(
    () => groupBalancesByCurrency(accounts, defaultCurrency),
    [accounts, defaultCurrency],
  );
  const singleCurrencyDelta =
    balances.length === 1 &&
    monthDeltas?.length === 1 &&
    balances[0].currency === monthDeltas[0].currency
      ? monthDeltas[0]
      : null;

  const sparklineBars = useMemo(() => {
    const raw = chartData?.chart ?? [];
    const months =
      raw.length > 0
        ? raw.slice(-12)
        : Array.from({ length: 12 }, (_, i) => ({
            total_in: i % 3 === 0 ? 500 : 300,
            total_out: 200 + i * 10,
          }));
    const values = months.map((m) => Math.abs(m.total_in - m.total_out));
    const maxVal = Math.max(...values, 1);
    return values.map((v, i) => ({
      ratio: Math.max(0.1, v / maxVal),
      isLast: i === values.length - 1,
    }));
  }, [chartData]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.skeleton,
          {
            borderRadius: borderRadius.lg,
            backgroundColor: colors.surface.background.secondary,
          },
        ]}
      />
    );
  }

  const isDeltaPositive = (singleCurrencyDelta?.amount ?? 0) >= 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.accent.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: colors.button.onPrimaryMuted.default,
            fontSize: typography.sizes.xs,
          },
        ]}
      >
        {balances.length === 1 ? 'TOTAL WEALTH' : 'BALANCES BY CURRENCY'}
      </Text>

      {balances.map(({ currency, amount }) => (
        <Text
          key={currency}
          style={[
            styles.amount,
            {
              color: colors.button.onPrimary.default,
              fontSize: typography.sizes.xxl,
            },
          ]}
        >
          {formatCurrency(amount, currency)}
        </Text>
      ))}

      {singleCurrencyDelta && (
        <Text
          style={[
            styles.delta,
            {
              color: colors.button.onPrimaryMuted.default,
              fontSize: typography.sizes.sm,
            },
          ]}
        >
          {isDeltaPositive ? '↑' : '↓'} {isDeltaPositive ? '+' : ''}
          {formatCurrency(
            singleCurrencyDelta.amount,
            singleCurrencyDelta.currency,
          )}
          {' net cashflow · 30D'}
        </Text>
      )}

      <View style={styles.sparkline}>
        {sparklineBars.map((bar, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: Math.max(4, bar.ratio * 36),
                backgroundColor: bar.isLast
                  ? colors.button.onPrimary.default
                  : colors.button.onPrimaryMuted.default,
                borderRadius: borderRadius.xs,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 180,
  },
  card: {
    gap: 4,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  amount: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  delta: {
    marginTop: 2,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginTop: 16,
    height: 36,
  },
  bar: {
    flex: 1,
  },
});
