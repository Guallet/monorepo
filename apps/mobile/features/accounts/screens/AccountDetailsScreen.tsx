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
import { AccountAvatar } from '../components/AccountAvatar';
import { AccountTypeIcon } from '../components/AccountTypeIcon';
import { formatAccountCurrency, getAccountTypeLabel } from '../models/account';
import { getVisibleAccountProperties } from '../models/accountProperties';
import { getMonthlyInOut, isManualAccount } from '../models/accountFlow';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';
import { useTranslation } from 'react-i18next';

function getId(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function AccountDetailsScreen() {
  const { t } = useTranslation();
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = getId(rawId);
  const router = useRouter();
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { dateFormat, languageTag } = useMobileUserPreferences();
  const { account, error, isError, isLoading, refetch } = useAccount(id);
  const chartQuery = useAccountCharts(id);
  const { data: chartData, isLoading: isChartLoading } = chartQuery;
  const transactionQuery = useAccountTransactions(id);
  const { transactions } = transactionQuery;
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
  const monthlyData = getMonthlyInOut(chartData?.chart ?? []);
  const accountProperties = account ? getVisibleAccountProperties(account) : [];

  function confirmDelete() {
    if (!account) return;
    Alert.alert(
      t('Delete {{name}}?', { name: account.name }),
      t(
        'This removes the account and its transactions. This action cannot be undone.',
      ),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete account'),
          style: 'destructive',
          onPress: () => {
            void deleteAccountMutation
              .mutateAsync({ id })
              .then(() => router.replace('/(protected)/(tabs)/accounts'))
              .catch(() =>
                Alert.alert(
                  t('Couldn’t delete account'),
                  t('Please try again in a moment.'),
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
      <AppScreen headerTitle={t('copy_oyp43g')}>
        <View style={styles.notFound}>
          <Text
            style={[
              styles.notFoundTitle,
              { color: colors.text.primary, fontSize: typography.sizes.lg },
            ]}
          >
            {t('copy_14kn65g')}
          </Text>
          <Text
            style={[
              styles.notFoundBody,
              { color: colors.text.secondary, fontSize: typography.sizes.sm },
            ]}
          >
            {t('copy_k8irws')}
          </Text>
          <Button onClick={() => void refetch()} variant="outline">
            {t('copy_982hh6')}
          </Button>
        </View>
      </AppScreen>
    );
  }

  if (!isLoading && !account) {
    return (
      <AppScreen headerTitle={t('copy_oyp43g')}>
        <View style={styles.notFound}>
          <Text
            style={[
              styles.notFoundTitle,
              { color: colors.text.primary, fontSize: typography.sizes.lg },
            ]}
          >
            {t('copy_kyuo8x')}
          </Text>
          <Text
            style={[
              styles.notFoundBody,
              { color: colors.text.secondary, fontSize: typography.sizes.sm },
            ]}
          >
            {t('copy_1rw4fu4')}
          </Text>
          <Button onClick={() => router.back()} variant="outline">
            {t('copy_rcg61q')}
          </Button>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      headerOptions={{
        headerRight: () =>
          account && isManualAccount(account) ? (
            <Pressable
              accessibilityLabel={t('copy_1o8ro3q')}
              accessibilityRole="button"
              onPress={() => router.push(`/accounts/${id}/edit`)}
            >
              <Text
                style={[styles.headerAction, { color: colors.accent.primary }]}
              >
                {t('copy_1i1lcq9')}
              </Text>
            </Pressable>
          ) : null,
      }}
      headerTitle={account?.name ?? 'Account'}
      isLoading={isLoading}
      loadingMessage={t('copy_gyilum')}
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
              <AccountAvatar account={account} size={58} />
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
              {t('copy_162r3c2')}
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
                {t('copy_1rosjw3')}
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
                {t('copy_1ynxzsa')}
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
            ) : chartQuery.isError ? (
              <Button
                onClick={() => void chartQuery.refetch()}
                variant="outline"
              >
                {t('copy_3wmvo2')}
              </Button>
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
                {t('copy_z9og1m')}
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
                      {formatPreferenceDate(
                        `${point.date}T12:00:00`,
                        dateFormat,
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
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text.primary, fontSize: typography.sizes.lg },
              ]}
            >
              {t('copy_9e286o')}
            </Text>
            {isChartLoading && (
              <Text style={{ color: colors.text.secondary }}>
                {t('copy_7e4iy3')}
              </Text>
            )}
            {chartQuery.isError && (
              <Button
                onClick={() => void chartQuery.refetch()}
                variant="outline"
              >
                {t('copy_982hh6')}
              </Button>
            )}
            {!isChartLoading &&
              !chartQuery.isError &&
              monthlyData.length === 0 && (
                <Text style={{ color: colors.text.secondary }}>
                  {t('copy_14e2io0')}
                </Text>
              )}
            {monthlyData.map((month) => (
              <View
                key={`${month.year}-${month.month}`}
                style={[
                  styles.monthRow,
                  { borderTopColor: colors.surface.border.primary },
                ]}
              >
                <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                  {new Intl.DateTimeFormat(languageTag, {
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date(month.year, month.month, 1))}
                </Text>
                <View style={styles.monthAmounts}>
                  <Text
                    style={[
                      styles.monthAmount,
                      { color: colors.support.primary },
                    ]}
                  >
                    +{formatAccountCurrency(month.total_in, account.currency)}
                  </Text>
                  <Text
                    style={[styles.monthAmount, { color: colors.status.error }]}
                  >
                    −
                    {formatAccountCurrency(
                      Math.abs(month.total_out),
                      account.currency,
                    )}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {accountProperties.length > 0 && (
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
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text.primary, fontSize: typography.sizes.lg },
                ]}
              >
                {t('copy_fq47pe')}
              </Text>
              {accountProperties.map((property) => (
                <View
                  key={property.label}
                  style={[
                    styles.monthRow,
                    { borderTopColor: colors.surface.border.primary },
                  ]}
                >
                  <Text style={{ color: colors.text.secondary }}>
                    {t(property.label)}
                  </Text>
                  <Text
                    style={{ color: colors.text.primary, fontWeight: '600' }}
                  >
                    {property.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

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
                {t('copy_1a6an0y')}
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
                {recentTransactions.length}
                {t('copy_1l7ac5y')}
              </Text>
            </View>
            {transactionQuery.isLoading ? (
              <Text style={{ color: colors.text.secondary }}>
                {t('copy_1uajv76')}
              </Text>
            ) : transactionQuery.isError ? (
              <Button
                onClick={() => void transactionQuery.refetch()}
                variant="outline"
              >
                {t('copy_1elfhrb')}
              </Button>
            ) : recentTransactions.length === 0 ? (
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                  },
                ]}
              >
                {t('copy_6f6bb3')}
              </Text>
            ) : (
              recentTransactions.map((transaction) => {
                const isIncome = transaction.amount >= 0;
                return (
                  <Pressable
                    key={transaction.id}
                    accessibilityRole="button"
                    accessibilityLabel={
                      transaction.description
                        ? t('Open {{description}}', {
                            description: transaction.description,
                          })
                        : t('Open transaction')
                    }
                    onPress={() =>
                      router.push(`/transactions/${transaction.id}`)
                    }
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
                        {formatPreferenceDate(transaction.date, dateFormat)}
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
                  </Pressable>
                );
              })
            )}
            <Button
              onClick={() =>
                router.push({
                  pathname: '/(protected)/(tabs)/transactions',
                  params: { accountId: id },
                })
              }
              variant="subtle"
            >
              {t('copy_1qg2904')}
            </Button>
          </View>

          {isManualAccount(account) && (
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
                {t('copy_t42th0')}
              </Text>
              <Text
                style={[
                  styles.dangerBody,
                  {
                    color: colors.text.secondary,
                    fontSize: typography.sizes.sm,
                  },
                ]}
              >
                {t('copy_j0efj1')}
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
                {deleteAccountMutation.isPending
                  ? 'Deleting…'
                  : 'Delete account'}
              </Button>
            </View>
          )}
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
  monthRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  monthAmounts: { alignItems: 'flex-end', gap: 4 },
  monthAmount: { fontVariant: ['tabular-nums'], fontWeight: '600' },
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
