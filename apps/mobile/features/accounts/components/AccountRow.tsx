import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AccountDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-mobile';
import { AccountAvatar } from './AccountAvatar';
import { formatAccountCurrency, getAccountTypeLabel } from '../models/account';

export function AccountRow({
  account,
  onPress,
}: Readonly<{ account: AccountDto; onPress: () => void }>) {
  const { colors, spacing, typography } = useTheme();
  const isNegative = account.balance.amount < 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${account.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: colors.surface.border.primary,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <AccountAvatar account={account} size={42} />
      <View style={[styles.details, { gap: spacing.xs }]}>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            { color: colors.text.primary, fontSize: typography.sizes.md },
          ]}
        >
          {account.name}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            styles.meta,
            { color: colors.text.secondary, fontSize: typography.sizes.xs },
          ]}
        >
          {account.sourceName ?? getAccountTypeLabel(account.type)} ·{' '}
          {account.currency}
        </Text>
      </View>
      <View style={styles.amountColumn}>
        <Text
          numberOfLines={1}
          style={[
            styles.amount,
            {
              color: isNegative ? colors.status.error : colors.text.primary,
              fontSize: typography.sizes.md,
            },
          ]}
        >
          {formatAccountCurrency(account.balance.amount, account.currency)}
        </Text>
        <Text style={[styles.chevron, { color: colors.text.secondary }]}>
          ›
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: '600',
  },
  meta: {},
  amountColumn: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    maxWidth: '45%',
  },
  amount: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  chevron: {
    fontSize: 25,
    lineHeight: 25,
  },
});
