import type { MoneyFormatOptions } from '@guallet/money';
import { Money } from '@guallet/money';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/luna-mobile';
import type { StampDutyBandResult } from '@guallet/calculators';

export function formatStampDutyMoney(
  value: number,
  options?: MoneyFormatOptions,
): string {
  return Money.fromCurrencyCode({ amount: value, currencyCode: 'GBP' }).format({
    locale: 'en-GB',
    ...options,
  });
}

export function StampDutyBandRow({
  band,
}: Readonly<{ band: StampDutyBandResult }>) {
  const { colors, spacing, typography } = useTheme();
  const amount = formatStampDutyMoney(band.taxableAmount);
  const due = formatStampDutyMoney(band.taxDue);

  return (
    <View
      accessible
      accessibilityLabel={`${band.label}, ${amount} taxed at ${band.rate} percent, ${due} tax due`}
      style={[
        styles.row,
        {
          borderBottomColor: colors.surface.border.primary,
          gap: spacing.sm,
          paddingVertical: spacing.sm,
        },
        band.taxableAmount === 0 && styles.inactive,
      ]}
    >
      <View style={styles.description}>
        <Text
          style={{ color: colors.text.primary, fontSize: typography.sizes.sm }}
        >
          {band.label}
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
            marginTop: spacing.xs,
          }}
        >
          Taxed {amount} · {band.rate}%
        </Text>
      </View>
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.sm,
          fontVariant: ['tabular-nums'],
          fontWeight: '700',
        }}
      >
        {due}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  description: { flex: 1 },
  inactive: { opacity: 0.5 },
});
