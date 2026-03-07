import { AccountTypeDto } from '@guallet/api-client';
import { useAccounts } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { IconBuildingBank, IconCreditCard } from '@tabler/icons-react';
import { WidgetCard } from './WidgetCard';

export function CurrentAccountsWidget() {
  const { accounts, isLoading } = useAccounts();

  // Filter for current accounts and credit cards
  const currentAccounts = accounts.filter(
    (account) =>
      account.type === AccountTypeDto.CURRENT_ACCOUNT ||
      account.type === AccountTypeDto.CREDIT_CARD,
  );

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  } else if (currentAccounts.length > 0) {
    content = (
      <div className="space-y-3">
        {currentAccounts.map((account) => {
          const balance = Money.fromCurrencyCode({
            currencyCode: account.currency,
            amount: Number(account.balance.amount),
          });
          const isPositive = balance.amount >= 0;
          const isCreditCard = account.type === AccountTypeDto.CREDIT_CARD;

          return (
            <div
              key={account.id}
              className="rounded-lg border bg-muted/40 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isCreditCard ? (
                    <IconCreditCard className="h-4 w-4 text-blue-600" />
                  ) : (
                    <IconBuildingBank className="h-4 w-4 text-blue-600" />
                  )}
                  <p className="text-sm font-semibold">{account.name}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    isCreditCard
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCreditCard ? 'Credit' : 'Current'}
                </span>
              </div>
              <p
                className={`text-lg font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {balance.format()}
              </p>
              {account.institutionId ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {account.sourceName || 'Connected'}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  } else {
    content = (
      <div className="flex h-[150px] items-center justify-center">
        <div className="space-y-2 text-center">
          <IconBuildingBank className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No current accounts found.</p>
        </div>
      </div>
    );
  }

  return (
    <WidgetCard title="Current Accounts" icon={<IconBuildingBank size={20} />}>
      {content}
    </WidgetCard>
  );
}
