import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useInfiniteTransactionInbox } from '@guallet/api-react';
import { InboxTransactionCard } from '../components/InboxTransactionCard';
import { useEffect, useRef } from 'react';

export function TransactionInboxScreen() {
  const {
    transactions,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteTransactionInbox();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 1,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, transactions.length]);

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Transactions Inbox
          </h1>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
            {transactions.length}
          </span>
        </div>

        <div className="flex flex-col gap-2">
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

          {hasNextPage ? (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </BaseScreen>
  );
}
