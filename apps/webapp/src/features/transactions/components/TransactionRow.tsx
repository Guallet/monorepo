import { AccountAvatar } from "@/components/AccountAvatar/AccountAvatar";
import { CategoryAvatar } from "@/components/Categories/CategoryAvatar";
import { TransactionDto } from "@guallet/api-client";
import { Money } from "@guallet/money";
import { Group, Stack, Text } from "@mantine/core";
import { useMemo } from "react";

type AvatarType = "account" | "category";

interface TransactionRowProps {
  transaction: TransactionDto;
  avatarType: AvatarType;
  showNotes?: boolean;
  onClick?: (transaction: TransactionDto) => void;
}

export function TransactionRow({
  transaction,
  avatarType = "account",
  showNotes = false,
  onClick,
}: Readonly<TransactionRowProps>) {
  const money = useMemo(
    () =>
      Money.fromCurrencyCode({
        amount: transaction.amount,
        currencyCode: transaction.currency,
      }),
    [transaction]
  );

  return (
    <Group
      justify="space-between"
      align="center"
      {...(onClick && {
        onClick: () => onClick(transaction),
        style: { cursor: "pointer" },
      })}
    >
      {avatarType === "category" ? (
        <CategoryAvatar categoryId={transaction.categoryId} />
      ) : (
        <AccountAvatar accountId={transaction.accountId} />
      )}
      <Stack
        style={{
          flexGrow: 1,
        }}
      >
        <Text lineClamp={1}>{transaction.description}</Text>
        {showNotes && transaction.notes && (
          <Text lineClamp={1} style={{ fontWeight: "300" }}>
            {transaction.notes}
          </Text>
        )}
      </Stack>
      <Text style={{ fontWeight: "bold" }}>{money?.format()}</Text>
    </Group>
  );
}
