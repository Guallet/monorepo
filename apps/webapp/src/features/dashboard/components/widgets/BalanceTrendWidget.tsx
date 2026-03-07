import { useTransactionsWithFilter } from '@guallet/api-react';
import { LineChart } from '@mantine/charts';
import { IconChartLine } from '@tabler/icons-react';
import { useMemo } from 'react';
import { WidgetCard } from './WidgetCard';

interface BalanceTrendWidgetProps {
  startDate: string | null;
  endDate: string | null;
}

export function BalanceTrendWidget({
  startDate,
  endDate,
}: Readonly<BalanceTrendWidgetProps>) {
  const { transactions, isLoading } = useTransactionsWithFilter({
    page: 1,
    pageSize: 1000,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });

  const { sampledData, hasPositiveTrend } = useMemo(() => {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Calculate cumulative balance over time without reassigning after render
    const balanceData = sortedTransactions.reduce<
      Array<{ date: string; balance: number }>
    >((acc, transaction) => {
      const previousBalance = acc.at(-1)?.balance ?? 0;
      const nextBalance = previousBalance + transaction.amount;

      acc.push({
        date: new Date(transaction.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
        }),
        balance: nextBalance,
      });

      return acc;
    }, []);

    // Group by date to avoid duplicate dates (aggregate transactions on same day)
    const aggregatedData = balanceData.reduce(
      (acc, item) => {
        const existing = acc.find((d) => d.date === item.date);
        if (existing) {
          existing.balance = item.balance; // Use the last balance of the day
        } else {
          acc.push(item);
        }
        return acc;
      },
      [] as typeof balanceData,
    );

    // Sample data if we have too many points (keep max 30 points for readability)
    const sampled =
      aggregatedData.length > 30
        ? aggregatedData.filter(
            (_, index) =>
              index === 0 ||
              index === aggregatedData.length - 1 ||
              index % Math.ceil(aggregatedData.length / 30) === 0,
          )
        : aggregatedData;

    const positiveTrend =
      sampled.length > 1 &&
      (sampled.at(-1)?.balance ?? 0) > (sampled.at(0)?.balance ?? 0);

    return { sampledData: sampled, hasPositiveTrend: positiveTrend };
  }, [transactions]);

  if (isLoading) {
    return (
      <WidgetCard title="Balance Trend" icon={<IconChartLine size={20} />}>
        <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      </WidgetCard>
    );
  }

  const chartContent =
    sampledData.length > 0 ? (
      <div className="space-y-2">
        <LineChart
          h={250}
          data={sampledData}
          dataKey="date"
          series={[
            {
              name: 'balance',
              color: hasPositiveTrend ? 'teal.6' : 'red.6',
              label: 'Balance',
            },
          ]}
          curveType="natural"
          connectNulls
          strokeWidth={3}
          dotProps={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
          activeDotProps={{ r: 6, strokeWidth: 2 }}
          gridAxis="xy"
          withLegend={false}
          withTooltip
          tooltipAnimationDuration={200}
          yAxisProps={{
            domain: ['dataMin - 100', 'dataMax + 100'],
          }}
          style={{
            backgroundColor: 'hsl(var(--muted))',
            borderRadius: '0.75rem',
            padding: '12px',
          }}
        />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Balance trend over selected period
        </p>
      </div>
    ) : (
      <div className="flex h-[250px] items-center justify-center">
        <div className="space-y-2 text-center">
          <IconChartLine className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No transaction data available.
          </p>
        </div>
      </div>
    );

  return (
    <WidgetCard title="Balance Trend" icon={<IconChartLine size={20} />}>
      {chartContent}
    </WidgetCard>
  );
}
