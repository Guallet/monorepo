import { StyleSheet, Text, View } from 'react-native';
import { TransactionDto } from '@guallet/api-client';
import { useCategory } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react-native';

const AVATAR_COLORS = [
  '#005EB8',
  '#009639',
  '#41B6E6',
  '#DA291C',
  '#003087',
  '#00A9CE',
  '#006747',
  '#768692',
];

function getAvatarColor(text: string): string {
  return AVATAR_COLORS[text.charCodeAt(0) % AVATAR_COLORS.length];
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
  const { category } = useCategory(categoryId);
  return category ? <Text style={styles.metaText}>{category.name}</Text> : null;
}

export function TransactionListItem({ transaction }: TransactionListItemProps) {
  const { colors, spacing, typography } = useTheme();
  const isIncome = transaction.amount > 0;
  const initial = (transaction.description ?? '?')[0].toUpperCase();
  const avatarBg = getAvatarColor(transaction.description ?? '');

  return (
    <View style={[styles.row, { paddingVertical: spacing.sm }]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        {isIncome ? (
          <Text style={styles.avatarIcon}>↑</Text>
        ) : (
          <Text style={styles.avatarLetter}>{initial}</Text>
        )}
      </View>

      {/* Middle: description + meta */}
      <View style={styles.middle}>
        <Text
          style={[
            styles.description,
            { color: colors.black, fontSize: typography.sizes.sm },
          ]}
          numberOfLines={1}
        >
          {transaction.description}
        </Text>
        <View style={styles.metaRow}>
          <CategoryLabel categoryId={transaction.categoryId} />
          {transaction.categoryId && (
            <Text style={[styles.metaText, { color: colors.midGrey }]}>
              {' · '}
            </Text>
          )}
          <Text
            style={[
              styles.metaText,
              { color: colors.midGrey, fontSize: typography.sizes.xs },
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
            color: isIncome ? colors.support : colors.error,
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  avatarIcon: {
    color: '#FFFFFF',
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
