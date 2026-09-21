import type { TransactionDto } from '@guallet/api-client';
import { CategoryIcon } from '@guallet/luna-mobile/icons';
import { useTheme } from '@guallet/luna-mobile';
import { StyleSheet, Text, View } from 'react-native';
import { formatBudgetCurrency, formatTransactionDate } from '../models';

interface BudgetTransactionRowProps {
  categoryName?: string;
  transaction: TransactionDto;
}

export function BudgetTransactionRow({
  categoryName,
  transaction,
}: Readonly<BudgetTransactionRowProps>) {
  const { colors, spacing, typography } = useTheme();
  const amount = Number(transaction.amount);
  const isIncome = amount >= 0;

  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: colors.surface.border.primary,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: colors.button.secondary.default,
            borderRadius: 20,
          },
        ]}
      >
        <CategoryIcon
          color={colors.accent.primary}
          name={undefined}
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
          {transaction.description || 'Unknown transaction'}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
          }}
        >
          {[
            categoryName ?? 'Uncategorised',
            formatTransactionDate(transaction.date),
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      <Text
        style={{
          color: isIncome ? colors.support.primary : colors.status.error,
          fontSize: typography.sizes.sm,
          fontWeight: '700',
        }}
      >
        {isIncome ? '+' : ''}
        {formatBudgetCurrency(amount, transaction.currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  content: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
});
