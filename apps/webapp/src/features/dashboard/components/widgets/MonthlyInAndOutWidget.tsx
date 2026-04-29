import { WidgetCard } from "./WidgetCard";
import { useTransactionsWithFilter } from "@guallet/api-react";
import { Box, Text, Loader, Center } from "@mantine/core";
import { IconChartBar } from "@tabler/icons-react";
import { BarChart } from "@mantine/charts";
import { useTheme } from "@guallet/ui-react";

interface MonthlyInAndOutWidgetProps {
  startDate: string | null;
  endDate: string | null;
}

export function MonthlyInAndOutWidget({
  startDate,
  endDate
}: Readonly<MonthlyInAndOutWidgetProps>) {
  const { transactions, isLoading } = useTransactionsWithFilter({
    page: 1,
    pageSize: 1000,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });

  const { colors, borderRadius } = useTheme();

  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });

    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthLabel, income: 0, spending: 0, date: date };
    }

    if (transaction.amount > 0) {
      acc[monthKey].income += transaction.amount;
    } else {
      acc[monthKey].spending += Math.abs(transaction.amount);
    }

    return acc;
  }, {} as Record<string, { month: string; income: number; spending: number; date: Date }>);

  const data = Object.values(monthlyData)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-6)
    .map(({ month, income, spending }) => ({
      month,
      income: Math.round(income),
      spending: Math.round(spending),
    }));

  return (
    <WidgetCard
      title="Income vs. Spending"
      icon={<IconChartBar size={20} />}
    >
      {isLoading ? (
        <Center h={300}>
          <Loader size="md" />
        </Center>
      ) : data.length > 0 ? (
        <Box
          style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            padding: 16,
          }}
        >
          <BarChart
            h={300}
            data={data}
            dataKey="month"
            series={[
              { name: 'income', label: 'Income', color: 'teal.6' },
              { name: 'spending', label: 'Spending', color: 'red.6' },
            ]}
            tickLine="y"
            gridAxis="xy"
            withLegend
            legendProps={{
              verticalAlign: 'top',
              height: 40,
            }}
            tooltipAnimationDuration={200}
            barProps={{ radius: [4, 4, 0, 0] }}
          />
        </Box>
      ) : (
        <Center h={300}>
          <Text size="sm" c="dimmed">
            No transaction data available.
          </Text>
        </Center>
      )}
    </WidgetCard>
  );
}