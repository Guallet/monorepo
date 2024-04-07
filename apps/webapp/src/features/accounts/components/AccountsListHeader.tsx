import GroupHeader from "@/components/GroupHeader/GroupHeader";
import { AccountType, getAccountTypeTitle } from "@accounts/models/Account";
import { AccountDto } from "@guallet/api-client";
import { Money } from "@guallet/money";
import "core-js/actual/array/group-by";

interface HeaderProps {
  accountType: AccountType;
  accounts: AccountDto[];
}

export function AccountsListHeader({ accountType, accounts }: HeaderProps) {
  function sumArray(array: number[]): number {
    const sum = array.reduce(function (a, b) {
      return a + b;
    }, 0);

    return sum;
  }

  function getTotalBalance(): string {
    const currencies = Object.entries(
      // @ts-ignore
      accounts.groupBy((x: AccountDto) => x.currency)
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
        const currency = entry[0];
        const accounts = entry[1] as AccountDto[];

        const total = accounts.map((e) => +e.balance.amount);
        const sum = sumArray(total);

        const money = Money.fromCurrencyCode({
          amount: sum,
          currencyCode: currency,
        });
        return money.format();
      });
      return balances.join(" + ");
    } else {
      // Don't display anything. Too many balances
      return "";
    }
  }

  return (
    <GroupHeader
      title={getAccountTypeTitle(accountType)}
      rightContent={getTotalBalance()}
    />
  );
}
