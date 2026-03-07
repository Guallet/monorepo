import 'core-js';
import { AccountRow } from './AccountRow';
import { AccountsListHeader } from './AccountsListHeader';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';

interface Props {
  accounts: AccountDto[];
  onAccountSelected: (account: AccountDto) => void;
}

// Compatibility helper until runtime support for Object.groupBy is guaranteed.
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
          <div key={key} className="space-y-2">
            <AccountsListHeader
              accountType={key as AccountTypeDto}
              accounts={value}
            />

            <Card className="rounded-lg border shadow-sm">
              {value.map(
                (account: AccountDto, index: number, array: AccountDto[]) => {
                  return (
                    <div key={account.id}>
                      <AccountRow
                        account={account}
                        onClick={() => {
                          onAccountSelected(account);
                        }}
                      />
                      {index < array.length - 1 ? <Separator /> : null}
                    </div>
                  );
                },
              )}
            </Card>
          </div>
        ))}
    </>
  );
}
