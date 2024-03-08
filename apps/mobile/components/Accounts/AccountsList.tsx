// import "core-js";
import { AccountDto, AccountTypeDto } from "@guallet/api-client";
import { AccountsListHeader } from "./AccountsListHeader";
import { SectionList, View, RefreshControl } from "react-native";
import { AccountRow } from "./AccountRow";
import { Label, Spacing } from "@guallet/ui-react-native";

interface Props {
  accounts: AccountDto[];
  onAccountSelected: (account: AccountDto) => void;
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

  return a.localeCompare(b);
}

export type GroupedAccounts = {
  type: AccountTypeDto;
  // SectionList data requires the data array to be called "data". Otherwise it won't work
  data: AccountDto[];
}[];

export function AccountsList({ accounts, onAccountSelected }: Props) {
  const groupedData = accounts
    .reduce((result: GroupedAccounts, current: AccountDto) => {
      let typeGroup = result.find((x) => x.type === current.type);
      if (!typeGroup) {
        typeGroup = { type: current.type, data: [] };
        result.push(typeGroup);
      }
      typeGroup.data.push(current);
      return result;
    }, [])
    .sort((a, b) => compareAccountTypes(a.type, b.type));

  if (accounts.length === 0) {
    return <View></View>;
  }

  return (
    <SectionList
      sections={groupedData}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => {}} />
      }
      renderItem={({ item }) => (
        <AccountRow account={item} onClick={() => onAccountSelected(item)} />
      )}
      renderSectionHeader={(section) => (
        <AccountsListHeader
          accountType={section.section.type}
          accounts={section.section.data}
        />
      )}
    />
  );
}
