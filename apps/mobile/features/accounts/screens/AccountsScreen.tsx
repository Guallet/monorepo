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
import { AccountTypeDto } from '@guallet/api-client';
import { useAccounts } from '@guallet/api-react';
import { Button, TextInput, useTheme } from '@guallet/luna-mobile';
import { AccountRow } from '../components/AccountRow';
import { AccountsSummary } from '../components/AccountsSummary';
import { AccountTypeIcon } from '../components/AccountTypeIcon';
import { formatAccountCurrency, getAccountTypeLabel } from '../models/account';
import {
  groupAccounts,
  type AccountGroup as AccountGroupModel,
} from '../models/accountFlow';
import { useTranslation } from 'react-i18next';

export default function AccountsScreen() {
  const { t } = useTranslation();
  const { colors, borderRadius, spacing, typography } = useTheme();
  const router = useRouter();
  const { accounts, isLoading, isError, isRefetching, refetch } = useAccounts();
  const [searchQuery, setSearchQuery] = useState('');

  const groups = useMemo(
    () => groupAccounts(accounts, searchQuery),
    [accounts, searchQuery],
  );

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
              {t('copy_dpi1wd')}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colors.text.secondary, fontSize: typography.sizes.sm },
              ]}
            >
              {t('copy_kq680j')}
            </Text>
          </View>
          <Button
            onClick={() => router.push('/accounts/new')}
            style={styles.addButton}
          >
            {t('copy_18nj8pp')}
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
              {t('copy_1jvr9h1')}
            </Text>
            <Text
              style={[
                styles.messageBody,
                { color: colors.text.secondary, fontSize: typography.sizes.sm },
              ]}
            >
              {t('copy_k8irws')}
            </Text>
            <Button
              onClick={() => void refetch()}
              variant="outline"
              style={styles.messageButton}
            >
              {t('copy_982hh6')}
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
              {t('copy_tgwavs')}
            </Text>
            <Text
              style={[
                styles.messageBody,
                { color: colors.text.secondary, fontSize: typography.sizes.sm },
              ]}
            >
              {t('copy_klt7l3')}
            </Text>
            <Button
              onClick={() => router.push('/accounts/new')}
              style={styles.fullButton}
            >
              {t('copy_1693j1i')}
            </Button>
          </View>
        ) : (
          <>
            <AccountsSummary accounts={accounts} />
            <TextInput
              label={t('copy_pmai9j')}
              onChangeText={setSearchQuery}
              placeholder={t('copy_1v3hiwk')}
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
                  {t('copy_de888f')}
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
                  {t('copy_1kq085o')}
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
                    {t('copy_ozrfba')}
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
}: Readonly<{
  group: AccountGroupModel;
  onAccountPress: (id: string) => void;
}>) {
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
