import { Avatar, Group, Text, UnstyledButton, rem } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
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
    <UnstyledButton
      pt={"md"}
      pb={"md"}
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
        <Text fw={700}>{money.format()}</Text>

        <IconChevronRight
          style={{ width: rem(14), height: rem(14) }}
          stroke={2}
        />
      </Group>
    </UnstyledButton>
  );
}
