import { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccounts } from '@guallet/api-react';
import { Button, TextInput, useTheme } from '@guallet/luna-mobile';
import { AccountRow } from '../components/AccountRow';
import { AccountsSummary } from '../components/AccountsSummary';
import { AccountTypeIcon } from '../components/AccountTypeIcon';
import {
  ACCOUNT_TYPE_ORDER,
  formatAccountCurrency,
  getAccountTypeLabel,
} from '../models/account';

type AccountGroup = {
  type: AccountTypeDto;
  accounts: AccountDto[];
};

export default function AccountsScreen() {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const router = useRouter();
  const { accounts, isLoading, isError, isRefetching, refetch } = useAccounts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return accounts;
    return accounts.filter((account) =>
      account.name.toLowerCase().includes(query),
    );
  }, [accounts, searchQuery]);

  const groups = useMemo<AccountGroup[]>(() => {
    return ACCOUNT_TYPE_ORDER.map((type) => ({
      type,
      accounts: filteredAccounts.filter((account) => account.type === type),
    })).filter((group) => group.accounts.length > 0);
  }, [filteredAccounts]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: colors.surface.background.page },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.md, padding: spacing.md },
        ]}
        refreshControl={
          <RefreshControl
            onRefresh={() => void refetch()}
            refreshing={isRefetching}
            tintColor={colors.accent.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ gap: spacing.xs }}>
            <Text
              style={[
                styles.title,
                { color: colors.text.primary, fontSize: typography.sizes.xxl },
              ]}
            >
              Accounts
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colors.text.secondary, fontSize: typography.sizes.sm },
              ]}
            >
              Everything you own, in one place
            </Text>
          </View>
          <Button
            onClick={() => router.push('/accounts/new')}
            style={styles.addButton}
          >
            + Add
          </Button>
        </View>

        {isLoading ? (
          <View
            style={[
              styles.loadingCard,
              {
                backgroundColor: colors.surface.background.secondary,
                borderRadius: borderRadius.lg,
              },
            ]}
          />
        ) : isError ? (
          <View
            style={[
              styles.messageCard,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <Text
              style={[
                styles.messageTitle,
                { color: colors.text.primary, fontSize: typography.sizes.lg },
              ]}
            >
              Couldn’t load accounts
            </Text>
            <Text
              style={[
                styles.messageBody,
                { color: colors.text.secondary, fontSize: typography.sizes.sm },
              ]}
            >
              Check your connection and try again.
            </Text>
            <Button
              onClick={() => void refetch()}
              variant="outline"
              style={styles.messageButton}
            >
              Try again
            </Button>
          </View>
        ) : accounts.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: colors.button.secondary.default,
                  borderRadius: borderRadius.xl,
                },
              ]}
            >
              <AccountTypeIcon
                color={colors.accent.primary}
                size={30}
                type={AccountTypeDto.CURRENT_ACCOUNT}
              />
            </View>
            <Text
              style={[
                styles.messageTitle,
                { color: colors.text.primary, fontSize: typography.sizes.lg },
              ]}
            >
              No accounts yet
            </Text>
            <Text
              style={[
                styles.messageBody,
                { color: colors.text.secondary, fontSize: typography.sizes.sm },
              ]}
            >
              Add your first account to start tracking your money and see your
              net worth here.
            </Text>
            <Button
              onClick={() => router.push('/accounts/new')}
              style={styles.fullButton}
            >
              Add your first account
            </Button>
          </View>
        ) : (
          <>
            <AccountsSummary accounts={accounts} />
            <TextInput
              label="Search accounts"
              onChangeText={setSearchQuery}
              placeholder="Search by account name"
              value={searchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {groups.length === 0 ? (
              <View
                style={[
                  styles.noResults,
                  {
                    backgroundColor: colors.surface.background.primary,
                    borderColor: colors.surface.border.primary,
                    borderRadius: borderRadius.lg,
                    padding: spacing.lg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.messageTitle,
                    {
                      color: colors.text.primary,
                      fontSize: typography.sizes.lg,
                    },
                  ]}
                >
                  No matching accounts
                </Text>
                <Text
                  style={[
                    styles.messageBody,
                    {
                      color: colors.text.secondary,
                      fontSize: typography.sizes.sm,
                    },
                  ]}
                >
                  Try another search term or clear the search.
                </Text>
                <Pressable onPress={() => setSearchQuery('')}>
                  <Text
                    style={[
                      styles.clearSearch,
                      {
                        color: colors.accent.primary,
                        fontSize: typography.sizes.sm,
                      },
                    ]}
                  >
                    Clear search
                  </Text>
                </Pressable>
              </View>
            ) : (
              groups.map((group) => (
                <AccountGroup
                  key={group.type}
                  group={group}
                  onAccountPress={(id) => router.push(`/accounts/${id}`)}
                />
              ))
            )}
          </>
        )}
        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

function AccountGroup({
  group,
  onAccountPress,
}: Readonly<{ group: AccountGroup; onAccountPress: (id: string) => void }>) {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const totals = new Map<string, number>();
  for (const account of group.accounts) {
    totals.set(
      account.currency,
      (totals.get(account.currency) ?? 0) + Number(account.balance.amount),
    );
  }

  return (
    <View
      style={[
        styles.groupCard,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
        },
      ]}
    >
      <View
        style={[
          styles.groupHeader,
          {
            borderBottomColor: colors.surface.border.primary,
            padding: spacing.md,
          },
        ]}
      >
        <View
          style={[
            styles.groupIcon,
            {
              backgroundColor: colors.button.secondary.default,
              borderRadius: borderRadius.md,
            },
          ]}
        >
          <AccountTypeIcon
            color={colors.accent.primary}
            size={20}
            type={group.type}
          />
        </View>
        <View style={styles.groupTitle}>
          <Text
            style={[
              styles.groupName,
              { color: colors.text.primary, fontSize: typography.sizes.md },
            ]}
          >
            {getAccountTypeLabel(group.type)}
          </Text>
          <Text
            style={[
              styles.groupMeta,
              { color: colors.text.secondary, fontSize: typography.sizes.xs },
            ]}
          >
            {group.accounts.length}{' '}
            {group.accounts.length === 1 ? 'account' : 'accounts'}
          </Text>
        </View>
        <View style={styles.groupTotals}>
          {[...totals.entries()].map(([currency, amount]) => (
            <Text
              key={currency}
              style={[
                styles.groupTotal,
                {
                  color: amount < 0 ? colors.status.error : colors.text.primary,
                  fontSize: typography.sizes.sm,
                },
              ]}
            >
              {formatAccountCurrency(amount, currency)}
            </Text>
          ))}
        </View>
      </View>
      {group.accounts.map((account) => (
        <AccountRow
          key={account.id}
          account={account}
          onPress={() => onAccountPress(account.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontWeight: '700', letterSpacing: -0.5 },
  subtitle: {},
  addButton: { minWidth: 78 },
  loadingCard: { height: 170 },
  messageCard: { alignItems: 'center', borderWidth: 1, padding: 24 },
  emptyCard: { alignItems: 'center', borderWidth: 1, gap: 10 },
  emptyIcon: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    marginBottom: 4,
    width: 64,
  },
  messageTitle: { fontWeight: '700', textAlign: 'center' },
  messageBody: { lineHeight: 21, maxWidth: 300, textAlign: 'center' },
  messageButton: { marginTop: 4, minWidth: 120 },
  fullButton: { alignSelf: 'stretch', marginTop: 8 },
  noResults: { alignItems: 'center', borderWidth: 1, gap: 8 },
  clearSearch: { fontWeight: '600', marginTop: 4 },
  groupCard: { borderWidth: 1, overflow: 'hidden' },
  groupHeader: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
  },
  groupIcon: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  groupTitle: { flex: 1, gap: 2 },
  groupName: { fontWeight: '700' },
  groupMeta: {},
  groupTotals: { alignItems: 'flex-end', gap: 2, maxWidth: '45%' },
  groupTotal: { fontVariant: ['tabular-nums'], fontWeight: '700' },
  bottomPad: { height: 16 },
});
