import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@guallet/luna-mobile';
import { Money } from '@guallet/money';
import type { ReportCategory } from '../reportModels';
import { categoryColors, ReportAmount, ReportText } from './ReportUi';

export function CategoryDonut({
  rows,
  total,
  currency,
  locale,
  income,
  period,
}: Readonly<{
  rows: ReportCategory[];
  total: number;
  currency: string;
  locale: string;
  income: boolean;
  period: string;
}>) {
  const { colors, spacing, typography } = useTheme();
  const { fontScale } = useWindowDimensions();
  const palette = categoryColors(colors);
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const offsets = rows.map(
    (_row, index) =>
      (rows.slice(0, index).reduce((sum, row) => sum + row.amount, 0) / total) *
      circumference,
  );
  let signed = -total;
  let label = 'TOTAL SPENDING';
  let moneyColor = colors.status.error;
  if (income) {
    signed = total;
    label = 'TOTAL INCOME';
    moneyColor = colors.support.primary;
  }
  const formatted = Money.fromCurrencyCode({
    amount: signed,
    currencyCode: currency,
  }).format({ locale, showPositiveSign: true });
  let largeText = false;
  if (fontScale > 1.2) largeText = true;
  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <View
        accessible
        accessibilityLabel={`${label}, ${formatted}. ${period}. Category breakdown follows.`}
        style={styles.chart}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 240 240"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {rows.map((row, index) => {
            const length = (row.amount / total) * circumference;
            let gap = Math.min(4, length / 4);
            if (rows.length === 1) gap = 0;
            const start = offsets[index];
            return (
              <Circle
                key={row.id}
                cx={120}
                cy={120}
                r={radius}
                fill="none"
                stroke={palette[index % palette.length]}
                strokeWidth={20}
                strokeDasharray={[length - gap, circumference - length + gap]}
                strokeDashoffset={-start}
                rotation={-90}
                origin="120, 120"
              />
            );
          })}
        </Svg>
        <View
          pointerEvents="none"
          style={[styles.center, { gap: spacing.sm }]}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.xs,
              fontWeight: '600',
            }}
          >
            {label}
          </Text>
          {!largeText && (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[
                styles.amount,
                { color: moneyColor, fontSize: typography.sizes.xl },
              ]}
            >
              {formatted}
            </Text>
          )}
          {!largeText && (
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.xs,
              }}
            >
              {period}
            </Text>
          )}
        </View>
      </View>
      {largeText && (
        <ReportAmount
          amount={signed}
          currency={currency}
          locale={locale}
          large
        />
      )}
      {largeText && <ReportText secondary>{period}</ReportText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  chart: { width: '100%', maxWidth: 280, aspectRatio: 1 },
  center: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '25%',
    bottom: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amount: {
    width: '100%',
    textAlign: 'center',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
