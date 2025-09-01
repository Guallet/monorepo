import { AccountAvatar } from "@/components/AccountAvatar/AccountAvatar";
import { CategoryAvatar } from "@/components/Categories/CategoryAvatar";
import { useLocale } from "@/i18n/useLocale";
import { InboxTransactionDto } from "@guallet/api-client";
import { useAccount, useCategory } from "@guallet/api-react";
import { Money } from "@guallet/money";
import {
  ActionIcon,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconEdit } from "@tabler/icons-react";

interface InboxTransactionCardProps {
  transaction: InboxTransactionDto;
  onEdit?: () => void;
  onSaveChanges?: () => void;
}

export function InboxTransactionCard({
  transaction,
  onEdit,
  onSaveChanges,
}: Readonly<InboxTransactionCardProps>) {
  const { account } = useAccount(transaction.accountId);
  const { category } = useCategory(
    transaction.processedCategoryId ?? transaction.categoryId
  );
  const { locale } = useLocale();

  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(transaction.date));

  return (
    <Card shadow="sm" radius="md" withBorder>
      <Stack gap={0}>
        <Group gap="xs">
          <AccountAvatar accountId={transaction.accountId} size={30} />
          <Text style={{ flexGrow: 1 }}>{account?.name}</Text>

          <Text fw={700}>{formattedDate}</Text>
        </Group>
        <Divider my="sm" />
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text style={{ flexGrow: 1 }}>{transaction.description}</Text>
          <Text fw={700}>
            {Money.fromCurrencyCode({
              currencyCode: transaction.currency,
              amount: transaction.amount,
            }).format()}
          </Text>
        </Group>

        <Divider my="sm" />
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs">
            <CategoryAvatar categoryId={transaction.categoryId} />
            <Text size="sm">{category?.name ?? "Unknown"}</Text>
          </Group>

          <Group gap="xs">
            <Tooltip label="Edit">
              <ActionIcon variant="outline" onClick={() => onEdit?.()}>
                <IconEdit />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Save">
              <ActionIcon variant="outline" onClick={() => onSaveChanges?.()}>
                <IconCheck />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
