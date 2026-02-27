import { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useAccounts } from '@guallet/api-react';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Label, Title, useTheme } from '@luna-ui/react-native';

function getAccountTypeLabel(type: AccountTypeDto): string {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return 'Current Accounts';
    case AccountTypeDto.CREDIT_CARD:
      return 'Credit Cards';
    case AccountTypeDto.SAVINGS:
      return 'Savings';
    case AccountTypeDto.INVESTMENT:
      return 'Investments';
    case AccountTypeDto.MORTGAGE:
      return 'Mortgages';
    case AccountTypeDto.LOAN:
      return 'Loans';
    case AccountTypeDto.PENSION:
      return 'Pensions';
    default:
      return 'Other';
  }
}

function formatBalance(amount: number, currency: string): string {
  try {
    return Money.fromCurrencyCode({ amount, currencyCode: currency }).format();
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function AccountRow({ account }: { account: AccountDto }) {
  const { colors } = useTheme();
  const balanceColor = account.balance.amount < 0 ? '#EF4444' : colors.text;

  return (
    <View style={styles.accountRow}>
      <View style={styles.accountInfo}>
        <Text style={[styles.accountName, { color: colors.text }]}>
          {account.name}
        </Text>
        <Label size="sm">{getAccountTypeLabel(account.type)}</Label>
      </View>
      <Text style={[styles.accountBalance, { color: balanceColor }]}>
        {formatBalance(account.balance.amount, account.currency)}
      </Text>
    </View>
  );
}

interface AccountGroup {
  type: AccountTypeDto;
  title: string;
  accounts: AccountDto[];
}

export function AccountListScreen() {
  const { accounts, isLoading } = useAccounts();

  const groupedAccounts = useMemo(() => {
    if (!accounts || accounts.length === 0) return [];

    const grouped = new Map<AccountTypeDto, AccountDto[]>();
    for (const account of accounts) {
      const existing = grouped.get(account.type) ?? [];
      existing.push(account);
      grouped.set(account.type, existing);
    }

    const typeOrder: AccountTypeDto[] = [
      AccountTypeDto.CURRENT_ACCOUNT,
      AccountTypeDto.CREDIT_CARD,
      AccountTypeDto.SAVINGS,
      AccountTypeDto.INVESTMENT,
      AccountTypeDto.MORTGAGE,
      AccountTypeDto.LOAN,
      AccountTypeDto.PENSION,
      AccountTypeDto.UNKNOWN,
    ];

    const groups: AccountGroup[] = [];
    for (const type of typeOrder) {
      const accs = grouped.get(type);
      if (accs && accs.length > 0) {
        groups.push({
          type,
          title: getAccountTypeLabel(type),
          accounts: accs,
        });
      }
    }

    return groups;
  }, [accounts]);

  return (
    <SafeAreaView style={styles.container}>
      <AppScreen headerTitle="Accounts" isLoading={isLoading}>
        {accounts.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Title>No accounts yet</Title>
            <Label center>
              Add your first account to start tracking your finances.
            </Label>
          </View>
        ) : (
          <FlatList
            data={groupedAccounts}
            keyExtractor={(item) => item.type}
            renderItem={({ item: group }) => (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>{group.title}</Text>
                {group.accounts.map((account) => (
                  <AccountRow key={account.id} account={account} />
                ))}
              </View>
            )}
          />
        )}
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
});
