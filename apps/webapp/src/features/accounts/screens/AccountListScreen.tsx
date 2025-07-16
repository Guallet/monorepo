import { BaseScreen } from "@/components/Screens/BaseScreen";
import { AccountDto } from "@guallet/api-client";
import { useAccounts } from "@guallet/api-react";
import {
  SearchableSectionListView,
  Section,
} from "@guallet/ui-react/ListView/SearchableSectionListView";
import { Stack, Button, Text, Card, Divider } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AccountRow } from "../components/AccountRow";
import { AccountsListHeader } from "../components/AccountsListHeader";

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
