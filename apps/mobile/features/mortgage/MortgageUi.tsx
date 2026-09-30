import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/luna-mobile';

export function formatMortgageMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function formatMortgageDuration(months: number): string {
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (years === 0) return `${remainder} mo`;
  if (remainder === 0) return `${years} yr`;
  return `${years} yr ${remainder} mo`;
}

export function MortgageCard({
  title,
  children,
}: Readonly<{ title?: string; children: ReactNode }>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
        },
      ]}
    >
      {title && (
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            fontWeight: '700',
            marginBottom: spacing.sm,
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

export function MortgageMetric({
  label,
  value,
  positive = false,
  negative = false,
}: Readonly<{
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}>) {
  const { colors, spacing, typography } = useTheme();
  let valueColor = colors.text.primary;
  if (positive) valueColor = colors.support.dark;
  if (negative) valueColor = colors.status.error;
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[
        styles.metric,
        {
          borderBottomColor: colors.surface.border.primary,
          paddingVertical: spacing.sm,
        },
      ]}
    >
      <Text
        style={{
          color: colors.text.secondary,
          flex: 1,
          fontSize: typography.sizes.sm,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: valueColor,
          fontSize: typography.sizes.sm,
          fontVariant: ['tabular-nums'],
          fontWeight: '700',
          flexShrink: 1,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function MortgageAction({
  label,
  onPress,
  disabled = false,
  subtle = false,
}: Readonly<{
  label: string;
  onPress: () => void;
  disabled?: boolean;
  subtle?: boolean;
}>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  let backgroundColor = colors.accent.primary;
  let textColor = colors.text.inverse;
  if (subtle) {
    backgroundColor = colors.surface.background.secondary;
    textColor = colors.accent.primary;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.action,
        {
          backgroundColor,
          borderRadius: borderRadius.md,
          minHeight: spacing.xxl + spacing.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={{
          color: textColor,
          fontSize: typography.sizes.sm,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  metric: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  action: { alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
});
