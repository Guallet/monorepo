import { BaseScreen } from '@/components/Screens/BaseScreen';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccounts } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Card, Stack } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { AccountRow } from '../components/AccountRow';
import { AccountsEmptyState } from '../components/AccountsEmptyState';
import { AccountsHeader } from '../components/AccountsHeader';
import { AccountsListHeader } from '../components/AccountsListHeader';
import { AddAccountCta } from '../components/AddAccountCta';
import { NetWorthSummary } from '../components/NetWorthSummary';

const GROUP_ORDER: AccountTypeDto[] = [
  AccountTypeDto.CURRENT_ACCOUNT,
  AccountTypeDto.SAVINGS,
  AccountTypeDto.CREDIT_CARD,
  AccountTypeDto.INVESTMENT,
  AccountTypeDto.MORTGAGE,
  AccountTypeDto.LOAN,
  AccountTypeDto.PENSION,
  AccountTypeDto.UNKNOWN,
];

export function AccountListScreen() {
  const navigate = useNavigate();
  const { accounts, isLoading } = useAccounts();
  const { spacing } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => a.name.toLowerCase().includes(q));
  }, [accounts, searchQuery]);

  const groupedAccounts = useMemo<{ type: AccountTypeDto; data: AccountDto[] }[]>(() => {
    const map: Record<string, AccountDto[]> = {};
    for (const account of filteredAccounts) {
      if (!map[account.type]) map[account.type] = [];
      map[account.type].push(account);
    }
    return GROUP_ORDER.filter((type) => map[type]?.length > 0).map((type) => ({
      type,
      data: map[type],
    }));
  }, [filteredAccounts]);

  function goToAddAccount() {
    navigate({ to: '/accounts/new' });
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <AccountsHeader
        onAddNewAccount={goToAddAccount}
        onSearchQueryChanged={setSearchQuery}
      />
      <Stack
        maw={1100}
        mx="auto"
        gap={spacing.md}
        pt={spacing.md}
        pb={spacing.xl}
      >
        {!isLoading && (!accounts || accounts.length === 0) ? (
          <AccountsEmptyState onAdd={goToAddAccount} />
        ) : (
          <>
            {accounts && accounts.length > 0 && (
              <NetWorthSummary accounts={accounts} />
            )}

            {groupedAccounts.map(({ type, data }) => (
              <Card key={type} withBorder shadow="sm" radius="lg" p={0}>
                <AccountsListHeader accountType={type} accounts={data} />
                {data.map((account, i) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    isLast={i === data.length - 1}
                    onClick={() =>
                      navigate({ to: '/accounts/$id', params: { id: account.id } })
                    }
                  />
                ))}
              </Card>
            ))}

            {accounts && accounts.length > 0 && (
              <AddAccountCta onAdd={goToAddAccount} />
            )}
          </>
        )}
      </Stack>
    </BaseScreen>
  );
}
