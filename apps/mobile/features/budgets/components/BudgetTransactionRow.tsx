import type { CategoryDto, TransactionDto } from '@guallet/api-client';
import { CategoryIcon } from '@guallet/luna-mobile/icons';
import { useTheme } from '@guallet/luna-mobile';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatBudgetCurrency, formatTransactionDate } from '../models';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';

interface BudgetTransactionRowProps {
  accountName?: string;
  category?: CategoryDto;
  onPress: () => void;
  transaction: TransactionDto;
}

export function BudgetTransactionRow({
  accountName,
  category,
  onPress,
  transaction,
}: Readonly<BudgetTransactionRowProps>) {
  const { colors, spacing, typography } = useTheme();
  const { dateFormat } = useMobileUserPreferences();
  const amount = Number(transaction.amount);
  const isIncome = amount >= 0;
  const amountColor = isIncome ? colors.support.primary : colors.status.error;
  const description = transaction.description || 'Unknown transaction';
  const metadata = [
    category?.name ?? 'Uncategorised',
    accountName,
    formatTransactionDate(transaction.date, dateFormat),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${description}, ${metadata}, ${formatBudgetCurrency(amount, transaction.currency)}`}
      onPress={onPress}
      style={[
        styles.row,
        {
          borderBottomColor: colors.surface.border.primary,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <View
        accessible={false}
        style={[
          styles.icon,
          {
            backgroundColor: colors.button.secondary.default,
            borderRadius: 20,
          },
        ]}
      >
        <CategoryIcon
          color={category?.colour ?? colors.accent.primary}
          name={category?.icon}
          size={18}
        />
      </View>
      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            fontWeight: '600',
          }}
        >
          {description}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
          }}
        >
          {metadata}
        </Text>
      </View>
      <Text
        style={{
          color: amountColor,
          fontSize: typography.sizes.sm,
          fontVariant: ['tabular-nums'],
          fontWeight: '700',
        }}
      >
        {isIncome && '+'}
        {formatBudgetCurrency(amount, transaction.currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
  },
  icon: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  content: { flex: 1, gap: 3, minWidth: 0 },
});
