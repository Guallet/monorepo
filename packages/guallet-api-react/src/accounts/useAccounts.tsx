import { AccountDto, AccountTypeDto } from "@guallet/api-client";
import { useQuery } from "@tanstack/react-query";
import { useGualletClient } from "./../GualletClientProvider";
import { useMemo } from "react";

const ACCOUNTS_QUERY_KEY = "accounts";

export function useAccounts() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.accounts.getAll();
    },
  });

  return {
    accounts:
      query.data?.filter((dto): dto is AccountDto => dto !== undefined) ?? [],
    ...query,
  };
}

export function useGroupedAccounts() {
  const { accounts, ...rest } = useAccounts();

  const groupedAccounts = useMemo(() => {
    const grouped = Object.groupBy(accounts, (account) => account.type);
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

export function useAccount(id: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.accounts.get(id);
    },
  });

  return {
    account: query.data ?? null,
    ...query,
  };
}

export function useConnectedAccount(id: string) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [ACCOUNTS_QUERY_KEY, id, "connected"],
    queryFn: async () => {
      return await gualletClient.accounts.getConnectedAccount(id);
    },
  });

  return {
    connectedAccount: query.data ?? null,
    ...query,
  };
}

const compareAccountTypes = (
  a: { type: string; accounts: AccountDto[] },
  b: { type: string; accounts: AccountDto[] }
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
