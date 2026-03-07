import { useAccounts } from '@guallet/api-react';
import { WidgetCard } from './WidgetCard';
import { Money } from '@guallet/money';
import { IconWallet, IconTrendingUp } from '@tabler/icons-react';

function getArraySum(array: number[]): number {
  let sum = 0;
  for (const element of array) {
    sum += Number(element);
  }
  return sum;
}

export function TotalWealthWidget() {
  const { accounts, isLoading } = useAccounts();

  const currencies = new Set(
    accounts.map((account) => account.balance.currency),
  );

  const balances = [...currencies].map((currency) => {
    const currencyAccounts = accounts
      .filter((x) => x.currency === currency)
      .map((account) => {
        return Number(account.balance.amount);
      });
    const balance = getArraySum(currencyAccounts);
    return Money.fromCurrencyCode({
      currencyCode: currency,
      amount: balance,
    });
  });

  return (
    <WidgetCard title="Total Wealth" icon={<IconWallet size={20} />}>
      {isLoading ? (
        <div className="flex h-[100px] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          {balances.map((balance) => {
            const isPositive = balance.amount >= 0;
            const accountCount = accounts.filter(
              (account) => account.currency === balance.currency.code,
            ).length;

            return (
              <div key={balance.currency.code} className="w-full text-center">
                <div className="mb-2 flex justify-center">
                  <IconTrendingUp
                    className={`h-6 w-6 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}
                  />
                </div>
                <p
                  className={`text-3xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {balance.format()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across {accountCount} accounts
                </p>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
