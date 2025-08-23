import { AccountAvatar } from "@/components/AccountAvatar/AccountAvatar";
import { TransactionDto } from "@guallet/api-client";
import { useAccount } from "@guallet/api-react";
import { Money } from "@guallet/money";
import { Group, Stack, Text } from "@mantine/core";
import { useMemo } from "react";

interface TransactionRowProps {
  transaction: TransactionDto;
  onClick?: (transaction: TransactionDto) => void;
}

export function TransactionRow({
  transaction,
  onClick,
}: Readonly<TransactionRowProps>) {
  const { account } = useAccount(transaction.accountId);

  const money = useMemo(
    () =>
      account &&
      Money.fromCurrencyCode({
        amount: transaction.amount,
        currencyCode: account.currency,
      }),
    [account, transaction.amount]
  );

  return (
    <Group
      justify="center"
      {...(onClick && {
        onClick: () => onClick(transaction),
        style: { cursor: "pointer" },
      })}
    >
      <AccountAvatar accountId={transaction.accountId} />
      <Stack justify="center" align="center">
        <Text lineClamp={1}>{transaction.description}</Text>
        {transaction.notes && (
          <Text lineClamp={1} style={{ fontWeight: "300" }}>
            {transaction.notes}
          </Text>
        )}
      </Stack>
      <Text style={{ fontWeight: "bold" }}>{money?.format()}</Text>
    </Group>
  );
}
