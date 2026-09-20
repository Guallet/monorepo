import { StyleSheet, Text, View } from 'react-native';
import { TransactionDto } from '@guallet/api-client';
import { useCategory } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-ui';

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

  const codePoint = text.codePointAt(0) ?? 0;
  return avatarColors[codePoint % avatarColors.length];
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

interface TransactionListItemProps {
  transaction: TransactionDto & { date: Date };
}

function CategoryLabel({ categoryId }: { categoryId: string | null }) {
  const { colors } = useTheme();
  const { category } = useCategory(categoryId);
  return category ? (
    <Text style={[styles.metaText, { color: colors.text.secondary }]}>
      {category.name}
    </Text>
  ) : null;
}

export function TransactionListItem({ transaction }: TransactionListItemProps) {
  const { colors, spacing, typography } = useTheme();
  const isIncome = transaction.amount > 0;
  const description = transaction.description?.trim() || 'Unknown transaction';
  const initial = description[0].toUpperCase();
  const avatarBg = getAvatarColor(description, colors);

  return (
    <View style={[styles.row, { paddingVertical: spacing.sm }]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        {isIncome ? (
          <Text style={[styles.avatarIcon, { color: colors.neutral.white }]}>
            ↑
          </Text>
        ) : (
          <Text style={[styles.avatarLetter, { color: colors.neutral.white }]}>
            {initial}
          </Text>
        )}
      </View>

      {/* Middle: description + meta */}
      <View style={styles.middle}>
        <Text
          style={[
            styles.description,
            { color: colors.text.primary, fontSize: typography.sizes.sm },
          ]}
          numberOfLines={1}
        >
          {description}
        </Text>
        <View style={styles.metaRow}>
          <CategoryLabel categoryId={transaction.categoryId} />
          {transaction.categoryId && (
            <Text style={[styles.metaText, { color: colors.text.secondary }]}>
              {' · '}
            </Text>
          )}
          <Text
            style={[
              styles.metaText,
              { color: colors.text.secondary, fontSize: typography.sizes.xs },
            ]}
          >
            {formatDate(transaction.date)}
          </Text>
        </View>
      </View>

      {/* Amount */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '700',
  },
  avatarIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  description: {
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
  },
  amount: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
});
