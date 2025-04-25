import EmptyState from "@/components/EmptyState/EmptyState";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { AccountDto } from "@guallet/api-client";
import { useAccounts } from "@guallet/api-react";
import { Stack, Space, Text, Card, Divider, Button } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AccountsHeader } from "@/features/accounts/components/AccountsHeader";
import { AccountsList } from "@/features/accounts/components/AccountList";
import { SearchableListView } from "@guallet/ui-react";
import { AccountRow } from "../components/AccountRow";

export function AccountListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigate();
  const { accounts, isLoading } = useAccounts();

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
        <SearchableListView
          items={accounts}
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
