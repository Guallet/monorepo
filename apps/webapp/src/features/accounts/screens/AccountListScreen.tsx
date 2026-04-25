import { BaseScreen } from '@/components/Screens/BaseScreen';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccounts } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Button, Card, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountRow } from '../components/AccountRow';
import { AccountsEmptyState } from '../components/AccountsEmptyState';
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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => a.name.toLowerCase().includes(q));
  }, [accounts, searchQuery]);

  const groupedAccounts = useMemo<
    { type: AccountTypeDto; data: AccountDto[] }[]
  >(() => {
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

  function goToAddManualAccount() {
    navigate({ to: '/accounts/new' });
  }

  function goToConnectBank() {
    navigate({ to: '/connections/connect' });
  }

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('feature.accounts.list.title', 'Accounts')}
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: t(
          'feature.accounts.list.searchPlaceholder',
          'Search accounts...',
        ),
      }}
      actions={
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={goToAddManualAccount}
        >
          {t('feature.accounts.list.addAccount', 'Add account')}
        </Button>
      }
    >
      <Stack
        maw={1100}
        mx="auto"
        gap={spacing.md}
        pb={spacing.xl}
      >
        {!isLoading && (!accounts || accounts.length === 0) ? (
          <AccountsEmptyState
            onConnectBank={goToConnectBank}
            onAddManual={goToAddManualAccount}
          />
        ) : !isLoading &&
          accounts &&
          accounts.length > 0 &&
          groupedAccounts.length === 0 ? (
          <EmptyState
            title={t(
              'feature.accounts.list.emptyQuery.title',
              'No matching accounts',
            )}
            description={t(
              'feature.accounts.list.emptyQuery.description',
              'Try a different search term or clear the current filter to see all your accounts.',
            )}
            primaryAction={{
              label: t(
                'feature.accounts.list.emptyQuery.clearSearch',
                'Clear search',
              ),
              onClick: () => setSearchQuery(''),
            }}
          />
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
                      navigate({
                        to: '/accounts/$id',
                        params: { id: account.id },
                      })
                    }
                  />
                ))}
              </Card>
            ))}

            {accounts && accounts.length > 0 && (
              <AddAccountCta
                onConnectBank={goToConnectBank}
                onAddManual={goToAddManualAccount}
              />
            )}
          </>
        )}
      </Stack>
    </BaseScreen>
  );
}
