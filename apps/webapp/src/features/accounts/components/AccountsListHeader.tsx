import GroupHeader from "../../../components/GroupHeader/GroupHeader";
import { Account, AccountType } from "../models/Account";
import "core-js/actual/array/group-by";

function getAccountTypeTitle(type: AccountType): string {
  switch (type) {
    case AccountType.CURRENT_ACCOUNT:
      return "Current Accounts";
    case AccountType.CREDIT_CARD:
      return "Credit cards";
    case AccountType.INVESTMENT:
      return "Investment accounts";
    case AccountType.LOAN:
      return "Loans";
    case AccountType.MORTGAGE:
      return "Mortgages";
    case AccountType.PENSION:
      return "Pensions";
    case AccountType.SAVINGS:
      return "Saving accounts";

    default:
      return "Other";
  }
}

interface HeaderProps {
  accountType: AccountType;
  accounts: Account[];
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
      accounts.groupBy((x: Account) => x.currency)
    );

    if (currencies.length == 1) {
      // let currencyFormat = Intl.NumberFormat('en-GB', {
      const currencyFormatter = Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencies[0][0],
      });

      // Display Single Balance
      let total = accounts.map((e) => +e.balance);
      let sum = sumArray(total);

      return currencyFormatter.format(sum);
    } else if (currencies.length == 2) {
      // Display 2 Balances
      const balances = currencies.map((entry) => {
        const currency = entry[0];
        const accounts = entry[1] as Account[];

        let total = accounts.map((e) => +e.balance);
        let sum = sumArray(total);
        const currencyFormatter = Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currency,
        });
        return currencyFormatter.format(sum);
      });
      return balances.join(" + ");
    } else {
      // Dont' display anything. Too many balances
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
