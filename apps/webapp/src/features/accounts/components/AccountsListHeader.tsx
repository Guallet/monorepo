import GroupHeader from '@/components/GroupHeader/GroupHeader';
import { getAccountTypeTitle } from '@/features/accounts/models/Account';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { Money } from '@guallet/money';
import 'core-js/actual/array/group-by';

interface HeaderProps {
  accountType: AccountTypeDto;
  accounts: AccountDto[];
}

function sumArray(array: number[]): number {
  const sum = array.reduce(function (a, b) {
    return Number(a) + Number(b);
  }, 0);

  return sum;
}

// TODO: Replace this with Object.groupBy when we can drop support for Node 16
function groupBy<T, K extends string | number | symbol>(
  array: T[],
  selector: (item: T) => K,
): Record<K, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = selector(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

export function AccountsListHeader({
  accountType,
  accounts,
}: Readonly<HeaderProps>) {
  function getTotalBalance(): string {
    const currencies = Object.entries(
      groupBy(accounts, (x: AccountDto) => x.currency),
    );

    if (currencies.length == 1) {
      // Display Single Balance
      const total = accounts.map((e) => +e.balance.amount);
      const sum = sumArray(total);

      const money = Money.fromCurrencyCode({
        amount: sum,
        currencyCode: currencies[0][0],
      });
      return money.format();
    } else if (currencies.length == 2) {
      // Display 2 Balances
      const balances = currencies.map((entry) => {
        const [currency, accounts] = entry;

        const total = accounts.map((e) => +e.balance.amount);
        const sum = sumArray(total);

        const money = Money.fromCurrencyCode({
          amount: sum,
          currencyCode: currency,
        });
        return money.format();
      });
      return balances.join(' + ');
    } else {
      // Don't display anything. Too many balances
      return '';
    }
  }

  return (
    <GroupHeader
      title={getAccountTypeTitle(accountType)}
      rightContent={getTotalBalance()}
    />
  );
}
