import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTransactions } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { TransactionListItem } from './TransactionListItem';
import { useTranslation } from 'react-i18next';

const MAX_TRANSACTIONS = 5;

interface RecentTransactionsWidgetProps {
  onSeeAll?: () => void;
}

export function RecentTransactionsWidget({
  onSeeAll,
}: RecentTransactionsWidgetProps) {
  const { t } = useTranslation();
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { transactions, isLoading } = useTransactions();

  if (isLoading) {
    return (
      <View
        style={[
          styles.skeleton,
          {
            borderRadius: borderRadius.lg,
            backgroundColor: colors.surface.background.secondary,
          },
        ]}
      />
    );
  }

  const recent = transactions.slice(0, MAX_TRANSACTIONS);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderRadius: borderRadius.lg,
          borderColor: colors.surface.border.primary,
          padding: spacing.md,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: colors.text.primary, fontSize: typography.sizes.lg },
          ]}
        >
          {t('copy_mg65fi')}
        </Text>
        {onSeeAll && (
          <Pressable onPress={onSeeAll}>
            <Text
              style={[
                styles.seeAll,
                { color: colors.accent.primary, fontSize: typography.sizes.sm },
              ]}
            >
              {t('copy_19mqy9f')}
            </Text>
          </Pressable>
        )}
      </View>

      {recent.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            { color: colors.text.secondary, fontSize: typography.sizes.sm },
          ]}
        >
          {t('copy_1w3zrc9')}
        </Text>
      ) : (
        recent.map((transaction, index) => (
          <View key={transaction.id}>
            {index > 0 && (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.surface.border.primary },
                ]}
              />
            )}
            <TransactionListItem transaction={transaction} />
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 220,
  },
  card: {
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
  },
  seeAll: {
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
  },
});
