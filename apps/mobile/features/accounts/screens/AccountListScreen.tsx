import Ionicons from '@expo/vector-icons/Ionicons';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import {
  Button,
  Label,
  Stack,
  useTheme,
  Group,
  GroupHeader,
  Divider,
} from '@luna-ui/react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  SectionList,
  SectionListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppScreen } from '@/components/layout/AppScreen';

import { useGroupedAccounts } from '../hooks/useGroupedAccounts';
import { AccountRow } from '../components/AccountRow';
import { useDefaultCurrency } from '@/features/settings/hooks/useDefaultCurrency';
import { Money } from '@guallet/money';

type AccountSection = {
  type: string;
  title: string;
  data: AccountDto[];
  totalLabel: string;
};

const ACCOUNT_TYPE_LABELS: Record<AccountTypeDto, string> = {
  [AccountTypeDto.CURRENT_ACCOUNT]: 'Current Accounts',
  [AccountTypeDto.CREDIT_CARD]: 'Credit Cards',
  [AccountTypeDto.SAVINGS]: 'Savings',
  [AccountTypeDto.INVESTMENT]: 'Investments',
  [AccountTypeDto.MORTGAGE]: 'Mortgages',
  [AccountTypeDto.LOAN]: 'Loans',
  [AccountTypeDto.PENSION]: 'Pensions',
  [AccountTypeDto.UNKNOWN]: 'Other Accounts',
};

export function AccountListScreen() {
  const { accounts, isLoading } = useGroupedAccounts();
  const { spacing, colors } = useTheme();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<AccountTypeDto[]>([]);

  const defaultCurrency = useDefaultCurrency();

  const availableTypes = useMemo(() => {
    const uniqueTypes = accounts.map((group) => group.type as AccountTypeDto);
    return Array.from(new Set(uniqueTypes));
  }, [accounts]);

  const filteredGroups = useMemo(() => {
    if (!selectedTypes.length) return accounts;
    return accounts.filter((group) =>
      selectedTypes.includes(group.type as AccountTypeDto),
    );
  }, [accounts, selectedTypes]);

  const sections: AccountSection[] = useMemo(
    () =>
      filteredGroups.map((group) => ({
        type: group.type,
        title: ACCOUNT_TYPE_LABELS[group.type as AccountTypeDto] ?? 'Accounts',
        data: group.accounts,
        totalLabel: formatTotals(group.accounts),
      })),
    [filteredGroups],
  );

  const toggleType = useCallback((type: AccountTypeDto) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type],
    );
  }, []);

  const renderAccount = useCallback(
    ({ item }: SectionListRenderItemInfo<AccountDto, AccountSection>) => {
      const currency = item.currency;
      const amount = item.balance?.amount ?? 0;

      return (
        <Group
          style={[
            styles.accountCard,
            {
              padding: spacing.md,
              gap: spacing.xs,
            },
          ]}
        >
          <Label style={styles.accountName}>{item.name}</Label>
          <Label style={[styles.accountBalance, { color: colors.primary }]}>
            {formatCurrency(amount, currency)}
          </Label>
        </Group>
      );
    },
    [colors.primary, spacing.md, spacing.xs],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: AccountSection }) => (
      <View
        style={[
          styles.sectionHeader,
          {
            paddingTop: spacing.lg,
            paddingBottom: spacing.sm,
          },
        ]}
      >
        <Label style={styles.sectionTitle}>{section.title}</Label>
        <Label style={[styles.sectionTotal, { color: colors.darkAccent }]}>
          {section.totalLabel}
        </Label>
      </View>
    ),
    [colors.darkAccent, spacing.lg, spacing.sm],
  );

  return (
    <AppScreen
      isLoading={isLoading}
      headerTitle="Accounts"
      headerOptions={{
        headerRight: () => (
          <TouchableOpacity
            onPress={() => setIsFilterOpen((prev) => !prev)}
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
            }}
          >
            <Group align="center" gap="xs">
              <Ionicons
                name={isFilterOpen ? 'close-outline' : 'filter-outline'}
                size={22}
                color={colors.primary}
              />
              <Label color={colors.primary}>
                {selectedTypes.length
                  ? `Filter (${selectedTypes.length})`
                  : 'Filter'}
              </Label>
            </Group>
          </TouchableOpacity>
        ),
      }}
    >
      <View style={{ flex: 1 }}>
        {isFilterOpen && (
          <Stack
            gap="sm"
            style={[
              styles.filterPanel,
              {
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Label style={styles.filterLabel}>Filter by type</Label>
            <Group gap="sm" wrap="wrap">
              {availableTypes.map((type) => {
                const isSelected = selectedTypes.includes(type);
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => toggleType(type)}
                    style={[
                      styles.chip,
                      {
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        borderColor: isSelected ? colors.primary : '#e5e7eb',
                        backgroundColor: isSelected
                          ? colors.lightAccent
                          : '#f8fafc',
                      },
                    ]}
                  >
                    <Label
                      style={{
                        color: isSelected ? colors.darkAccent : '#111827',
                        fontWeight: '600',
                      }}
                    >
                      {ACCOUNT_TYPE_LABELS[type]}
                    </Label>
                  </TouchableOpacity>
                );
              })}
            </Group>
            <Group justify="space-between" gap="sm">
              <Button
                variant="subtle"
                onClick={() => setSelectedTypes([])}
                disabled={!selectedTypes.length}
              >
                Reset
              </Button>
              <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
                Done
              </Button>
            </Group>
          </Stack>
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <AccountRow accountId={item.id} displayBalance />
          )}
          // renderSectionHeader={renderSectionHeader}
          renderSectionHeader={({ section }: { section: AccountSection }) => {
            return (
              <GroupHeader
                title={section.title}
                rightContent={section.totalLabel}
              />
            );
          }}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xl,
            paddingTop: spacing.sm,
          }}
          // ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderSectionFooter={() => (
            <View
              style={{
                height: spacing.md,
                backgroundColor: 'white',
                borderBottomStartRadius: spacing.md,
                borderBottomEndRadius: spacing.md,
                marginBottom: spacing.sm,
              }}
            />
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View style={{ padding: spacing.lg }}>
                <Label style={styles.emptyStateTitle}>No accounts yet</Label>
                <Label style={styles.emptyStateBody}>
                  Add an account to see it listed here.
                </Label>
              </View>
            ) : null
          }
        />
      </View>
    </AppScreen>
  );
}

type CurrencyTotals = Record<string, number>;

const calculateTotals = (items: AccountDto[]): CurrencyTotals =>
  items.reduce<CurrencyTotals>((acc, account) => {
    const currency = account.currency;
    const amount = Number(account.balance?.amount ?? 0);
    acc[currency] = (acc[currency] ?? 0) + amount;
    return acc;
  }, {} as CurrencyTotals);

const formatTotals = (items: AccountDto[]) => {
  const totals = calculateTotals(items);
  return Object.entries(totals)
    .map(([currency, amount]) =>
      Money.fromCurrencyCode({
        currencyCode: currency,
        amount: amount,
      }).format(),
    )
    .join(' / ');
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: '700',
  },
  accountMeta: {
    fontSize: 13,
    color: '#6b7280',
  },
  filterPanel: {
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptyStateBody: {
    fontSize: 14,
    color: '#6b7280',
  },
});
