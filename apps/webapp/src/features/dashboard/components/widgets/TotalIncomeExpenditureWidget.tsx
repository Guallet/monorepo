import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { WidgetCard } from './WidgetCard';
import { useTransactionsWithFilter } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { IconArrowUp, IconArrowDown, IconChartPie } from '@tabler/icons-react';

interface TotalIncomeExpenditureWidgetProps {
  startDate: string | null;
  endDate: string | null;
}

export function TotalIncomeExpenditureWidget({
  startDate,
  endDate,
}: Readonly<TotalIncomeExpenditureWidgetProps>) {
  const { transactions, isLoading } = useTransactionsWithFilter({
    page: 1,
    pageSize: 1000,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });

  // Calculate total income and expenditure
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const expenditure = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0),
  );

  const defaultCurrencyCode = useDefaultCurrency();
  const currencyCode = transactions.length
    ? transactions[0].currency
    : defaultCurrencyCode;

  const total = income + expenditure;
  const incomePercent = total > 0 ? (income / total) * 100 : 50;
  const balance = income - expenditure;
  const ringAngle = Math.max(0, Math.min(incomePercent, 100)) * 3.6;
  const ringBackground = `conic-gradient(#0d9488 0deg ${ringAngle}deg, #dc2626 ${ringAngle}deg 360deg)`;

  return (
    <WidgetCard title="Income vs Expenditure" icon={<IconChartPie size={20} />}>
      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div
            className="relative h-44 w-44 rounded-full"
            style={{ background: ringBackground }}
          >
            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-card">
              <div className="space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground">Balance</p>
                <p
                  className={`text-lg font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {balance >= 0 ? '+' : ''}
                  {Money.fromCurrencyCode({
                    amount: balance,
                    currencyCode,
                  }).format()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <IconArrowUp className="h-5 w-5 text-emerald-600" />
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Income
                </p>
              </div>
              <p className="text-xl font-bold text-emerald-700">
                {Money.fromCurrencyCode({
                  amount: income,
                  currencyCode,
                }).format()}
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <IconArrowDown className="h-5 w-5 text-red-600" />
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Expenditure
                </p>
              </div>
              <p className="text-xl font-bold text-red-700">
                {Money.fromCurrencyCode({
                  amount: expenditure,
                  currencyCode,
                }).format()}
              </p>
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
