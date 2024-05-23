import { Group, Text, UnstyledButton, rem } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { Money } from "@guallet/money";
import { AccountDto } from "@guallet/api-client";
import { InstitutionLogo } from "@/components/InstitutionLogo/InstitutionLogo";

interface Props {
  account: AccountDto;
  onClick?: () => void;
}

export function AccountRow({ account, onClick }: Props) {
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
        <InstitutionLogo
          radius="xl"
          size={50}
          institutionId={account.institutionId}
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
