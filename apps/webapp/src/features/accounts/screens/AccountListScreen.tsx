import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccounts } from '@guallet/api-react';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountRow } from '../components/AccountRow';
import { AccountsListHeader } from '../components/AccountsListHeader';
import { SearchableSectionListView, Section } from '@guallet/ui-react';

// We want the Current accounts first, then credit cards, then alphabetically, and last the unknown accounts
const compareAccountTypes = (
  a: Section<AccountDto>,
  b: Section<AccountDto>,
) => {
  const typeA = a.data[0].type;
  const typeB = b.data[0].type;

  if (typeA === typeB) {
    return 0;
  }

  if (typeA === AccountTypeDto.UNKNOWN) {
    return 1;
  }

  if (typeB === AccountTypeDto.UNKNOWN) {
    return -1;
  }

  if (typeA === AccountTypeDto.CURRENT_ACCOUNT) {
    return -1;
  }

  if (typeB === AccountTypeDto.CURRENT_ACCOUNT) {
    return 1;
  }

  return typeA.localeCompare(typeB);
};

function sectionWrapperTemplate(children: ReactNode) {
  return <Card className="rounded-lg border shadow-sm">{children}</Card>;
}

function sectionHeaderTemplate(section: Section<AccountDto>) {
  return (
    <AccountsListHeader
      accountType={section.data[0].type}
      accounts={section.data}
    />
  );
}

type AccountNavigate = ReturnType<typeof useNavigate>;

function createItemTemplate(navigation: AccountNavigate) {
  return function itemTemplate(account: AccountDto) {
    return (
      <AccountRow
        key={account.id}
        account={account}
        onClick={() => {
          navigation({
            to: '/accounts/$id',
            params: { id: account.id },
          });
        }}
      />
    );
  };
}

export function AccountListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigate();
  const { accounts, isLoading } = useAccounts();

  const groupedAccounts = useMemo<Section<AccountDto>[]>(() => {
    if (isLoading || !accounts) {
      return [] as Section<AccountDto>[];
    }

    const grouped = Object.groupBy(accounts, (account) => account.type);
    const groups = Object.entries(grouped).map(([type, accounts]) => ({
      title: type,
      data: accounts,
    }));
    groups.sort(compareAccountTypes);
    return groups;
  }, [accounts, isLoading]);

  const itemTemplate = useMemo(
    () => createItemTemplate(navigation),
    [navigation],
  );

  const emptyAccountsMessage = t(
    'screens.accounts.list.emptyQuery',
    'CFN: No bank accounts found',
  );

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="space-y-4">
        <Button
          type="button"
          onClick={() => {
            navigation({ to: '/accounts/new' });
          }}
        >
          Add new account
        </Button>
        <SearchableSectionListView<AccountDto>
          data={groupedAccounts}
          sectionWrapperTemplate={sectionWrapperTemplate}
          sectionHeaderTemplate={sectionHeaderTemplate}
          itemTemplate={itemTemplate}
          emptyView={
            <div className="space-y-2">
              <p>{emptyAccountsMessage}</p>
            </div>
          }
        />
      </div>
    </BaseScreen>
  );
}
