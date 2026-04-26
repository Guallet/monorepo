import { BaseScreen } from '@/components/Screens/BaseScreen';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useInfiniteTransactionInbox } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Badge, Center, Loader, Stack, Text } from '@mantine/core';
import { useIntersection } from '@mantine/hooks';
import { IconInbox } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { InboxTransactionCard } from '../components/InboxTransactionCard';

export function TransactionInboxScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const {
    transactions,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    metadata,
  } = useInfiniteTransactionInbox();

  const { ref, entry } = useIntersection({ threshold: 1 });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const totalCount = metadata?.total ?? transactions.length;

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.transactions.inbox.title', 'Inbox')}
      actions={
        totalCount > 0 ? (
          <Badge variant="filled" size="lg">
            {totalCount}
          </Badge>
        ) : null
      }
    >
      {!isLoading && transactions.length === 0 ? (
        <EmptyState
          illustration={
            <IconInbox
              size={48}
              strokeWidth={1.5}
              color="var(--mantine-color-gray-5)"
            />
          }
          title={t(
            'screens.transactions.inbox.emptyState.title',
            "You're all caught up",
          )}
          description={t(
            'screens.transactions.inbox.emptyState.description',
            'No transactions waiting for your review.',
          )}
        />
      ) : (
        <Stack gap={spacing.xs}>
          {transactions.map((transaction) => (
            <InboxTransactionCard
              key={transaction.id}
              transaction={transaction}
              onSaveChanges={() => {
                console.log('Save changes for transaction:', transaction);
              }}
            />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={ref}>
            {isFetchingNextPage && (
              <Center p="md">
                <Loader size="sm" />
              </Center>
            )}
            {!hasNextPage && transactions.length > 0 && (
              <Center p="md">
                <Text size="sm" c="dimmed">
                  {t(
                    'screens.transactions.inbox.allLoaded',
                    'All transactions loaded',
                  )}
                </Text>
              </Center>
            )}
          </div>
        </Stack>
      )}
    </BaseScreen>
  );
}
