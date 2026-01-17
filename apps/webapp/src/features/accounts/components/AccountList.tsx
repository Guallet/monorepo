import 'core-js';
import { AccountRow } from './AccountRow';
import { AccountsListHeader } from './AccountsListHeader';
import { Box, Card, Divider, Space } from '@mantine/core';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';

interface Props {
  accounts: AccountDto[];
  onAccountSelected: (account: AccountDto) => void;
}

// TODO: Replace this with Object.groupBy when we can drop support for Node 16
function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keySelector: (item: T) => K,
): Record<K, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = keySelector(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

function compareAccountTypes(a: string, b: string) {
  if (a === b) {
    return 0;
  }

  if (a === AccountTypeDto.UNKNOWN) {
    return 1;
  }

  if (b === AccountTypeDto.UNKNOWN) {
    return -1;
  }

  if (a === AccountTypeDto.CURRENT_ACCOUNT) {
    return -1;
  }

  if (b === AccountTypeDto.CURRENT_ACCOUNT) {
    return 1;
  }

  return a.localeCompare(b);
}

export function AccountsList({ accounts, onAccountSelected }: Readonly<Props>) {
  const data = groupBy(accounts, (account: AccountDto) => {
    return account.type;
  });

  return (
    <>
      {Object.entries(data)
        .sort((a, b) => {
          return compareAccountTypes(a[0], b[0]);
        })
        .map(([key, value]) => (
          <Box key={key}>
            <>
              <AccountsListHeader
                accountType={key as AccountTypeDto}
                accounts={value}
              />
              <Space h="xs" />
              <Card withBorder shadow="sm" radius="lg">
                {value.map(
                  (account: AccountDto, index: number, array: AccountDto[]) => {
                    return (
                      <>
                        <AccountRow
                          key={account.id}
                          account={account}
                          onClick={() => {
                            onAccountSelected(account);
                          }}
                        />
                        {index < array.length - 1 && <Divider />}
                      </>
                    );
                  },
                )}
              </Card>
            </>
          </Box>
        ))}
    </>
  );
}
