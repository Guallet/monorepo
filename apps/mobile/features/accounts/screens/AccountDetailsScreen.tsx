import { useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError } from '@guallet/api-client';
import {
  useAccount,
  useAccountCharts,
  useAccountMutations,
  useAccountTransactions,
} from '@guallet/api-react';
import { Button, useTheme } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { InstitutionAvatar } from '../components/InstitutionAvatar';
import { AccountTypeIcon } from '../components/AccountTypeIcon';
import { formatAccountCurrency, getAccountTypeLabel } from '../models/account';

function getId(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function AccountDetailsScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = getId(rawId);
  const router = useRouter();
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { account, error, isError, isLoading, refetch } = useAccount(id);
  const { data: chartData, isLoading: isChartLoading } = useAccountCharts(id);
  const { transactions } = useAccountTransactions(id);
  const { deleteAccountMutation } = useAccountMutations();

  const history = useMemo(
    () => (chartData?.balanceHistory ?? []).slice(-6),
    [chartData],
  );
  const maxBalance = Math.max(
    ...history.map((point) => Math.abs(point.balance)),
    1,
  );
  const recentTransactions = transactions.slice(0, 5);

  function confirmDelete() {
    if (!account) return;
    Alert.alert(
      `Delete ${account.name}?`,
      'This removes the account and its transactions. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => {
            void deleteAccountMutation
              .mutateAsync({ id })
              .then(() => router.replace('/(tabs)/accounts'))
              .catch(() =>
                Alert.alert(
                  'Couldn’t delete account',
                  'Please try again in a moment.',
                ),
              );
          },
        },
      ],
    );
  }

  if (
    !isLoading &&
    isError &&
    !(error instanceof ApiError && error.status === 404)
  ) {
    return (
      <AppScreen headerTitle="Account">
        <View style={styles.notFound}>
          <Text
            style={[
              styles.notFoundTitle,
              { color: colors.text.primary, fontSize: typography.sizes.lg },
            ]}
          >
            Couldn’t load account
          </Text>
          <Text
            style={[
              styles.notFoundBody,
              { color: colors.text.secondary, fontSize: typography.sizes.sm },
            ]}
          >
            Check your connection and try again.
          </Text>
          <Button onClick={() => void refetch()} variant="outline">
            Try again
          </Button>
        </View>
      </AppScreen>
    );
  }

  if (!isLoading && !account) {
    return (
      <AppScreen headerTitle="Account">
        <View style={styles.notFound}>
          <Text
            style={[
              styles.notFoundTitle,
              { color: colors.text.primary, fontSize: typography.sizes.lg },
            ]}
          >
            Account not found
          </Text>
          <Text
            style={[
              styles.notFoundBody,
              { color: colors.text.secondary, fontSize: typography.sizes.sm },
            ]}
          >
            This account may have been deleted.
          </Text>
          <Button onClick={() => router.back()} variant="outline">
            Go back
          </Button>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      headerOptions={{
        headerRight: () => (
          <Pressable onPress={() => router.push(`/accounts/${id}/edit`)}>
            <Text
              style={[styles.headerAction, { color: colors.accent.primary }]}
            >
              Edit
            </Text>
          </Pressable>
        ),
      }}
      headerTitle={account?.name ?? 'Account'}
      isLoading={isLoading}
      loadingMessage="Loading account…"
    >
      {account && (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { gap: spacing.md, padding: spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.hero,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <View style={styles.heroHeader}>
              <InstitutionAvatar
                fallbackName={account.name}
                institutionId={account.institutionId}
                size={58}
              />
              <View style={styles.heroDetails}>
                <Text
                  style={[
                    styles.accountName,
                    {
                      color: colors.text.primary,
                      fontSize: typography.sizes.lg,
                    },
                  ]}
                >
                  {account.name}
                </Text>
                <View style={styles.accountMeta}>
                  <AccountTypeIcon
                    color={colors.text.secondary}
                    size={15}
                    type={account.type}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      {
                        color: colors.text.secondary,
                        fontSize: typography.sizes.sm,
                      },
                    ]}
                  >
                    {getAccountTypeLabel(account.type)}
                  </Text>
                  <Text
                    style={[
                      styles.metaText,
                      {
                        color: colors.text.secondary,
                        fontSize: typography.sizes.sm,
                      },
                    ]}
                  >
                    · {account.currency}
                  </Text>
                </View>
              </View>
            </View>
            <Text
              style={[
                styles.balanceLabel,
                { color: colors.text.secondary, fontSize: typography.sizes.xs },
              ]}
            >
              CURRENT BALANCE
            </Text>
            <Text
              style={[
                styles.balance,
                {
                  color:
                    account.balance.amount < 0
                      ? colors.status.error
                      : colors.text.primary,
                  fontSize: typography.sizes.xxl,
                },
              ]}
            >
              {formatAccountCurrency(account.balance.amount, account.currency)}
            </Text>
            <Text
              style={[
                styles.source,
                { color: colors.text.secondary, fontSize: typography.sizes.xs },
              ]}
            >
              {account.source === 'synced'
                ? `Synced${account.sourceName ? ` with ${account.sourceName}` : ''}`
                : 'Manual account'}
            </Text>
          </View>

          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text.primary, fontSize: typography.sizes.lg },
                ]}
              >
                Balance history
              </Text>
              <Text
                style={[
                  styles.sectionMeta,
                  {
                    color: colors.text.secondary,
                    fontSize: typography.sizes.xs,
                  },
                ]}
              >
                Current month
              </Text>
            </View>
            {isChartLoading ? (
              <View
                style={[
                  styles.chartLoading,
                  {
                    backgroundColor: colors.surface.background.secondary,
                    borderRadius: borderRadius.sm,
                  },
                ]}
              />
            ) : history.length === 0 ? (
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                  },
                ]}
              >
                No balance history yet.
              </Text>
            ) : (
              <View style={styles.chart}>
                {history.map((point) => (
                  <View key={point.date} style={styles.barColumn}>
                    <View
                      style={[
                        styles.barTrack,
                        {
                          backgroundColor: colors.surface.background.secondary,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.bar,
                          {
                            backgroundColor: colors.accent.primary,
                            height: `${Math.max(8, (Math.abs(point.balance) / maxBalance) * 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.chartLabel,
                        {
                          color: colors.text.secondary,
                          fontSize: typography.sizes.xs,
                        },
                      ]}
                    >
                      {new Date(`${point.date}T12:00:00`).toLocaleDateString(
                        'en-GB',
                        {
                          day: 'numeric',
                          month: 'short',
                        },
                      )}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text.primary, fontSize: typography.sizes.lg },
                ]}
              >
                Transactions this month
              </Text>
              <Text
                style={[
                  styles.sectionMeta,
                  {
                    color: colors.text.secondary,
                    fontSize: typography.sizes.xs,
                  },
                ]}
              >
                {recentTransactions.length} shown
              </Text>
            </View>
            {recentTransactions.length === 0 ? (
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                  },
                ]}
              >
                No transactions this month.
              </Text>
            ) : (
              recentTransactions.map((transaction) => {
                const isIncome = transaction.amount >= 0;
                return (
                  <View
                    key={transaction.id}
                    style={[
                      styles.transaction,
                      { borderTopColor: colors.surface.border.primary },
                    ]}
                  >
                    <View style={styles.transactionDetails}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.transactionName,
                          {
                            color: colors.text.primary,
                            fontSize: typography.sizes.sm,
                          },
                        ]}
                      >
                        {transaction.description || 'Untitled transaction'}
                      </Text>
                      <Text
                        style={[
                          styles.transactionDate,
                          {
                            color: colors.text.secondary,
                            fontSize: typography.sizes.xs,
                          },
                        ]}
                      >
                        {new Date(transaction.date).toLocaleDateString(
                          'en-GB',
                          { day: 'numeric', month: 'short' },
                        )}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color: isIncome
                            ? colors.support.primary
                            : colors.status.error,
                          fontSize: typography.sizes.sm,
                        },
                      ]}
                    >
                      {isIncome ? '+' : '-'}
                      {formatAccountCurrency(
                        Math.abs(transaction.amount),
                        transaction.currency,
                      )}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          <View
            style={[
              styles.dangerCard,
              {
                borderColor: colors.status.error,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
              },
            ]}
          >
            <Text
              style={[
                styles.dangerTitle,
                { color: colors.status.error, fontSize: typography.sizes.md },
              ]}
            >
              Danger zone
            </Text>
            <Text
              style={[
                styles.dangerBody,
                { color: colors.text.secondary, fontSize: typography.sizes.sm },
              ]}
            >
              Deleting an account also removes its transaction history.
            </Text>
            <Button
              disabled={deleteAccountMutation.isPending}
              onClick={confirmDelete}
              variant="outline"
              style={{
                ...styles.deleteButton,
                borderColor: colors.status.error,
              }}
            >
              {deleteAccountMutation.isPending ? 'Deleting…' : 'Delete account'}
            </Button>
          </View>
          <View style={styles.bottomPad} />
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 28 },
  headerAction: { fontSize: 16, fontWeight: '600', paddingHorizontal: 8 },
  hero: { borderWidth: 1, gap: 5 },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  heroDetails: { flex: 1, gap: 4 },
  accountName: { fontWeight: '700' },
  accountMeta: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  metaText: {},
  balanceLabel: { fontWeight: '600', letterSpacing: 1.2, marginTop: 4 },
  balance: { fontVariant: ['tabular-nums'], fontWeight: '700' },
  source: { marginTop: 2 },
  sectionCard: { borderWidth: 1 },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontWeight: '700' },
  sectionMeta: {},
  chartLoading: { height: 150 },
  emptyText: { paddingVertical: 8 },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: 8, height: 150 },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 7,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    alignItems: 'center',
    height: 116,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  bar: { borderRadius: 3, minHeight: 8, width: '100%' },
  chartLabel: { fontWeight: '500' },
  transaction: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  transactionDetails: { flex: 1, gap: 3 },
  transactionName: { fontWeight: '600' },
  transactionDate: {},
  transactionAmount: { fontVariant: ['tabular-nums'], fontWeight: '700' },
  dangerCard: { borderWidth: 1 },
  dangerTitle: { fontWeight: '700' },
  dangerBody: { lineHeight: 20, marginTop: 4 },
  deleteButton: { alignSelf: 'flex-start', marginTop: 12 },
  notFound: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: { fontWeight: '700' },
  notFoundBody: { marginBottom: 8 },
  bottomPad: { height: 12 },
});
