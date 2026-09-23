import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AccountDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-mobile';
import { formatAccountCurrency } from '../models/account';

export function AccountsSummary({
  accounts,
}: Readonly<{ accounts: AccountDto[] }>) {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const summary = useMemo(() => {
    const totals = new Map<
      string,
      { total: number; assets: number; liabilities: number }
    >();
    for (const account of accounts) {
      const current = totals.get(account.currency) ?? {
        total: 0,
        assets: 0,
        liabilities: 0,
      };
      const amount = Number(account.balance.amount);
      current.total += amount;
      if (amount >= 0) current.assets += amount;
      else current.liabilities += Math.abs(amount);
      totals.set(account.currency, current);
    }
    return [...totals.entries()];
  }, [accounts]);

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
          styles.eyebrow,
          {
            color: colors.button.onPrimaryMuted.default,
            fontSize: typography.sizes.xs,
          },
        ]}
      >
        NET WORTH
      </Text>
      <View style={[styles.totalList, { gap: spacing.xs }]}>
        {summary.map(([currency, values]) => (
          <Text
            key={currency}
            style={[
              styles.total,
              {
                color:
                  values.total < 0
                    ? colors.status.error
                    : colors.button.onPrimary.default,
                fontSize:
                  summary.length > 1
                    ? typography.sizes.xl
                    : typography.sizes.xxl,
              },
            ]}
          >
            {formatAccountCurrency(values.total, currency)}
          </Text>
        ))}
      </View>
      <Text
        style={[
          styles.caption,
          {
            color: colors.button.onPrimaryMuted.default,
            fontSize: typography.sizes.xs,
          },
        ]}
      >
        {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} ·{' '}
        {summary.length} {summary.length === 1 ? 'currency' : 'currencies'}
      </Text>
      <View style={[styles.breakdown, { gap: spacing.sm }]}>
        {summary.map(([currency, values]) => (
          <View key={currency} style={styles.breakdownRow}>
            <Text
              style={[
                styles.breakdownCurrency,
                { color: colors.button.onPrimaryMuted.default },
              ]}
            >
              {currency}
            </Text>
            <Text
              style={[
                styles.breakdownValue,
                { color: colors.button.onPrimary.default },
              ]}
            >
              Assets {formatAccountCurrency(values.assets, currency)}
            </Text>
            <Text
              style={[
                styles.breakdownValue,
                { color: colors.button.onPrimary.default },
              ]}
            >
              Liabilities {formatAccountCurrency(values.liabilities, currency)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 4,
  },
  eyebrow: {
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  totalList: {
    marginTop: 2,
  },
  total: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  caption: {
    marginTop: 2,
  },
  breakdown: {
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'column',
    marginTop: 14,
    paddingTop: 12,
  },
  breakdownRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  breakdownCurrency: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    width: 34,
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginTop: 2,
    textAlign: 'right',
  },
});
