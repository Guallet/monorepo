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
import { EmptyState, Label, ListRow, useTheme } from '@luna-ui/react-native';
import { useRouter } from 'expo-router';

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
  const router = useRouter();
  const balanceColor = account.balance.amount < 0 ? '#EF4444' : colors.text;

  return (
    <ListRow
      title={account.name}
      subtitle={getAccountTypeLabel(account.type)}
      onPress={() => router.push(`/account/${account.id}`)}
      right={
        <Text style={[styles.accountBalance, { color: balanceColor }]}>
          {formatBalance(account.balance.amount, account.currency)}
        </Text>
      }
    />
  );
}

interface AccountGroup {
  type: AccountTypeDto;
  title: string;
  accounts: AccountDto[];
}

export function AccountListScreen() {
  const { accounts, isLoading } = useAccounts();
  const router = useRouter();

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
      <AppScreen
        headerTitle="Accounts"
        isLoading={isLoading}
        headerOptions={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/account/new')}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>+</Text>
            </TouchableOpacity>
          ),
        }}
      >
        {accounts.length === 0 && !isLoading ? (
          <EmptyState
            title="No accounts yet"
            message="Add your first account to start tracking your finances."
          />
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
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: '400',
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
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
});
