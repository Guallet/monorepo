import { TransactionDto } from '@guallet/api-client';
import { useAccount, useTransactionInbox } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { IconInbox } from '@tabler/icons-react';
import { WidgetCard } from './WidgetCard';

function TransactionRow({
  transaction,
}: Readonly<{ transaction: TransactionDto }>) {
  const { account } = useAccount(transaction.accountId);

  const amount = Money.fromCurrencyCode({
    currencyCode: transaction.currency,
    amount: Math.abs(transaction.amount),
  });

  const isIncome = transaction.amount > 0;

  return (
    <div className="mb-2 rounded-lg border bg-muted/40 p-3 last:mb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="truncate text-sm font-semibold">
            {transaction.description}
          </p>
          <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {account?.name || "Unknown Account"}
          </span>
        </div>
        <p
          className={`whitespace-nowrap text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {isIncome ? '+' : '-'}{amount.format()}
        </p>
      </div>
    </div>
  );
}

export function TransactionsInboxWidget({
  onClick,
}: Readonly<{ onClick?: () => void }>) {
  const { transactions, metadata, isLoading } = useTransactionInbox({ pageSize: 10 });

  return (
    <WidgetCard
      title="Transaction Inbox"
      icon={<IconInbox size={20} />}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
            <p className="text-sm">
              You have{" "}
              <span className="text-lg font-bold text-blue-700">
                {metadata?.total ?? 0}
              </span>{" "}
              transactions to categorize
            </p>
          </div>

          {transactions.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto pr-1">
              {transactions.slice(0, 5).map((item: TransactionDto) => (
                <TransactionRow key={item.id} transaction={item} />
              ))}
            </div>
          ) : (
            <div className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
                No pending transactions.
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
