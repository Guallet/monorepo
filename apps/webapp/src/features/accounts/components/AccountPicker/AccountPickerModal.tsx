import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { SearchBoxInput } from '@guallet/ui-react';
import { useMemo, useState } from 'react';
import { AccountCheckbox } from './AccountCheckbox';
import { IconDeselect, IconSelectAll } from '@tabler/icons-react';
import { getAccountTypeTitle } from '../../models/Account';
import { Button } from '@/components/ui/button';

interface AccountsPickerModalProps {
  accounts: AccountDto[];
  selectedAccounts: AccountDto[];
  onSelectAccounts: (accounts: AccountDto[]) => void;
  onCancel: () => void;
}

export function AccountPickerModal({
  accounts,
  selectedAccounts,
  onSelectAccounts,
  onCancel,
}: Readonly<AccountsPickerModalProps>) {
  const [query, setQuery] = useState('');

  const filteredAccounts = useMemo(() => {
    if (!query) {
      return accounts;
    }
    const normalizedQuery = query.toLowerCase();
    return accounts.filter((account) =>
      account.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query, accounts]);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    selectedAccounts.map((account) => account.id),
  );

  const groupedAccounts = useMemo(() => {
    const groups: { type: AccountTypeDto; items: AccountDto[] }[] = [];

    for (const account of filteredAccounts) {
      const existingGroup = groups.find((group) => group.type === account.type);
      if (existingGroup) {
        existingGroup.items.push(account);
      } else {
        groups.push({ type: account.type, items: [account] });
      }
    }

    return groups;
  }, [filteredAccounts]);

  function setAccountSelected(accountId: string, checked: boolean) {
    setSelectedIds((currentIds) => {
      const idSet = new Set(currentIds);
      if (checked) {
        idSet.add(accountId);
      } else {
        idSet.delete(accountId);
      }
      return [...idSet];
    });
  }

  function deselectAll() {
    setSelectedIds([]);
  }

  function selectAll() {
    setSelectedIds(accounts.map((account) => account.id));
  }

  return (
    <div className="w-full space-y-3 sm:w-[30rem]">
      <div className="flex items-center gap-2">
        <SearchBoxInput
          style={{ flexGrow: 1 }}
          query={query}
          onSearchQueryChanged={(newQuery) => {
            setQuery(newQuery);
          }}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Select all"
          onClick={selectAll}
        >
          <IconSelectAll />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Clear all"
          onClick={deselectAll}
        >
          <IconDeselect />
        </Button>
      </div>

      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {filteredAccounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts found</p>
        ) : null}

        {groupedAccounts.map((group) => (
          <div key={group.type} className="space-y-2">
            <p className="text-sm font-medium">
              {getAccountTypeTitle(group.type)}
            </p>
            <div className="space-y-1">
              {group.items.map((account) => (
                <AccountCheckbox
                  key={account.id}
                  account={account}
                  checked={selectedIds.includes(account.id)}
                  onCheckedChange={(checked) => {
                    setAccountSelected(account.id, checked);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={() => {
            onSelectAccounts(
              accounts.filter((account) => selectedIds.includes(account.id)),
            );
          }}
        >
          Select
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
