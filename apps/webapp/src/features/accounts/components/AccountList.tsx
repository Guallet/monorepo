import "core-js";
import { AccountRow } from "./AccountRow";
import { AccountsListHeader } from "./AccountsListHeader";
import { Stack } from "@mantine/core";
import { AccountDto, AccountTypeDto } from "@guallet/api-client";

interface Props {
  accounts: AccountDto[];
  onAccountSelected: (account: AccountDto) => void;
}

// export function AccountsList({ accounts }: Props) {
//   const data: Map<string, Account[]> = accounts.groupByToMap((account: Account) => {
//     return account.type;
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

  if (a === AccountTypeDto.UNKNOWN) {
    return 1;
  }

  if (b === AccountTypeDto.UNKNOWN) {
    return -1;
  }

  return a.localeCompare(b);
}

export function AccountsList({ accounts, onAccountSelected }: Props) {
  // @ts-expect-error
  const data = accounts.groupBy((account: Account) => {
    return account.type;
  });

  return (
    <>
      {Object.entries(data)
        .sort((a, b) => {
          return compareAccountTypes(a[0], b[0]);
        })
        .map(([key, value]) => (
          <Stack key={key}>
            <AccountsListHeader
              accountType={key as AccountTypeDto}
              accounts={value as AccountDto[]}
            />
            <p>
              {(value as AccountDto[]).map((account: AccountDto) => (
                <AccountRow
                  key={account.id}
                  account={account}
                  onClick={() => {
                    onAccountSelected(account);
                  }}
                />
              ))}
            </p>
          </Stack>
        ))}
    </>
  );
}
