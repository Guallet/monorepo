import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/luna-mobile';
import { MobileTransaction, formatCurrency } from '../utils';

interface TransactionRowProps {
  transaction: MobileTransaction;
  accountName?: string;
  categoryName?: string;
  onPress: () => void;
}

function getAvatarColor(
  text: string,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  const avatarColors = [
    colors.accent.primary,
    colors.support.primary,
    colors.accent.secondary,
    colors.status.error,
    colors.accent.dark,
    colors.accent.aqua,
    colors.support.dark,
    colors.neutral.midGrey,
  ];

  return avatarColors[(text.codePointAt(0) ?? 0) % avatarColors.length];
}

export function TransactionRow({
  transaction,
  accountName,
  categoryName,
  onPress,
}: Readonly<TransactionRowProps>) {
  const { colors, spacing, typography } = useTheme();
  const isIncome = transaction.amount >= 0;
  const description = transaction.description?.trim() || 'Unknown transaction';
  const avatarColor = getAvatarColor(description, colors);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: colors.surface.border.primary,
          opacity: pressed ? 0.7 : 1,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${description}`}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={[styles.avatarText, { color: colors.neutral.white }]}>
          {isIncome ? '↑' : description[0].toUpperCase()}
        </Text>
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.description,
            { color: colors.text.primary, fontSize: typography.sizes.md },
          ]}
          numberOfLines={1}
        >
          {description}
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
          }}
          numberOfLines={1}
        >
          {[accountName, categoryName ?? 'Uncategorised']
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>

      <Text
        style={[
          styles.amount,
          {
            color: isIncome ? colors.support.primary : colors.status.error,
            fontSize: typography.sizes.sm,
          },
        ]}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(transaction.amount, transaction.currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  description: {
    fontWeight: '600',
  },
  amount: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
