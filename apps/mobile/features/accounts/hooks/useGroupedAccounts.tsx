import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccounts } from '@guallet/api-react';

import { useMemo } from 'react';
// Note: useGroupedAccounts doesn't work on React native as Hermes doesnt support this.
// So use the classic accounts and then group them again
export function useGroupedAccounts() {
  const { accounts, ...rest } = useAccounts();

  const groupedAccounts = useMemo(() => {
    const grouped = accounts.reduce<Record<string, typeof accounts>>(
      (acc, account) => {
        const key = account.type;
        if (!acc[key]) acc[key] = [];
        acc[key].push(account);
        return acc;
      },
      {},
    );

    const groups = Object.entries(grouped).map(([type, accounts]) => ({
      type,
      accounts,
    }));

    groups.sort(compareAccountTypes);
    return groups;
  }, [accounts]);

  return {
    accounts: groupedAccounts,
    ...rest,
  };
}

const compareAccountTypes = (
  a: { type: string; accounts: AccountDto[] },
  b: { type: string; accounts: AccountDto[] },
) => {
  const typeA = a.type;
  const typeB = b.type;

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
