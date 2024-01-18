import { Avatar, Group, Text, rem } from "@mantine/core";
import { Account } from "../models/Account";
import { IconChevronRight } from "@tabler/icons-react";
import { BaseButton } from "@/components/Buttons/BaseButton";
import { Money } from "@guallet/money";

interface Props {
  account: Account;
  onClick?: () => void;
}

export function AccountRow({ account, onClick }: Props) {
  const money = Money.withCurrencyCode(account.balance, account.currency);

  return (
    <BaseButton
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <Group grow gap="sm">
        <Avatar
          radius="xl"
          size={50}
          src={account.financial_institution?.logo}
          alt={account.financial_institution?.name}
        />
        <Text>{account.name}</Text>
        <Text>{money.format()}</Text>
        {/* <Text>{'Last update: ' + account.connection_details?.last_refreshed}</Text> */}
        {/* <Button radius="xl">Refresh</Button> */}

        <IconChevronRight
          style={{ width: rem(14), height: rem(14) }}
          stroke={1.5}
        />
      </Group>
    </BaseButton>
  );
}
