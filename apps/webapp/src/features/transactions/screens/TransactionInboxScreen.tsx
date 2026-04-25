import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useInfiniteTransactionInbox } from '@guallet/api-react';
import { Badge, Center, Loader, Stack } from '@mantine/core';
import { InboxTransactionCard } from '../components/InboxTransactionCard';
import { useEffect } from 'react';
import { useIntersection } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';

export function TransactionInboxScreen() {
  const { t } = useTranslation();
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
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.transactions.inbox.title', 'Transactions Inbox')}
      actions={<Badge>{transactions.length}</Badge>}
    >
      <Stack>
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
