import { useAccounts, useCategories, useTransactions } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { IconArrowDown, IconArrowUp, IconReceipt } from '@tabler/icons-react';
import { WidgetCard } from './WidgetCard';

export function LastTransactionsWidget() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const isLoading = transactionsLoading || accountsLoading || categoriesLoading;

  // Get last 10 transactions sorted by date
  const lastTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  } else if (lastTransactions.length > 0) {
    content = (
      <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
        {lastTransactions.map((transaction) => {
          const account = accounts.find((a) => a.id === transaction.accountId);
          const category = categories.find(
            (c) => c.id === transaction.categoryId,
          );
          const isIncome = transaction.amount > 0;

          const amount = Money.fromCurrencyCode({
            currencyCode: transaction.currency,
            amount: Math.abs(transaction.amount),
          });

          return (
            <div
              key={transaction.id}
              className="rounded-lg border bg-muted/40 p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {isIncome ? (
                    <IconArrowUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <IconArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <p className="truncate text-sm font-semibold">
                    {transaction.description}
                  </p>
                </div>
                <p
                  className={`whitespace-nowrap text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {isIncome ? '+' : '-'}{amount.format()}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {account ? (
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {account.name}
                    </span>
                  ) : null}
                  {category ? (
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{
                        backgroundColor: category.colour || '#6b7280',
                      }}
                    >
                      {category.name}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  } else {
    content = (
      <div className="flex h-[300px] items-center justify-center">
        <div className="space-y-2 text-center">
          <IconReceipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No transactions found.</p>
        </div>
      </div>
    );
  }

  return (
    <WidgetCard title="Recent Transactions" icon={<IconReceipt size={20} />}>
      {content}
    </WidgetCard>
  );
}
