import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from '@guallet/luna-mobile';
import { ChevronRightIcon } from '@guallet/luna-mobile/icons';
import { Money } from '@guallet/money';
import type { ReportCategory } from '../reportModels';

/** Let larger text and translated labels grow beyond the standard button height. */
export function ReportButton(props: Readonly<ComponentProps<typeof Button>>) {
  const { spacing } = useTheme();
  return (
    <Button
      {...props}
      style={{
        height: 'auto',
        minHeight: spacing.xxl + spacing.md,
        padding: spacing.sm,
        ...props.style,
      }}
    />
  );
}

export function ReportCard({ children }: Readonly<{ children: ReactNode }>) {
  const { colors, spacing, borderRadius } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          padding: spacing.md,
          gap: spacing.md,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          shadowColor: colors.surface.shadow,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function ReportText({
  children,
  heading = false,
  secondary = false,
}: Readonly<{ children: ReactNode; heading?: boolean; secondary?: boolean }>) {
  const { colors, typography } = useTheme();
  let color = colors.text.primary;
  let size = typography.sizes.md;
  let weight: '400' | '600' = '400';
  let role: 'header' | undefined;
  if (secondary) {
    color = colors.text.secondary;
    size = typography.sizes.sm;
  }
  if (heading) {
    weight = '600';
    size = typography.sizes.lg;
    role = 'header';
  }
  return (
    <Text
      accessibilityRole={role}
      style={{ color, fontSize: size, fontWeight: weight }}
    >
      {children}
    </Text>
  );
}

export function ReportAmount({
  amount,
  currency,
  locale,
  large = false,
}: Readonly<{
  amount: number;
  currency: string;
  locale: string;
  large?: boolean;
}>) {
  const { colors, typography } = useTheme();
  let color = colors.text.primary;
  let value = amount;
  if (Object.is(value, -0)) value = 0;
  let fontSize = typography.sizes.md;
  if (value > 0) color = colors.support.primary;
  if (value < 0) color = colors.status.error;
  if (large) fontSize = typography.sizes.xxl;
  const formatted = Money.fromCurrencyCode({
    amount: value,
    currencyCode: currency,
  }).format({ locale, showPositiveSign: true });
  return <Text style={[styles.amount, { color, fontSize }]}>{formatted}</Text>;
}

export function categoryColors(
  colors: ReturnType<typeof useTheme>['colors'],
): string[] {
  return [
    colors.accent.dark,
    colors.accent.primary,
    colors.accent.secondary,
    colors.accent.aqua,
    colors.accent.bright,
  ];
}

export function ReportCategoryRows({
  rows,
  total,
  currency,
  locale,
  income,
  onSelect,
}: Readonly<{
  rows: ReportCategory[];
  total: number;
  currency: string;
  locale: string;
  income: boolean;
  onSelect: (row: ReportCategory) => void;
}>) {
  const { colors, spacing } = useTheme();
  const palette = categoryColors(colors);
  return (
    <View style={{ gap: spacing.sm }}>
      {rows.map((row, index) => {
        let amount = -row.amount;
        if (income) amount = row.amount;
        const formatted = Money.fromCurrencyCode({
          amount,
          currencyCode: currency,
        }).format({ locale, showPositiveSign: true });
        const share = new Intl.NumberFormat(locale, {
          style: 'percent',
          maximumFractionDigits: 1,
        }).format(row.amount / total);
        const canExpand = row.children.length > 0;
        const content = (
          <>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: palette[index % palette.length],
                  marginTop: spacing.sm,
                },
              ]}
            />
            <View style={[styles.flex, { gap: spacing.xs }]}>
              <View style={[styles.row, { gap: spacing.sm, flexWrap: 'wrap' }]}>
                <ReportText>{row.name}</ReportText>
                <ReportAmount
                  amount={amount}
                  currency={currency}
                  locale={locale}
                />
              </View>
              <ReportText secondary>{share} of total</ReportText>
            </View>
            {canExpand && (
              <ChevronRightIcon
                size={spacing.lg}
                color={colors.text.secondary}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            )}
          </>
        );
        const rowStyle = [
          styles.categoryRow,
          { gap: spacing.sm, paddingVertical: spacing.sm },
        ];
        if (canExpand)
          return (
            <Pressable
              key={row.id}
              accessibilityRole="button"
              accessibilityLabel={`${row.name}, ${formatted}, ${share} of total. View subcategories`}
              onPress={() => onSelect(row)}
              style={rowStyle}
            >
              {content}
            </Pressable>
          );
        return (
          <View
            key={row.id}
            accessible
            accessibilityLabel={`${row.name}, ${formatted}, ${share} of total`}
            style={rowStyle}
          >
            {content}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  amount: { fontVariant: ['tabular-nums'], fontWeight: '700', flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
});
