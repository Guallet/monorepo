import { AppSection } from '@/components/Cards/AppSection';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import { useAccountTransactions } from '@guallet/api-react';
import { Button, Center, Loader, Stack, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

interface TransactionsSectionProps {
  accountId: string;
}

export function TransactionsSection({
  accountId,
}: Readonly<TransactionsSectionProps>) {
  const navigation = useNavigate();
  const { transactions, isLoading } = useAccountTransactions(accountId);

  const renderTransactionsContent = () => {
    if (isLoading) {
      return (
        <Center>
          <Loader />
        </Center>
      );
    }

    if (transactions.length === 0) {
      return (
        <Center>
          <Text>No transactions found for this month</Text>
        </Center>
      );
    }

    return (
      <Stack gap={0}>
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            avatarType={'category'}
          />
        ))}
      </Stack>
    );
  };

  return (
    <AppSection
      title="Latest transactions"
      headerActions={
        <Button
          variant="outline"
          onClick={() => {
            navigation({
              to: '/transactions',
              search: {
                accounts: [accountId],
                page: 1,
                pageSize: 50,
              },
            });
          }}
        >
          View all
        </Button>
      }
    >
      {renderTransactionsContent()}
    </AppSection>
  );
}
