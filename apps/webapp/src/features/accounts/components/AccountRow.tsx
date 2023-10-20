import { Avatar, Group, Text } from "@mantine/core";
import { Account } from "../models/Account";

interface Props {
  account: Account;
}

export function AccountRow({ account }: Props) {
  const currencyFormatter = Intl.NumberFormat(undefined, {
    style: "currency",
    currency: account.currency,
  });

  return (
    <Group grow gap="sm">
      {/* <Avatar src="avatar.png" alt={account.financial_institution?.name} /> */}
      <Avatar
        radius="xl"
        size={50}
        src={account.financial_institution?.logo}
        alt={account.financial_institution?.name}
      />
      <Text>{account.name}</Text>
      <Text>{currencyFormatter.format(account.balance)}</Text>
      {/* <Text>{'Last update: ' + account.connection_details?.last_refreshed}</Text> */}
      {/* <Button radius="xl">Refresh</Button> */}
    </Group>
  );
}
