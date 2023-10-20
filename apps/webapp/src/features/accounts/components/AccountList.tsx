import { Account, AccountType } from "../models/Account";
import "core-js/actual/array/group-by";
import "core-js/actual/array/group-by-to-map";
import { AccountRow } from "./AccountRow";
import { AccountsListHeader } from "./AccountsListHeader";
import { Stack } from "@mantine/core";

interface Props {
  accounts: Account[];
}

// export function AccountsList({ accounts }: Props) {
//   const data: Map<string, Account[]> = accounts.groupByToMap((account: Account) => {
//     return account.account_type;
//   });

//   let reactNodes = [];
//   for (let [key, value] of data) {
//     reactNodes.push(<p>{key}</p>);
//     reactNodes.push(value.map((x) => <AccountRow key={x.id} account={x} />));
//   }

//   return <>{reactNodes}</>;
// }

function compareAccountTypes(a: string, b: string) {
  if (a === b) {
    return 0;
  }

  if (a === AccountType.UNKNOWN) {
    return 1;
  }

  if (b === AccountType.UNKNOWN) {
    return -1;
  }

  return a.localeCompare(b);
}

export function AccountsList({ accounts }: Props) {
  // @ts-ignore
  const data = accounts.groupBy((account: Account) => {
    return account.account_type;
  });

  return (
    <>
      {Object.entries(data)
        .sort((a, b) => {
          return compareAccountTypes(a[0], b[0]);
        })
        .map(([key, value]) => (
          <Stack>
            <AccountsListHeader
              accountType={key as AccountType}
              accounts={value as Account[]}
            />
            <p>
              {(value as Account[]).map((account: Account) => (
                <AccountRow key={account.id} account={account} />
              ))}
            </p>
          </Stack>
        ))}
    </>
  );
}
