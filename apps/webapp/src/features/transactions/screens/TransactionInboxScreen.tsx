import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useTransactionInbox } from "@guallet/api-react";
import { Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
import { InboxTransactionCard } from "../components/InboxTransactionCard";
import { useNavigate } from "@tanstack/react-router";

export function TransactionInboxScreen() {
  const navigate = useNavigate();
  const { transactions, isLoading } = useTransactionInbox();

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <Group>
          <Text>Debug only. Remove before release:</Text>
          <Button onClick={() => navigate({ to: "/transactions/oldinbox" })}>
            Navigate to old inbox
          </Button>
        </Group>
        <Group>
          <Title>Transactions Inbox</Title>
          <Badge>{transactions.length}</Badge>
        </Group>
        <Stack gap="xs">
          {transactions
            .toSorted((a, b) => b.date.getTime() - a.date.getTime())
            .map((transaction) => (
              <InboxTransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={() => {
                  console.log("Edit transaction:", transaction);
                }}
                onSaveChanges={() => {
                  console.log("Save changes for transaction:", transaction);
                }}
              />
            ))}
        </Stack>
      </Stack>
    </BaseScreen>
  );
}
