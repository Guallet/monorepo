import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAccounts, useAccountCharts } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react-native';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface WealthCardProps {
  monthDelta?: number;
}

export function WealthCard({ monthDelta }: Readonly<WealthCardProps>) {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { accounts, isLoading } = useAccounts();

  const firstAccountId = accounts[0]?.id ?? '';
  const chartStartDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }, []);

  const { data: chartData } = useAccountCharts(
    firstAccountId,
    chartStartDate,
    new Date(),
  );

  const totalWealth = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance.amount, 0),
    [accounts],
  );

  const displayCurrency = accounts[0]?.currency ?? 'GBP';

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
          { borderRadius: borderRadius.lg, backgroundColor: colors.paleGrey },
        ]}
      />
    );
  }

  const isDeltaPositive = (monthDelta ?? 0) >= 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: 'rgba(255,255,255,0.75)', fontSize: typography.sizes.xs },
        ]}
      >
        TOTAL WEALTH
      </Text>

      <Text
        style={[
          styles.amount,
          { color: '#FFFFFF', fontSize: typography.sizes.xxl },
        ]}
      >
        {formatCurrency(totalWealth, displayCurrency)}
      </Text>

      {monthDelta !== undefined && (
        <Text
          style={[
            styles.delta,
            { color: 'rgba(255,255,255,0.85)', fontSize: typography.sizes.sm },
          ]}
        >
          {isDeltaPositive ? '↑' : '↓'} {isDeltaPositive ? '+' : ''}
          {formatCurrency(monthDelta, displayCurrency)} vs last month
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
                  ? '#FFFFFF'
                  : 'rgba(255,255,255,0.30)',
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
