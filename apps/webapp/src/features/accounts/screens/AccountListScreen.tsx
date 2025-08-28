import { BaseScreen } from "@/components/Screens/BaseScreen";
import { AccountDto, AccountTypeDto } from "@guallet/api-client";
import { useAccounts } from "@guallet/api-react";
import { Stack, Button, Text, Card } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AccountRow } from "../components/AccountRow";
import { AccountsListHeader } from "../components/AccountsListHeader";
import { SearchableSectionListView, Section } from "@guallet/ui-react";

// We want the Current accounts first, then credit cards, then alphabetically, and last the unknown accounts
const compareAccountTypes = (
  a: Section<AccountDto>,
  b: Section<AccountDto>
) => {
  const typeA = a.data[0].type;
  const typeB = b.data[0].type;

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

export function AccountListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigate();
  const { accounts, isLoading } = useAccounts();

  const groupedAccounts = useMemo<Section<AccountDto>[]>(() => {
    if (isLoading || !accounts) {
      return [] as Section<AccountDto>[];
    }

    const grouped = Object.groupBy(accounts, (account) => account.type);
    const groups = Object.entries(grouped).map(([type, accounts]) => ({
      title: type,
      data: accounts,
    }));
    groups.sort(compareAccountTypes);
    return groups;
  }, [accounts, isLoading]);

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <Button
          onClick={() => {
            navigation({ to: "/accounts/new" });
          }}
        >
          Add new account
        </Button>
        <SearchableSectionListView<AccountDto>
          data={groupedAccounts}
          sectionWrapperTemplate={(children: ReactNode) => (
            <Card withBorder shadow="sm" radius="lg">
              {children}
            </Card>
          )}
          sectionHeaderTemplate={(section: Section<AccountDto>) => {
            return (
              <AccountsListHeader
                accountType={section.data[0].type}
                accounts={section.data}
              />
            );
          }}
          itemTemplate={(account: AccountDto) => (
            <AccountRow
              key={account.id}
              account={account}
              onClick={() => {
                navigation({
                  to: "/accounts/$id",
                  params: { id: account.id },
                });
              }}
            />
          )}
          emptyView={
            <Stack>
              <Text>
                {t(
                  "screens.accounts.list.emptyQuery",
                  "CFN: No bank accounts found"
                )}
              </Text>
            </Stack>
          }
        />
      </Stack>
    </BaseScreen>
  );
}
