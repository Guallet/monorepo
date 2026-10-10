import { useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Button, useTheme } from '@guallet/luna-mobile';
import { ChevronRightIcon, RepeatIcon } from '@guallet/luna-mobile/icons';
import {
  RecurringPaymentType,
  type SubscriptionDto,
} from '@guallet/api-client';
import { AppScreen } from '@/components/layout/AppScreen';
import { formatMoney } from '@/utils/formatMoney';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { cadenceLabel, typeLabel, type CurrencySummary } from '../recurring';

export function RecurringScreen({
  title,
  children,
  headerRight,
}: Readonly<{
  title: string;
  children: ReactNode;
  headerRight?: () => ReactNode;
}>) {
  return (
    <AppScreen headerTitle={title} headerOptions={{ headerRight }}>
      <View style={styles.flex}>{children}</View>
    </AppScreen>
  );
}
export function Card({
  children,
  style,
}: Readonly<{ children: ReactNode; style?: StyleProp<ViewStyle> }>) {
  const { colors, spacing, borderRadius } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          borderColor: colors.surface.border.primary,
          backgroundColor: colors.surface.background.primary,
          shadowColor: colors.surface.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Copy({
  children,
  heading = false,
  muted = false,
  error = false,
}: Readonly<{
  children: ReactNode;
  heading?: boolean;
  muted?: boolean;
  error?: boolean;
}>) {
  const { colors, typography } = useTheme();
  let color = colors.text.primary;
  let fontSize = typography.sizes.md;
  let fontWeight: '400' | '600' = '400';
  if (muted) {
    color = colors.text.secondary;
    fontSize = typography.sizes.sm;
  }
  if (error) color = colors.status.error;
  if (heading) {
    fontSize = typography.sizes.lg;
    fontWeight = '600';
  }
  return (
    <Text
      accessibilityRole={heading ? 'header' : undefined}
      accessibilityLiveRegion={error ? 'polite' : undefined}
      style={{ color, fontSize, fontWeight }}
    >
      {children}
    </Text>
  );
}
export function Choice({
  label,
  selected,
  onPress,
  disabled = false,
}: Readonly<{
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  let backgroundColor = colors.surface.background.primary;
  let color = colors.text.secondary;
  let borderColor = colors.surface.border.primary;
  if (selected) {
    backgroundColor = colors.accent.primary;
    color = colors.text.inverse;
    borderColor = colors.accent.primary;
  }
  if (disabled) {
    backgroundColor = colors.surface.background.disabled;
    color = colors.text.disabled;
  }
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.choice,
        {
          backgroundColor,
          borderColor,
          borderRadius: borderRadius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
      ]}
    >
      <Text style={{ color, fontSize: typography.sizes.sm, fontWeight: '500' }}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Avatar({
  item,
  large = false,
}: Readonly<{ item: SubscriptionDto; large?: boolean }>) {
  const { colors, borderRadius, spacing } = useTheme();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(item.imageUrl) && failedUrl !== item.imageUrl;
  let size = spacing.xxl;
  if (large) size = spacing.xxl + spacing.lg;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          backgroundColor: colors.button.secondary.default,
          borderRadius: borderRadius.lg,
        },
      ]}
    >
      {showImage && (
        <Image
          source={{ uri: item.imageUrl }}
          onError={() => setFailedUrl(item.imageUrl ?? null)}
          style={styles.image}
        />
      )}
      {!showImage && (
        <RepeatIcon size={spacing.lg} color={colors.accent.primary} />
      )}
    </View>
  );
}
export function Amount({
  item,
  amount,
  large = false,
}: Readonly<{
  item: Pick<SubscriptionDto, 'amount' | 'currency' | 'type'>;
  amount?: number;
  large?: boolean;
}>) {
  const { colors, typography } = useTheme();
  const { languageTag } = useMobileUserPreferences();
  let signed = -Math.abs(Number(amount ?? item.amount));
  let color = colors.status.error;
  let fontSize = typography.sizes.md;
  if (item.type === RecurringPaymentType.REGULAR_INCOME) {
    signed = Math.abs(Number(amount ?? item.amount));
    color = colors.support.primary;
  }
  if (large) fontSize = typography.sizes.xxl;
  return (
    <Text style={[styles.money, { color, fontSize }]}>
      {formatMoney(signed, item.currency, {
        locale: languageTag,
        showPositiveSign: true,
      })}
    </Text>
  );
}
export function ItemRow({
  item,
  meta,
  onPress,
}: Readonly<{ item: SubscriptionDto; meta: string; onPress: () => void }>) {
  const { spacing, colors, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${typeLabel(item.type)}, ${cadenceLabel(item.cadence)}, ${formatMoney(Number(item.amount), item.currency)}, ${meta}`}
      onPress={onPress}
      style={[styles.row, { gap: spacing.sm, paddingVertical: spacing.sm }]}
    >
      <Avatar item={item} />
      <View style={[styles.flex, { gap: spacing.xs }]}>
        <View style={[styles.summaryRow, { gap: spacing.sm }]}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.md,
              fontWeight: '600',
              flexBasis: typography.sizes.md * 5,
              flexGrow: 1,
              flexShrink: 1,
            }}
          >
            {item.name}
          </Text>
          <Amount item={item} />
        </View>
        <Copy muted>{meta}</Copy>
      </View>
      <ChevronRightIcon
        accessible={false}
        color={colors.text.secondary}
        size={spacing.lg}
      />
    </Pressable>
  );
}
export function Summary({
  totals,
  estimate,
}: Readonly<{ totals: CurrencySummary[]; estimate: boolean }>) {
  const { spacing, colors, typography } = useTheme();
  const { languageTag } = useMobileUserPreferences();
  let title = 'Expected this month';
  if (estimate) title = 'Monthly estimates';
  if (!totals.length)
    return (
      <Card>
        <Copy heading>{title}</Copy>
        <Copy muted>No scheduled amounts to total.</Copy>
      </Card>
    );
  return (
    <Card>
      <View style={{ gap: spacing.md }}>
        <Copy heading>{title}</Copy>
        {totals.map((total) => (
          <View key={total.currency} style={{ gap: spacing.sm }}>
            <Copy muted>{total.currency}</Copy>
            <View style={[styles.summaryRow, { gap: spacing.md }]}>
              <View style={{ gap: spacing.xs }}>
                <Copy muted>Payments</Copy>
                <Text
                  style={[
                    styles.money,
                    {
                      color: colors.status.error,
                      fontSize: typography.sizes.lg,
                    },
                  ]}
                >
                  {total.payments.format({ locale: languageTag })}
                </Text>
              </View>
              <View style={{ gap: spacing.xs }}>
                <Copy muted>Income</Copy>
                <Text
                  style={[
                    styles.money,
                    {
                      color: colors.support.primary,
                      fontSize: typography.sizes.lg,
                    },
                  ]}
                >
                  {total.income.format({
                    locale: languageTag,
                    showPositiveSign: true,
                  })}
                </Text>
              </View>
            </View>
          </View>
        ))}
        <Copy muted>
          Based on the schedules you’ve added. Totals stay separate by currency.
        </Copy>
      </View>
    </Card>
  );
}
export function Loading() {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={[styles.status, { gap: spacing.md, padding: spacing.lg }]}
      accessibilityLabel="Loading recurring items"
      accessibilityState={{ busy: true }}
    >
      <ActivityIndicator color={colors.accent.primary} />
      <Copy muted>Loading recurring items…</Copy>
    </View>
  );
}
export function Status({
  title,
  message,
  action,
  onPress,
}: Readonly<{
  title: string;
  message: string;
  action: string;
  onPress: () => void;
}>) {
  const { spacing } = useTheme();
  return (
    <Card>
      <View style={{ gap: spacing.md }}>
        <Copy heading>{title}</Copy>
        <Copy muted>{message}</Copy>
        <Button
          style={{ ...styles.button, paddingVertical: spacing.sm }}
          onClick={onPress}
        >
          {action}
        </Button>
      </View>
    </Card>
  );
}
export function DetailValue({
  label,
  children,
}: Readonly<{ label: string; children: ReactNode }>) {
  const { spacing } = useTheme();
  return (
    <View style={[styles.detailValue, { gap: spacing.sm }]}>
      <Copy muted>{label}</Copy>
      <View style={styles.value}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  choice: {
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  money: { fontVariant: ['tabular-nums'], fontWeight: '700', maxWidth: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 72 },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  status: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  detailValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  value: { flexShrink: 1 },
  button: { height: 'auto', minHeight: 48 },
});
