import { WidgetCard } from './WidgetCard';
import { useTransactionsWithFilter } from '@guallet/api-react';
import { Loader, useMantineTheme, Center, Stack, Text } from '@mantine/core';
import { IconChartLine } from '@tabler/icons-react';
import { LineChart } from '@mantine/charts';
import { useMemo } from 'react';

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

  const theme = useMantineTheme();

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
        <Center h={250}>
          <Loader size="md" />
        </Center>
      </WidgetCard>
    );
  }

  const chartContent =
    sampledData.length > 0 ? (
      <Stack gap="xs">
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
          dotProps={{ r: 4, strokeWidth: 2, fill: theme.white }}
          activeDotProps={{ r: 6, strokeWidth: 2 }}
          gridAxis="xy"
          withLegend={false}
          withTooltip
          tooltipAnimationDuration={200}
          yAxisProps={{
            domain: ['dataMin - 100', 'dataMax + 100'],
          }}
          style={{
            backgroundColor: theme.colors.gray[0],
            borderRadius: theme.radius.md,
            padding: '12px',
          }}
        />
        <Text size="xs" c="dimmed" ta="center" mt="xs">
          Balance trend over selected period
        </Text>
      </Stack>
    ) : (
      <Center h={250}>
        <Stack gap="xs" align="center">
          <IconChartLine size={48} color={theme.colors.gray[4]} />
          <Text size="sm" c="dimmed" ta="center">
            No transaction data available.
          </Text>
        </Stack>
      </Center>
    );

  return (
    <WidgetCard title="Balance Trend" icon={<IconChartLine size={20} />}>
      {chartContent}
    </WidgetCard>
  );
}
