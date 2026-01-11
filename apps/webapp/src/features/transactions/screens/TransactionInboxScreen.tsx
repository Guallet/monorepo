import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useInfiniteTransactionInbox } from '@guallet/api-react';
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { InboxTransactionCard } from '../components/InboxTransactionCard';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useIntersection } from '@mantine/hooks';

export function TransactionInboxScreen() {
  const navigate = useNavigate();
  const {
    transactions,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteTransactionInbox();

  const { ref, entry } = useIntersection({
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <Group>
          <Title>Transactions Inbox</Title>
          <Badge>{transactions.length}</Badge>
        </Group>
        <Stack gap="xs">
          {transactions.map((transaction) => (
            <InboxTransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={() => {
                console.log('Edit transaction:', transaction);
              }}
              onSaveChanges={() => {
                console.log('Save changes for transaction:', transaction);
              }}
            />
          ))}
          {hasNextPage && (
            <div ref={ref}>
              <Center p="md">
                {isFetchingNextPage && <Loader size="sm" />}
              </Center>
            </div>
          )}
        </Stack>
      </Stack>
    </BaseScreen>
  );
}
