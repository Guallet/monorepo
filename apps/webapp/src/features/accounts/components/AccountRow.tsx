import { Avatar, Group, Text, rem } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { BaseButton } from "@/components/Buttons/BaseButton";
import { Money } from "@guallet/money";
import { AccountDto } from "@guallet/api-client";
import { useInstitution } from "@guallet/api-react";

interface Props {
  account: AccountDto;
  onClick?: () => void;
}

export function AccountRow({ account, onClick }: Props) {
  const { institution } = useInstitution(account.institutionId);

  const money = Money.fromCurrencyCode({
    amount: account.balance.amount,
    currencyCode: account.currency,
  });

  return (
    <BaseButton
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <Group gap="sm">
        <Avatar
          radius="xl"
          size={50}
          src={institution?.image_src}
          alt={institution?.name}
        />
        <Text
          style={{
            flex: 1,
          }}
        >
          {account.name}
        </Text>
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
