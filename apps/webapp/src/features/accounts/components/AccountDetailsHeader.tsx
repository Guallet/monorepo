import { AccountAvatar } from "@/components/AccountAvatar/AccountAvatar";
import { AmountLabel } from "@/components/Amount/AmountLabel";
import { Group, Stack, Text } from "@mantine/core";
import { getAccountTypeTitleSingular } from "../models/Account";
import { useAccount } from "@guallet/api-react";
import { ConnectedAccountStatus } from "./ConnectedAccountStatus";

interface AccountDetailsHeaderProps {
  accountId: string;
}
export function AccountDetailsHeader({
  accountId,
}: Readonly<AccountDetailsHeaderProps>) {
  const { account } = useAccount(accountId);
  if (!account) {
    return null;
  }

  return (
    <Group justify="space-between" align="top">
      <AccountAvatar accountId={accountId} showTooltip />

      <Stack
        gap={0}
        style={{
          flexGrow: 1,
        }}
      >
        <Text size="lg" fw={700}>
          {account?.name}
        </Text>
        <Text size="sm" c="dimmed">
          {getAccountTypeTitleSingular(account.type)}
        </Text>
        {account.source === "synced" && (
          <ConnectedAccountStatus accountId={account.id} />
        )}
      </Stack>

      <AmountLabel
        amount={account.balance.amount}
        currencyCode={account.currency}
      />
    </Group>
  );
}
